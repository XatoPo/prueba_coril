# Modelo de Dominio Financiero — Coril Portfolio

Este documento describe el modelo conceptual y las decisiones de diseño que gobiernan la representación de las inversiones en Fondos Mutuos dentro del sistema.

---

## 1. Conceptos Fundamentales del Dominio

Los Fondos Mutuos operan sobre el concepto de **Cuotas** (shares), no sobre saldos monetarios directos. Esta distinción es crítica para modelar correctamente el sistema:

### Fondo (Fund)
Unidad de inversión colectiva. Define el instrumento al que pertenece cada operación. En el sistema, actúa como catálogo inmutable referenciado por `Balance` y `Movement`.

```
Fund
├── id         VARCHAR(50)  — Identificador de negocio (ej. "FND-001")
├── name       VARCHAR(100) — Nombre comercial del fondo
└── currency   VARCHAR(3)   — Moneda de denominación (PEN, USD)
```

### Cuota y Valor Cuota

- **Cuota (share):** Unidad de participación en el patrimonio del fondo. Al suscribir, el inversionista entrega dinero a cambio de cuotas; al rescatar, entrega cuotas a cambio de dinero.
- **Valor Cuota (shareValue):** Precio de cada cuota. Se calcula **exclusivamente al cierre del mercado diario**, aplicando la valorización del portafolio del fondo. Durante el horario operativo, el valor cuota del día siguiente es desconocido.

Esta mecánica impone el ciclo de vida de las transacciones descrito en la siguiente sección.

---

## 2. Ciclo de Vida de un Movimiento (Movement)

```
Ingreso de orden
      │
      ▼
  [PENDING] ─── cierre de mercado ───▶ [EXECUTED]
      │
      └──── rechazo (compliance / fondos insuficientes) ───▶ [REJECTED]
```

### Estados y sus implicaciones contables

| Estado | `shares` | `shareValue` | Impacto en `Balance` |
|---|---|---|---|
| `PENDING` | `0.0000` | `0.0000` | **Ninguno.** La operación está en tránsito; no altera la posición del inversionista. |
| `EXECUTED` | `> 0.0000` | `> 0.0000` | **Total.** Las cuotas se acreditan o debitan del saldo consolidado. |
| `REJECTED` | `0.0000` | `0.0000` | **Ninguno.** La operación es anulada sin impacto contable ni en cuotas. |

**Decisión de diseño — Simplificación del ciclo de estados:**  
En sistemas de fondos mutuos productivos existen estados intermedios adicionales (ej. `IN_SETTLEMENT`, `AWAITING_FUNDS`, `COMPLIANCE_REVIEW`). Para este MVP se adoptó un ciclo de tres estados que modela con fidelidad los tres momentos relevantes para el inversionista: *"en espera"*, *"confirmado"* y *"no procesado"*. Esta simplificación reduce la complejidad sin sacrificar la precisión del modelo desde la perspectiva del usuario final.

### Campos del movimiento

```
Movement
├── id              BIGINT          — Identificador autoincremental
├── client_id       VARCHAR(50)     — Identificador del inversionista
├── fund_id         VARCHAR(50)     — FK al catálogo Fund
├── type            ENUM            — SUBSCRIPTION | REDEMPTION
├── amount          DECIMAL(19,4)   — Monto monetario de la operación
├── shares          DECIMAL(19,4)   — Cuotas calculadas al cierre
├── share_value     DECIMAL(19,4)   — Valor cuota aplicado al cierre
├── transaction_date TIMESTAMP      — Fecha y hora de la orden
├── status          ENUM            — PENDING | EXECUTED | REJECTED
└── created_at      TIMESTAMP       — Auditoría: registro del ingreso
```

---

## 3. Posición Global del Inversionista (Balance)

```
Balance
├── id              BIGINT          — Identificador autoincremental
├── client_id       VARCHAR(50)     — Identificador del inversionista
├── fund_id         VARCHAR(50)     — FK al catálogo Fund
├── total_shares    DECIMAL(19,4)   — Cuotas netas vigentes (EXECUTED)
├── invested_amount DECIMAL(19,4)   — Monto neto invertido
├── last_updated    TIMESTAMP       — Última actualización del saldo
└── UNIQUE(client_id, fund_id)      — Un saldo por fondo por inversionista
```

**Decisión de diseño — Tabla de saldo separada del historial:**  
El saldo del inversionista podría calcularse en tiempo de consulta mediante un `SUM` sobre la tabla `movement` filtrado por `status = 'EXECUTED'`. Sin embargo, esta aproximación escala deficientemente cuando el historial crece: cada consulta de la vista principal implicaría recorrer potencialmente miles de registros.

Se adoptó el patrón de **snapshot materializado**: una tabla `balance` independiente mantiene la posición actual pre-calculada. Esta tabla se actualiza al procesar el cierre de mercado diario, dejando la consulta de saldo como una lectura directa de O(1) por fondo. El historial de movimientos queda intacto como el registro de verdad (`source of truth`), mientras que el balance es su proyección optimizada para lectura.

---

## 4. Precisión Decimal — Fundamento Técnico

Todos los campos monetarios y de cuotas utilizan el tipo `DECIMAL(19,4)` en la base de datos y `java.math.BigDecimal` en la capa de aplicación.

**¿Por qué no `FLOAT` o `DOUBLE`?**

Los tipos de punto flotante (`float`, `double`) siguen el estándar IEEE 754, que representa números en base 2. Ciertos valores decimales exactos —como `0.1`— **no tienen representación exacta en base 2**, lo que introduce errores de redondeo acumulativos:

```java
// Ejemplo de error con punto flotante:
double a = 0.1 + 0.2;
System.out.println(a); // 0.30000000000000004  ← error inaceptable en finanzas
```

Con `BigDecimal`, la precisión es exacta e independiente de la representación binaria:

```java
BigDecimal a = new BigDecimal("0.1").add(new BigDecimal("0.2"));
System.out.println(a); // 0.3  ← correcto
```

**Justificación de la escala `(19,4)`:**

- **19 dígitos totales:** Cubre montos de hasta 999,999,999,999,999.9999, suficiente para cualquier portafolio individual.
- **4 decimales:** Permite representar cuotas con la granularidad requerida por la regulación de fondos mutuos, donde el precio de cuota se calcula con 4 cifras significativas.

Esta decisión aplica consistentemente en todas las capas del sistema: esquema SQL (`DECIMAL(19,4)`), entidades JPA (`BigDecimal`), records de respuesta (`BigDecimal`) y serialización JSON.

---

## 5. Relación entre Entidades

```
Fund (1) ─────────────────────────── (N) Balance
 │                                         │
 │                                    por client_id
 │
 └─────────────────────────────────── (N) Movement
                                           │
                                      por client_id
```

- Un `Fund` puede tener múltiples `Balance` (uno por inversionista que participa en él).
- Un `Fund` puede tener múltiples `Movement` (toda la historia de operaciones de todos los inversionistas).
- Cada `Balance` es **único por par (client_id, fund_id)**, garantizado por la restricción `UNIQUE`.
- La relación entre `Balance` y `Movement` es **implícita por dominio**: el valor de `Balance.total_shares` es la suma de cuotas de los `Movement` en estado `EXECUTED` para ese cliente y fondo.

---

## 6. Índices de Base de Datos

Se definen dos índices estratégicos sobre la tabla `movement`:

```sql
CREATE INDEX idx_movement_client_fund ON movement(client_id, fund_id);
CREATE INDEX idx_movement_status      ON movement(status);
```

- **`idx_movement_client_fund`**: Optimiza la consulta principal del historial, que siempre filtra por `client_id` y opcionalmente por `fund_id`.
- **`idx_movement_status`**: Optimiza el filtrado por estado (`?status=PENDING`), que es el patrón de acceso más frecuente desde la interfaz.
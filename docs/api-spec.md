# Contrato de API REST — Coril Portfolio

**Versión:** 1.0  
**Base URL:** `http://localhost:8081/api/v1`  
**Protocolo:** HTTP/1.1 · JSON  
**Autenticación:** Ninguna en esta versión (MVP). El identificador del inversionista se transmite como `{investorId}` en la ruta.

---

## Convenciones Generales

- Todos los timestamps se representan en formato ISO-8601 local: `"yyyy-MM-ddTHH:mm:ss"`.
- Los campos monetarios y de cuotas se serializan como números decimales con 4 cifras de precisión (`DECIMAL(19,4)`).
- La API responde exclusivamente en `application/json`.
- Los errores siguen un formato unificado descrito en la sección [Manejo de Errores](#manejo-de-errores).

---

## Endpoints

### 1. Posición Global del Inversionista

Retorna la posición financiera actual del inversionista, consolidada por fondo. Cada entrada refleja exclusivamente las transacciones en estado `EXECUTED`; las operaciones `PENDING` o `REJECTED` no alteran estos valores.

```
GET /api/v1/investors/{investorId}/balances
```

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `investorId` | `string` | Sí | Identificador único del inversionista (ej. `INV-0001`) |

**Respuesta exitosa — `200 OK`:**

```json
[
  {
    "id": 1,
    "fundId": "FND-001",
    "fundName": "Coril Efectivo Soles FM",
    "totalShares": 240.0000,
    "investedAmount": 2400.0000,
    "currency": "PEN",
    "lastUpdated": "2026-05-25T16:47:00"
  },
  {
    "id": 2,
    "fundId": "FND-002",
    "fundName": "Coril Acciones Dólares FM",
    "totalShares": 165.0000,
    "investedAmount": 8250.0000,
    "currency": "USD",
    "lastUpdated": "2026-05-25T16:47:00"
  },
  {
    "id": 3,
    "fundId": "FND-003",
    "fundName": "Coril Crecimiento Mixto FM",
    "totalShares": 156.0000,
    "investedAmount": 3120.0000,
    "currency": "PEN",
    "lastUpdated": "2026-05-25T16:47:00"
  }
]
```

**Descripción de campos:**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `Long` | Identificador interno del registro de saldo |
| `fundId` | `String` | Identificador del fondo (clave foránea al catálogo `fund`) |
| `fundName` | `String` | Nombre comercial del fondo mutuo |
| `totalShares` | `BigDecimal` | Cuotas totales vigentes (sólo de operaciones `EXECUTED`) |
| `investedAmount` | `BigDecimal` | Monto total invertido neto en la moneda del fondo |
| `currency` | `String` | Código ISO 4217 de la moneda (`PEN`, `USD`) |
| `lastUpdated` | `LocalDateTime` | Marca temporal de la última actualización del saldo |

**Respuesta — inversionista sin posición activa — `200 OK`:**

```json
[]
```

> Un arreglo vacío indica que el inversionista no mantiene saldo en ningún fondo. No se considera un error.

---

### 2. Historial de Movimientos

Retorna el historial de operaciones del inversionista, ordenado cronológicamente de forma descendente (`transaction_date DESC`). Admite un filtro opcional por estado para segmentar las consultas.

```
GET /api/v1/investors/{investorId}/movements
GET /api/v1/investors/{investorId}/movements?status={STATUS}
```

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `investorId` | `string` | Sí | Identificador único del inversionista |

**Query Parameters:**

| Parámetro | Tipo | Requerido | Valores válidos | Descripción |
|---|---|---|---|---|
| `status` | `string` | No | `PENDING`, `EXECUTED`, `REJECTED` | Filtra el historial por estado de la operación. Si se omite, retorna todos los estados. |

**Respuesta exitosa — `200 OK` (con filtro `?status=PENDING`):**

```json
[
  {
    "id": 91,
    "fundId": "FND-001",
    "fundName": "Coril Efectivo Soles FM",
    "type": "SUBSCRIPTION",
    "amount": 150.0000,
    "shares": 0.0000,
    "shareValue": 0.0000,
    "currency": "PEN",
    "status": "PENDING",
    "transactionDate": "2026-05-25T16:47:00"
  },
  {
    "id": 93,
    "fundId": "FND-001",
    "fundName": "Coril Efectivo Soles FM",
    "type": "REDEMPTION",
    "amount": 200.0000,
    "shares": 0.0000,
    "shareValue": 0.0000,
    "currency": "PEN",
    "status": "PENDING",
    "transactionDate": "2026-05-25T16:47:00"
  }
]
```

**Descripción de campos:**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `Long` | Identificador interno del movimiento |
| `fundId` | `String` | Identificador del fondo asociado |
| `fundName` | `String` | Nombre comercial del fondo |
| `type` | `MovementType` | Tipo de operación: `SUBSCRIPTION` (aporte) o `REDEMPTION` (rescate) |
| `amount` | `BigDecimal` | Monto de la operación en la moneda del fondo |
| `shares` | `BigDecimal` | Cuotas asignadas. `0.0000` si el estado es `PENDING` o `REJECTED` |
| `shareValue` | `BigDecimal` | Valor cuota en el momento de ejecución. `0.0000` si no fue procesada |
| `currency` | `String` | Código ISO 4217 de la moneda |
| `status` | `MovementStatus` | Estado de la operación: `PENDING`, `EXECUTED` o `REJECTED` |
| `transactionDate` | `LocalDateTime` | Fecha y hora de la operación |

**Semántica del campo `shares` por estado:**

| Estado | `shares` | Significado |
|---|---|---|
| `PENDING` | `0.0000` | El cierre de mercado aún no asignó cuotas |
| `EXECUTED` | `> 0.0000` | Cuotas calculadas y acreditadas al saldo |
| `REJECTED` | `0.0000` | Operación rechazada sin impacto contable |

---

## Manejo de Errores

La API centraliza el control de errores mediante la clase `GlobalExceptionHandler` (patrón `@ControllerAdvice`), garantizando que todos los errores —independientemente del origen— devuelvan una estructura consistente.

**Formato unificado de error:**

```json
{
  "code": "INVALID_STATUS",
  "message": "El valor 'PROCESANDO' no es un estado válido. Los valores aceptados son: PENDING, EXECUTED, REJECTED.",
  "timestamp": "2026-05-25T16:52:10"
}
```

**Descripción de campos:**

| Campo | Tipo | Descripción |
|---|---|---|
| `code` | `String` | Código de error de negocio, legible por sistemas consumidores |
| `message` | `String` | Descripción técnica del error, orientada al desarrollador |
| `timestamp` | `LocalDateTime` | Marca temporal exacta del error para correlación con logs |

**Códigos de error frecuentes:**

| HTTP Status | `code` | Escenario |
|---|---|---|
| `400 Bad Request` | `INVALID_STATUS` | El valor del parámetro `?status` no coincide con el enum `MovementStatus` |
| `404 Not Found` | `INVESTOR_NOT_FOUND` | El `investorId` no existe en el sistema *(extensión futura)* |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Error inesperado del servidor |

**Fundamento del diseño:**  
El formato estandarizado permite a los clientes (frontend, integraciones B2B) implementar un único manejador de errores en lugar de parsear mensajes de texto variables. El campo `code` está diseñado para ser estable entre versiones, facilitando la internacionalización de mensajes de error en el frontend.

---

## Configuración CORS

La API acepta peticiones cross-origin únicamente desde los orígenes declarados en `WebConfig.java`:

| Origen permitido | Entorno |
|---|---|
| `http://localhost:5173` | Desarrollo (Vite dev server) |
| `http://localhost:3000` | Desarrollo alternativo |

Los métodos permitidos son `GET` y `OPTIONS`. En un entorno productivo, esta configuración debe restringirse al dominio del frontend desplegado.
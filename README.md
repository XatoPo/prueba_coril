# Coril Portfolio — Gestión de Portafolio de Fondos Mutuos

Sistema MVP para la consulta y seguimiento de inversiones en Fondos Mutuos. Permite al inversionista visualizar en un único panel su posición financiera consolidada y el historial completo de operaciones, sin depender de canales de atención ni esperar estados de cuenta periódicos.

---

## Arquitectura del Sistema

El proyecto adopta una estructura de **monorepo desacoplado**: dos unidades desplegables independientes que se comunican a través de una API REST. Este diseño garantiza que cada componente pueda evolucionar, testearse y desplegarse de forma autónoma.

```
prueba_coril/
├── backend_coril/          # API RESTful — Java 21 · Spring Boot 4 · H2
├── frontend_coril/         # SPA — React 18 · Vite · Vanilla CSS
├── docs/                   # Documentación técnica detallada
│   ├── api-spec.md         # Contrato de endpoints y formatos de respuesta
│   ├── domain-model.md     # Modelo de negocio: Fondos, Cuotas y Estados
│   └── architecture-decisions.md  # Registro de decisiones arquitectónicas
└── .github/workflows/      # Pipelines de integración continua
    ├── backend-ci.yml
    └── frontend-ci.yml
```

**Flujo de comunicación:**

```
[Navegador]  ──HTTP──▶  [Vite SPA :5173]  ──fetch──▶  [Spring Boot API :8081]
                                                               │
                                                         [H2 In-Memory DB]
```

---

## Requisitos Previos

| Herramienta | Versión mínima | Verificación |
|---|---|---|
| JDK (Temurin recomendado) | 21 | `java -version` |
| Node.js | 18 LTS | `node -v` |
| Git | cualquiera | `git --version` |

No se requiere instalación de base de datos. El motor H2 está embebido y se inicializa automáticamente en cada arranque.

---

## Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/XatoPo/prueba_coril.git
cd prueba_coril
```

### 2. Iniciar el Backend

```bash
cd backend_coril

# En Linux/macOS:
./mvnw spring-boot:run

# En Windows (PowerShell):
.\mvnw spring-boot:run
```

El proceso compilará el proyecto, ejecutará los scripts de inicialización (`schema.sql` y `data.sql`) y levantará el servidor en:

- **API base:** `http://localhost:8081/api/v1/`
- **Consola H2** *(auditoría de datos)*: `http://localhost:8081/h2-console`
  - JDBC URL: `jdbc:h2:mem:coril_portfolio_db`
  - Usuario: `sa` · Contraseña: *(vacía)*

### 3. Iniciar el Frontend

Abrir una nueva terminal desde la raíz del repositorio:

```bash
cd frontend_coril
npm install
npm run dev
```

La aplicación quedará disponible en: **`http://localhost:5173`**

---

## Configuración de Entorno

Todas las variables críticas del backend están externalizadas en `application.yml` con valores por defecto para el entorno local. Para sobreescribirlos en producción, basta con definir las siguientes variables de entorno:

| Variable | Default local | Descripción |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:h2:mem:coril_portfolio_db` | URL de conexión al motor de datos |
| `SPRING_DATASOURCE_USERNAME` | `sa` | Usuario de base de datos |
| `SPRING_DATASOURCE_PASSWORD` | *(vacío)* | Contraseña de base de datos |
| `SERVER_PORT` | `8081` | Puerto de escucha del servidor |

El frontend consume la URL del backend a través de la variable de entorno de Vite `VITE_API_BASE_URL`, definida en `frontend_coril/.env`.

---

## Datos de Demostración

Al arrancar, la API carga automáticamente un dataset determinista para el inversionista **`INV-0001`**:

| Fondo | Moneda | Cuotas Actuales | Monto Invertido |
|---|---|---|---|
| Coril Efectivo Soles FM | PEN | 240.0000 | S/ 2,400.00 |
| Coril Acciones Dólares FM | USD | 165.0000 | USD 8,250.00 |
| Coril Crecimiento Mixto FM | PEN | 156.0000 | S/ 3,120.00 |

El historial incluye **93 movimientos** distribuidos entre los tres estados (`EXECUTED`, `PENDING`, `REJECTED`) para demostrar todos los escenarios del ciclo operativo.

---

## Ejecución de Tests

### Backend

```bash
cd backend_coril
./mvnw test          # Sólo tests
./mvnw clean verify  # Compilación + tests (equivalente al pipeline CI)
```

### Frontend

```bash
cd frontend_coril
npm run test         # Vitest (modo watch)
npm run test -- --run  # Ejecución única (CI)
```

---

## Despliegue con Docker

Ambos módulos incluyen un `Dockerfile` de producción con build multi-etapa.

**Frontend** (Vite → artefacto estático servido por Nginx):

```bash
cd frontend_coril
docker build -t coril-frontend .
docker run -p 80:80 coril-frontend
```

**Backend** *(construir el JAR primero)*:

```bash
cd backend_coril
./mvnw clean package -DskipTests
docker build -t coril-backend .
docker run -p 8081:8081 coril-backend
```

---

## Integración Continua

El repositorio cuenta con dos pipelines independientes en GitHub Actions (`.github/workflows/`):

| Pipeline | Disparador | Acción |
|---|---|---|
| `backend-ci.yml` | Push/PR sobre cambios en `backend_coril/**` | `mvnw clean verify` (compilación + tests) |
| `frontend-ci.yml` | Push/PR sobre cambios en `frontend_coril/**` | `npm install` → `npm run test` → `npm run build` |

Los pipelines son **path-scoped**: un cambio exclusivo en el frontend no dispara la verificación del backend y viceversa, reduciendo el tiempo de feedback y el consumo de minutos de CI.

---

## Documentación Técnica

Para profundizar en las decisiones de diseño y el modelo de negocio, consultar la carpeta [`/docs`](./docs/):

| Documento | Contenido |
|---|---|
| [`api-spec.md`](./docs/api-spec.md) | Contrato completo de la API: endpoints, parámetros, ejemplos de Request/Response y manejo de errores |
| [`domain-model.md`](./docs/domain-model.md) | Modelo de dominio financiero: relación entre `Fund`, `Balance` y `Movement`, ciclo de estados, precisión decimal |
| [`architecture-decisions.md`](./docs/architecture-decisions.md) | Justificación formal de las decisiones técnicas: Package-by-Feature, H2, Vite SPA, CI/CD |

---

## Supuestos y Límites del MVP

Los siguientes supuestos fueron adoptados ante especificaciones incompletas y están documentados formalmente en `/docs`:

1. **Identificador de inversionista:** Se asume un `investorId` fijo (`INV-0001`) gestionado desde el frontend. En una versión productiva, este valor provendría de un token de autenticación.
2. **Valor Cuota al cierre:** El `shareValue` se fija en el momento de la ejecución. Las operaciones `PENDING` registran `0.0000` en cuotas y valor cuota, reflejando que aún no han sido procesadas por el cierre de mercado.
3. **Saldo calculado externamente:** La tabla `balance` es un snapshot pre-calculado de las transacciones `EXECUTED`. En producción, su actualización sería responsabilidad de un proceso batch de cierre diario.
4. **Filtrado por fondo (client-side):** El filtro por nombre de fondo se aplica en el frontend sobre los datos ya cargados, evitando una petición adicional al backend para un conjunto de datos acotado como es el portafolio de un inversor individual.

**Trabajo pendiente:** Implementar autenticación JWT, migración de H2 a PostgreSQL mediante Flyway, y un proceso batch de cierre de mercado que actualice saldos y asigne cuotas.
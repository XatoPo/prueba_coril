# Registro de Decisiones Arquitectónicas (ADR) — Coril Portfolio

Este documento formaliza las decisiones técnicas de mayor impacto adoptadas durante el diseño del sistema, incluyendo el contexto que las motivó, las alternativas consideradas y la justificación de la elección.

---

## ADR-001 · Organización Package-by-Feature (Backend)

### Contexto

El código fuente de un sistema backend puede organizarse siguiendo dos criterios opuestos: por **capa técnica** (agrupando todo lo relacionado con controladores, todo lo relacionado con servicios, etc.) o por **feature de negocio** (agrupando todo lo relacionado con un concepto de dominio).

### Alternativa descartada — Package-by-Layer

```
com.coril.portfolio
├── controllers/       ← BalanceController, MovementController, ...
├── services/          ← BalanceService, MovementService, ...
├── repositories/      ← BalanceRepository, MovementRepository, ...
└── models/            ← Balance, Movement, Fund, ...
```

Este modelo es intuitivo para proyectos pequeños, pero presenta problemas de escalabilidad: modificar una feature de negocio requiere navegar por múltiples paquetes. El acoplamiento entre features es difícil de detectar y los módulos no tienen fronteras claras.

### Decisión adoptada — Package-by-Feature

```
com.coril.portfolio
├── balance/           ← Balance.java, BalanceService.java, BalanceController.java
│                         BalanceRepository.java, BalanceResponse.java
├── movement/          ← Movement.java, MovementService.java, MovementController.java
│                         MovementRepository.java, MovementResponse.java
│                         MovementStatus.java, MovementType.java
├── fund/              ← Fund.java
└── common/            ← WebConfig.java, GlobalExceptionHandler.java, ErrorResponse.java
```

### Justificación

1. **Cohesión máxima:** Todos los artefactos de una feature (entidad, repositorio, servicio, controlador, DTO) residen en el mismo paquete. Un desarrollador nuevo puede comprender el dominio `balance` leyendo un único directorio.
2. **Bajo acoplamiento entre features:** Los límites de paquete actúan como barreras de visibilidad. La feature `movement` no necesita importar nada de `balance`; cada una es autónoma.
3. **Preparación para microservicios:** Si el producto requiere escalar, cada paquete de feature puede extraerse como un microservicio independiente con cambios mínimos, ya que sus dependencias internas están contenidas.
4. **Mantenibilidad a largo plazo:** Agregar una nueva feature (ej. `investor`, `report`) implica crear un nuevo paquete sin tocar los existentes, respetando el principio Open/Closed.

---

## ADR-002 · Persistencia en Memoria con H2

### Contexto

El sistema requiere una base de datos relacional para modelar las entidades `Fund`, `Balance` y `Movement` con sus relaciones e índices. La decisión de qué motor usar impacta directamente en la **portabilidad** del entorno de desarrollo y la **velocidad de incorporación** de nuevos integrantes al equipo.

### Alternativa descartada — PostgreSQL local

Requiere instalación del motor en la máquina del desarrollador, configuración de usuarios y bases de datos, gestión de versiones y posibles conflictos de entorno. Introduce una dependencia de infraestructura que puede variar entre sistemas operativos.

### Decisión adoptada — H2 In-Memory

```yaml
# application.yml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:h2:mem:coril_portfolio_db;DB_CLOSE_DELAY=-1}
    driverClassName: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: none   # El esquema se gestiona explícitamente mediante scripts
  sql:
    init:
      schema-locations: classpath:schema.sql
      data-locations: classpath:data.sql
```

### Justificación

1. **Portabilidad total:** El sistema arranca con `./mvnw spring-boot:run` en cualquier máquina con JDK 21, sin dependencias de infraestructura externas. El motor de datos está embebido en el JAR.
2. **Inicialización determinista:** Los scripts `schema.sql` y `data.sql` garantizan que cada arranque genera exactamente el mismo estado de datos. Esto elimina las divergencias de entorno entre desarrolladores y hace el sistema autocontenible para revisión.
3. **DDL explícito (`ddl-auto: none`):** A diferencia de la generación automática de Hibernate, el esquema se define manualmente en `schema.sql`. Esta decisión garantiza que el modelo de datos sea una especificación visible, revisable y migrable, no un efecto secundario del ORM.
4. **Ruta clara de migración a producción:** La URL de conexión y las credenciales están externalizadas mediante variables de entorno. Migrar a PostgreSQL en producción implica únicamente definir `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`, sin modificar una línea de código Java. El sistema está diseñado para esta transición desde el inicio.
5. **Consola de auditoría integrada:** H2 expone una consola web en `/h2-console` que permite inspeccionar el estado de la base de datos en tiempo real sin herramientas adicionales.

---

## ADR-003 · Transferencia de Datos mediante Java Records

### Contexto

La capa de presentación de la API necesita proyectar datos de las entidades JPA hacia el contrato REST, sin exponer directamente la estructura interna de las entidades ni permitir mutaciones accidentales en la capa de red.

### Alternativa descartada — Clases POJO / `@JsonIgnore`

El uso de entidades JPA directamente como objetos de respuesta acopla el modelo de persistencia con el contrato de API. Cualquier cambio en la entidad impacta inmediatamente en el JSON serializado. El uso de `@JsonIgnore` es una solución parcial y frágil.

### Decisión adoptada — Java Records

```java
// MovementResponse.java
public record MovementResponse(
        Long id,
        String fundId,
        String fundName,
        MovementType type,
        BigDecimal amount,
        BigDecimal shares,
        BigDecimal shareValue,
        String currency,
        MovementStatus status,
        LocalDateTime transactionDate
) {}
```

```java
// BalanceResponse.java
public record BalanceResponse(
        Long id,
        String fundId,
        String fundName,
        BigDecimal totalShares,
        BigDecimal investedAmount,
        String currency,
        LocalDateTime lastUpdated
) {}
```

### Justificación

1. **Inmutabilidad por diseño:** Los `record` de Java 21 son inmutables por definición. La capa de red no puede modificar accidentalmente el estado de un objeto de dominio.
2. **Separación de contratos:** El record `MovementResponse` incluye campos calculados o derivados (como `fundName` y `currency`, obtenidos del `Fund` relacionado) que no existen directamente en la entidad `Movement`. Esta proyección explícita separa la representación de persistencia de la representación de red.
3. **Reducción de boilerplate:** Los records generan automáticamente `equals()`, `hashCode()`, `toString()` y constructores canónicos. Equivalen funcionalmente a una clase con Lombok `@Value`, pero son una construcción nativa del lenguaje.
4. **Seguridad frente a sobreexposición:** Al proyectar explícitamente los campos del record, se garantiza que campos internos de auditoría (como `createdAt` o `clientId`) nunca lleguen al consumidor de la API por descuido.

---

## ADR-004 · Frontend SPA con Vite y React

### Contexto

La interfaz de usuario necesita consumir la API REST y presentar el portafolio al inversionista. La decisión sobre el framework y el modelo de renderizado impacta en la complejidad de la solución, el tiempo de arranque del entorno de desarrollo y la adecuación al alcance del MVP.

### Alternativa descartada — Next.js (SSR/SSG)

Next.js ofrece Server-Side Rendering y generación estática, características valiosas para SEO, cacheo de páginas y carga inicial optimizada. Sin embargo, estas características introducen complejidad: requieren un servidor Node.js en producción, el modelo de data-fetching es más complejo (Server Components, `getServerSideProps`), y el overhead de configuración no aporta valor para una pantalla de portafolio que requiere autenticación previa y datos completamente dinámicos.

### Decisión adoptada — Vite + React SPA

```
frontend_coril/
├── src/
│   ├── views/          ← Páginas/vistas (Portfolio.jsx)
│   ├── components/     ← Componentes reutilizables (BalanceCard, MovementTable...)
│   └── services/       ← Capa de acceso a la API (portfolioService.js)
```

### Justificación

1. **Alineación con el dominio:** Una pantalla de portafolio de inversiones requiere autenticación obligatoria antes de ser visible. El SEO de páginas públicas es irrelevante en este contexto, lo que elimina la principal ventaja del SSR.
2. **Velocidad de desarrollo:** El servidor de desarrollo de Vite arranca en milisegundos gracias a ESM nativo. El Hot Module Replacement (HMR) proporciona retroalimentación inmediata durante el desarrollo.
3. **Despliegue simple:** El build de Vite genera artefactos estáticos (`dist/`) que pueden servirse desde cualquier CDN, servidor Nginx, o bucket S3, sin requerir un runtime de Node.js en producción. El `Dockerfile` del frontend refleja este principio: build multi-etapa con Nginx como servidor final.
4. **Separación de responsabilidades:** La SPA se comunica exclusivamente con la API REST mediante `fetch`. Esta separación hace que el frontend sea completamente agnóstico del stack del backend; podría conectarse a una API GraphQL o gRPC sin cambios en su arquitectura.
5. **Complejidad proporcional al alcance:** El MVP requiere una única vista con dos secciones. Introducir routing de servidor, hidratación de componentes y cache de SSR para este alcance violaría el principio de proporcionalidad: la solución no debe ser más compleja que el problema.

---

## ADR-005 · Integración Continua con GitHub Actions

### Contexto

El repositorio utiliza una estructura de monorepo con dos módulos independientes. Un pipeline de CI mal configurado introduciría dos problemas: (1) verificar el backend cuando sólo cambió el frontend, desperdiciando recursos y tiempo, o (2) un único pipeline acoplado que dificulta identificar cuál módulo falló.

### Decisión adoptada — Pipelines independientes con path filtering

**`backend-ci.yml`** — Se dispara únicamente ante cambios en `backend_coril/**`:

```yaml
on:
  push:
    paths: ['backend_coril/**']
  pull_request:
    paths: ['backend_coril/**']

jobs:
  build:
    steps:
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven
      - run: ./mvnw clean verify   # compilación + tests + empaquetado
```

**`frontend-ci.yml`** — Se dispara únicamente ante cambios en `frontend_coril/**`:

```yaml
on:
  push:
    paths: ['frontend_coril/**']
  pull_request:
    paths: ['frontend_coril/**']

jobs:
  build-and-test:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm install
      - run: npm run test    # Vitest
      - run: npm run build   # verifica que el bundle compile correctamente
```

### Justificación

1. **Path-scoped triggers:** Un commit que modifica únicamente CSS del frontend no dispara la compilación Maven del backend. Esto reduce el tiempo de feedback y el consumo de minutos de CI.
2. **Caché de dependencias:** Ambos pipelines utilizan caché de dependencias (`cache: maven`, `cache: 'npm'`), reduciendo el tiempo de instalación en ejecuciones sucesivas.
3. **`clean verify` en backend:** El goal `verify` incluye la fase `test`, garantizando que el pipeline no sólo compila sino que también ejecuta todos los tests unitarios e de integración antes de considerar el build exitoso.
4. **Separación de responsabilidades en CI:** El estado del badge de CI de cada pipeline refleja únicamente la salud de su módulo correspondiente, facilitando el diagnóstico de fallos.
5. **Escalabilidad del pipeline:** En el futuro, cada pipeline puede extenderse independientemente con pasos de publicación de imágenes Docker, análisis de calidad de código (SonarCloud) o despliegue a entornos de staging, sin afectar al otro módulo.
# Grupo Coril - Gestión de Portafolio MVP

Bienvenido al MVP de gestión de portafolios para el Grupo Coril. Este proyecto ha sido diseñado priorizando la autonomía del entorno, la claridad del modelo de negoci.

## Arquitectura del Proyecto
El sistema sigue un enfoque de monorepo desacoplado:
* **Backend:** API RESTful (Java 21, Spring Boot) con persistencia en H2.
* **Frontend:** Single Page Application (React, Vite).

## Instrucciones de Ejecución

### 1. Requisitos Previos
* JDK 21 (Temurin o similar).
* Node.js (LTS).
* Git.

### 2. Levantar el Backend
El backend utiliza una base de datos embebida (H2) que se inicializa automáticamente al arrancar.
1. Navega al directorio: `cd backend_coril`
2. Ejecuta el wrapper de Maven: `.\mvnw spring-boot:run` (en PowerShell).
3. API disponible en: `http://localhost:8081/api/v1/`
4. Consola H2 para auditoría de datos: `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:coril_portfolio_db`, Usuario: `sa`, sin contraseña).

### 3. Levantar el Frontend
1. Navega al directorio: `cd frontend_coril`
2. Instala dependencias: `npm install`
3. Inicia el servidor: `npm run dev`
4. Acceso UI: `http://localhost:5173`

---

## Documentación y Criterio Técnico (Carpeta `/docs`)
He centralizado las decisiones técnicas y el modelado del dominio:
* **`api-spec.md`**: Contrato de endpoints y formatos JSON.
* **`domain-model.md`**: Explicación conceptual del negocio de Fondos Mutuos (Cuotas vs. Montos).
* **`architecture-decisions.md`**: Justificación formal de las tecnologías seleccionadas (Vite, H2, Package-by-Feature).

## Supuestos y Decisiones de Negocio
Ante la ambigüedad del requerimiento original, he adoptado los siguientes supuestos para el MVP:
1. **Flujo de estados:** Definí un ciclo simple `PENDING` -> `EXECUTED` -> `REJECTED` para representar el cierre de mercado diario, evitando estados intermedios burocráticos.
2. **Precisión Financiera:** Se utilizó `DECIMAL(19,4)` para garantizar la integridad contable al gestionar fracciones de cuotas, una decisión crítica en sistemas financieros.
3. **Aislamiento de Saldos:** Modelé una tabla `balance` separada del historial `movement` para optimizar el rendimiento de lectura, basándome en el principio de que el saldo actual es una vista consolidada de los movimientos ejecutados.

## Notas de Desarrollo
* **Lo que queda pendiente:** En un escenario de escalabilidad futura, el siguiente paso lógico sería implementar una estrategia de autenticación robusta y la migración a PostgreSQL utilizando las migraciones de Flyway, para las cuales el proyecto ya está estructurado.
* **Uso de IA:** La IA fue utilizada como arquitecto para validar patrones de diseño (Package-by-Feature) y asegurar la consistencia del estándar Conventional Commits. La lógica de negocio y las decisiones financieras han sido validadas manualmente para cumplir con los requerimientos del challenge del Grupo Coril.
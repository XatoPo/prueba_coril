# Registro de Decisiones Arquitectónicas (ADR)

## 1. Diseño Package-by-Feature (Backend)
Se organizó el código fuente por dominio de negocio (`balance`, `movement`, `fund`) en lugar de capas técnicas genéricas. Esto maximiza la cohesión interna, previene el acoplamiento cruzado de responsabilidades y prepara el sistema para escalar a microservicios si el producto lo requiere en el futuro.

## 2. Persistencia Autónoma
Se implementó una base de datos en memoria (H2) poblada de forma determinista mediante scripts de arranque (`schema.sql`, `data.sql`). La configuración ha sido externalizada en `application.yml` para permitir transiciones fluidas hacia motores como PostgreSQL mediante variables de entorno en etapas productivas, garantizando mientras tanto una ejecución local autónoma.

## 3. Transferencia de Datos con Records de Java
Para exponer la información mediante la API REST, se implementaron `records` nativos de Java 21. Esta decisión impone inmutabilidad por diseño, garantiza que la capa de red no modifique accidentalmente el estado de negocio y previene vulnerabilidades al aislar la estructura interna de las entidades JPA.

## 4. Frontend SPA con Vite
Se optó por una arquitectura de Single Page Application pura (React + Vite) en lugar de frameworks con Server-Side Rendering. Esto obedece al patrón MVP: es la solución más ligera, rápida de desplegar y perfectamente adecuada para el consumo asíncrono de APIs sin introducir complejidades de hidratación o enrutamiento de servidor innecesarias para este alcance.
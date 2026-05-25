# Grupo Coril - Gestión de Portafolio MVP

MVP para la visualización consolidada de saldos y movimientos históricos de fondos mutuos. 

## Arquitectura del Proyecto
Este repositorio es un monorepo que contiene dos aplicaciones principales:
* **Backend:** API RESTful construida con Java 21 y Spring Boot, utilizando persistencia autónoma (H2).
* **Frontend:** Single Page Application construida con React y Vite.

## Instrucciones de Ejecución

### 1. Levantar el Backend
El backend está configurado para inicializar automáticamente su esquema de base de datos y una semilla de datos transaccionales.
1. Navega al directorio del backend: `cd backend_coril`
2. Ejecuta el wrapper de Maven: `.\mvnw spring-boot:run` (Windows) o `./mvnw spring-boot:run` (Mac/Linux).
3. La API estará disponible en `http://localhost:8081/api/v1/...`
4. Puedes auditar la base de datos en memoria accediendo a `http://localhost:8081/h2-console` (URL: `jdbc:h2:mem:coril_portfolio_db`, Usuario: `sa`, sin contraseña).

### 2. Levantar el Frontend
1. Navega al directorio del frontend: `cd frontend_coril`
2. Instala las dependencias: `npm install`
3. Inicia el servidor de desarrollo: `npm run dev`
4. La aplicación estará disponible en `http://localhost:5173`.

## Documentación Técnica
Las decisiones arquitectónicas, el modelado financiero y el contrato de la API se encuentran detallados en la carpeta `/docs`.
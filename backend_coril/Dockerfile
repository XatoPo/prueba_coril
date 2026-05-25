# Etapa 1: Construcción
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copiamos el wrapper de Maven y el archivo de configuración
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Descargamos las dependencias en modo offline para cachear esta capa
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copiamos el código fuente y compilamos el proyecto omitiendo los tests para agilizar la construcción
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Etapa 2: Ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiamos únicamente el artefacto ejecutable desde la etapa de construcción
COPY --from=builder /app/target/*.jar app.jar

# Exponemos el puerto definido en nuestra configuración
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
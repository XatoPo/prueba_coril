# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor (Producción)
FROM nginx:alpine

# Copiamos los artefactos estáticos generados por Vite hacia Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto estándar web
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]
# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-alpine

# ── Etapa 1: Build ──────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build

WORKDIR /app

# Copiar manifiestos e instalar TODAS las dependencias (incluyendo devDependencies)
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente y compilar
COPY . .
RUN npm run build

# ── Etapa 2: Servir con nginx ────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Copiar los archivos estáticos generados
COPY --from=build /app/build /usr/share/nginx/html

# Configuración de nginx: SPA routing + proxy al backend
COPY nginx.conf /etc/nginx/templates/default.conf.template

# envsubst se ejecuta automáticamente al iniciar nginx
# reemplaza ${BACKEND_URL} con el valor real de la variable de entorno
ENV BACKEND_URL=http://localhost:8080

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

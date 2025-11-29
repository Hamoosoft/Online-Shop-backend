# --- Stage 1: Build (Construction du site) ---
FROM node:20-alpine as build
WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code et compilation
COPY . .
RUN npm run build

# --- Stage 2: Run (Serveur Nginx) ---
FROM nginx:alpine

# 1. On copie le site compilé (HTML/CSS/JS)
COPY --from=build /app/dist /usr/share/nginx/html

# 2. On copie NOTRE configuration Nginx pour gérer l'API (C'est la nouveauté !)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
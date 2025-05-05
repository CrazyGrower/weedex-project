# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Installer les dépendances système nécessaires pour sharp
RUN apk add --no-cache python3 make g++

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Générer les icônes
RUN node scripts/generate-icons.js

# Construire l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier les fichiers de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
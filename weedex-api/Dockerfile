FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3333

# Démarrer l'application en mode développement
CMD ["node", "ace", "serve", "--watch"]
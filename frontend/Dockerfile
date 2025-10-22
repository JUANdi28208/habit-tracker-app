# SOLO PARA DESARROLLO - no usar en producción
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

RUN npm install -g @angular/cli@16.2.16

COPY habit-app/ ./

# Para desarrollo con live reload
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]
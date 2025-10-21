# Etapa 1: Build
FROM node:16-alpine AS build

WORKDIR /app

COPY habit-app/package*.json ./
RUN npm ci --legacy-peer-deps

# Veririficación de que version de angular se esta usando en el proyecto
RUN npm install -g @angular/cli@16.2.10

COPY habit-app/ .
RUN npm run build 

# Etapa 2: Servir con Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/habit-app /usr/share/nginx/html

EXPOSE 80

CMD ["npm", "start", "--host", "0.0.0.0", "--poll", "2000"]
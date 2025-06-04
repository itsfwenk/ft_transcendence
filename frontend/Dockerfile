FROM node:20-bullseye-slim

WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install
RUN npm cache clean --force
RUN npm install dotenv
COPY ./frontend .
COPY gameInterfaces.ts ./
COPY ./frontend/public/locales /app/dist/locales
RUN npm install --save-dev @types/node
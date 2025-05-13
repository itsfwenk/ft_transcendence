# backend/Dockerfile
FROM node:20-bullseye-slim

WORKDIR /app
COPY ./pong-fastify/package.json ./pong-fastify/package-lock.json /app/
COPY ./vite_pong/dist /app/vite_pong/dist

RUN npm install -g fastify
RUN npm install
COPY ./pong-fastify /app/

EXPOSE 3000
CMD ["node", "server.mjs"]

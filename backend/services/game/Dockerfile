FROM node:23-alpine

WORKDIR /app

COPY ../../package*.json ./
COPY ../../tsconfig.json ./
COPY gameIndex.ts ./
COPY gameRoutes.ts ./
COPY gameController.ts ./
COPY gameDb.ts ./

RUN npm install

EXPOSE 4002

CMD ["node", "gameIndex.ts"]

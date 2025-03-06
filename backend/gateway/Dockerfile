FROM node:23-alpine

WORKDIR /app

COPY ../package*.json ./
COPY ../tsconfig.json ./
COPY gatewayIndex.ts ./

RUN npm install

EXPOSE 4000

CMD ["node", "gatewayIndex.ts"]

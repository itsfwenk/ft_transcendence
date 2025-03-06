FROM node:23-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

RUN npm install

COPY backend/services/game ./services/game

RUN npm run build --prefix ./services/game

EXPOSE 4002

#CMD ["sh"]
CMD ["node", "services/game/dist/gameIndex.js"]

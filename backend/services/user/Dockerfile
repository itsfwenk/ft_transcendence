FROM node:23-alpine

WORKDIR /app

COPY ../package*.json ./
COPY ../tsconfig.json ./
COPY userController.ts ./
COPY userDb.ts ./
COPY userIndex.ts ./
COPY userRoutes.ts ./

RUN npm install

EXPOSE 4001

CMD ["node", "userIndex.ts"]
FROM node:23-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

RUN npm install

COPY backend/services/user ./services/user

RUN npm run build --prefix ./services/user

EXPOSE 4001

#CMD ["sh"]
CMD ["node", "services/user/dist/userIndex.js"]
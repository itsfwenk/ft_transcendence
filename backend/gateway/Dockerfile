FROM node:23-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

COPY backend/gateway ./

RUN npm run build

EXPOSE 4000

#CMD ["sh"]
CMD ["node", "dist/gatewayIndex.js"]

FROM node:20-bullseye-slim

WORKDIR /app

COPY gateway/package*.json ./
COPY gateway/tsconfig.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY /gateway ./

RUN npm run build

EXPOSE 4000

#CMD ["sh"]
CMD ["node", "dist/srcs/gatewayIndex.js"]

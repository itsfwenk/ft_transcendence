FROM node:18.20.7

RUN apt-get update && apt-get install -y curl net-tools

WORKDIR /app

COPY gateway/package*.json ./
COPY gateway/tsconfig.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY /gateway ./

RUN npm run build

EXPOSE 4000 9230

#CMD ["sh"]
CMD ["node", "dist/srcs/gatewayIndex.js"]
#CMD ["node", "--inspect=0.0.0.0:9230", "dist/srcs/gatewayIndex.js"]

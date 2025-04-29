FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    python3 make g++ libsqlite3-dev curl net-tools \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y curl net-tools sqlite3

WORKDIR /app

COPY backend/services/game/package*.json ./
COPY backend/services/game/tsconfig.json ./
COPY ./gameInterfaces.ts ./

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json

#RUN npm cache clean --force

RUN npm install || npm install || npm install

RUN npm rebuild better-sqlite3 --build-from-source

COPY backend/services/game ./

RUN npm run build

EXPOSE 4002 9232

#CMD ["sh"]
CMD ["node", "dist/srcs/gameIndex.js"]
#CMD ["node", "--inspect=0.0.0.0:9232", "dist/srcs/gameIndex.js"]
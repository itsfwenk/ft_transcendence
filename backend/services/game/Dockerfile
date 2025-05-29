FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libsqlite3-dev curl net-tools sqlite3 \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/services/game/package*.json ./

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json
RUN npm install

RUN npm rebuild

COPY backend/services/game/tsconfig.json ./
COPY backend/services/game/srcs ./srcs
COPY backend/services/game/metrics ./metrics
COPY ./gameInterfaces.ts ./

COPY ssl_crts/game/ ./game_ssl_crts/
RUN chmod -R 600 /app/game_ssl_crts/*.key \
    && chmod -R 644 /app/game_ssl_crts/*.crt

RUN npm run build

EXPOSE 4002 9232

CMD ["node", "dist/srcs/gameIndex.js"]
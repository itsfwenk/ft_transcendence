FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsqlite3-dev \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p /app/data

COPY services/game/package*.json ./
COPY services/game/tsconfig.json ./

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json

RUN npm cache clean --force

RUN npm install

RUN npm rebuild better-sqlite3 --build-from-source

COPY services/game ./

RUN npm run build

EXPOSE 4002

#CMD ["sh"]
CMD ["node", "dist/srcs/gameIndex.js"]

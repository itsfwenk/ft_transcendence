FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsqlite3-dev \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y curl net-tools

WORKDIR /app

RUN mkdir -p /app/data

COPY services/user/package*.json ./
COPY services/user/tsconfig.json ./

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json

RUN npm cache clean --force

RUN npm install

RUN npm rebuild better-sqlite3 --build-from-source

COPY services/user ./

RUN npm run build

EXPOSE 4001

#CMD ["sh"]
CMD ["node", "dist/srcs/userIndex.js"]
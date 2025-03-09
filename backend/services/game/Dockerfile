FROM node:20-bullseye-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 make g++ libsqlite3-dev \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p /app/data

COPY services/user/package*.json ./
COPY services/user/tsconfig.json ./

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json && \
    npm install --build-from-source && \
    npm rebuild better-sqlite3 --build-from-source --update-binary

COPY services/game ./
RUN npm run build

FROM node:20-bullseye-slim
WORKDIR /app

RUN apt-get update && apt-get install -y curl net-tools

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4002
CMD ["node", "dist/srcs/gameIndex.js"]
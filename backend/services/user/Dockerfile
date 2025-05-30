FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    python3 make g++ libsqlite3-dev sqlite3 curl net-tools ca-certificates \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y sqlite3 curl net-tools --fix-missing

RUN mkdir -p /app/public/avatars

WORKDIR /app

COPY services/user/package*.json ./
COPY services/user/tsconfig.json ./
COPY services/user/avatars/* /app/public/avatars/

RUN chmod -R 755 /app/public/avatars

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json

#RUN npm cache clean --force

RUN npm install

RUN npm rebuild better-sqlite3 --build-from-source

COPY services/user ./

COPY ssl_crts/*/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates

RUN npm run build

EXPOSE 4001 9231

#CMD ["sh"]
CMD ["node", "dist/srcs/userIndex.js"]
#CMD ["node", "--inspect=0.0.0.0:9231", "dist/srcs/userIndex.js"]
FROM node:18.20.7

RUN apt-get update && apt-get install -y \
    python3 make g++ libsqlite3-dev curl net-tools \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y sqlite3 curl net-tools

WORKDIR /app

COPY services/matchmaking/package*.json ./
COPY services/matchmaking/tsconfig.json ./

ENV npm_config_build_from_source=true
ENV npm_config_prebuild_install=false

RUN rm -rf node_modules package-lock.json

#RUN npm cache clean --force

RUN npm install

RUN npm rebuild better-sqlite3 --build-from-source

COPY services/matchmaking ./

RUN npm run build

EXPOSE 4003 9229

#CMD ["sh"]
CMD ["node", "dist/srcs/matchmakingIndex.js"]
#CMD ["node", "--inspect=0.0.0.0:9229", "dist/srcs/matchmakingIndex.js"]
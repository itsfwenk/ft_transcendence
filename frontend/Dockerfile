FROM node:20-bullseye-slim

WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install
RUN npm cache clean --force
RUN npm install dotenv
COPY ./frontend .
COPY gameInterfaces.ts ./
RUN npm install --save-dev @types/node

# RUN npm run build
# CMD ["npm", "run", "build"]
# CMD ["tail", "-f", "/dev/null"]


###########################################################
# FROM node:20-bullseye AS base
# WORKDIR /app
# COPY ./package*.json ./
# RUN npm install
# COPY . .

# FROM base AS dev
# EXPOSE 5173
# CMD ["npm", "run", "dev"]

# FROM base AS build
# RUN npm run build

# FROM nginx:bullseye AS prod
# COPY --from=build /app/dist /usr/share/nginx/html
# RUN ["echo", "production"]
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]%     
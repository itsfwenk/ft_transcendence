FROM node:20-bullseye AS base
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .

FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build

FROM nginx:bullseye AS prod
COPY --from=build /app/dist /usr/share/nginx/html
RUN ["echo", "production"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]%     
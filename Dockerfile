FROM node:24-alpine AS base

WORKDIR /app

COPY package.json package-lock.json*  ./
RUN npm ci

COPY . .

# Prefijo de la aplicación detrás del proxy. Next lo fija al compilar, así que hay que pasarlo
# al construir la imagen (docker build --build-arg BASE_PATH=/aiquiz-2 o build.args en compose).
# Se mantiene como ENV para que el servidor use el mismo valor al arrancar.
ARG BASE_PATH=/aiquiz
ENV BASE_PATH=${BASE_PATH}

RUN npm run build

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


EXPOSE 3000

ENV PORT 3000


CMD HOSTNAME="0.0.0.0" node server.js
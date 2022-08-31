FROM node:14-alpine AS dev
RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY tsconfig.json .eslintrc.js .parcelrc ./
COPY src src

RUN npm run build

FROM node:14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=dev /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "--enable-source-maps", "dist/server.js"]
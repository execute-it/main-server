FROM node:alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install
RUN npm install -g pm2

COPY . .
RUN apk add bash



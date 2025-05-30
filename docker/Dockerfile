# BASE
FROM node:lts-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

# DEPENDENCIES
FROM base AS dependencies

RUN npm ci --omit=dev

# BUILDER
FROM base AS builder

RUN npm ci

COPY . .

RUN npm run build

# RELEASE
FROM base AS release

RUN apk add --no-cache bash

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk update \
  && apk add --no-cache --virtual .build-deps udev ttf-opensans chromium ca-certificates

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder      /app/dist ./dist

RUN addgroup -S pptruser \
  && adduser -S -g pptruser -G pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 8080

ENV NODE_ENV=production

CMD [ "/sbin/tini", "--", "node", "dist/main" ]

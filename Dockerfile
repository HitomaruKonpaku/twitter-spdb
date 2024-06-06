# BASE
FROM node:18-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

# DEPENDENCIES
FROM base AS dependencies

RUN npm install --only=prod

# BUILDER
FROM base AS builder

RUN npm install

COPY . .

RUN npm run build

# APP
FROM base as app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

RUN apk update \
  && apk add --no-cache --virtual .build-deps udev ttf-opensans chromium ca-certificates

# RELEASE
FROM app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder      /app/dist ./dist

RUN addgroup -S pptruser \
  && adduser -S -g pptruser -G pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 8080

CMD [ "/sbin/tini", "--", "node", "dist/main" ]

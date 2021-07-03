FROM node:14-alpine as base

RUN apk --no-cache add tini

# ========== #
FROM base as installer

RUN apk --no-cache add \
    python \
    make \
    g++

WORKDIR /data
COPY ./package.json ./
COPY ./package-lock.json ./

ENV CI=1

RUN npm install 

# ========== #
FROM base

USER node
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ENV NODE_ENV="production"

WORKDIR /home/node/app
COPY --from=installer --chown=node:node /data/node_modules ./node_modules/
COPY --from=installer --chown=node:node /data/package.json ./package.json

HEALTHCHECK NONE

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "start:dev"]

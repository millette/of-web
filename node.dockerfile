FROM node:lts-alpine

USER node
RUN mkdir /home/node/app 
WORKDIR /home/node/app

COPY package*.json ./
COPY npmrc-docker ./.npmrc
RUN npm ci

COPY ./components ./components
COPY ./data ./data
COPY ./pages ./pages
COPY ./utils ./utils

# npm install twice, once to build the other to run
RUN npm run build && rm -fr node_modules && npm ci --production --offline && rm -fr ../.npm

COPY server.js .
COPY favicon.ico .

ENV NODE_ENV=production

ENTRYPOINT ["node", "."]

EXPOSE 3000



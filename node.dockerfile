FROM node:lts-alpine

USER node
RUN mkdir /home/node/app 
WORKDIR /home/node/app

COPY . .

# npm install twice, once to build the other to run
RUN mv npmrc-docker ../.npmrc && npm ci && npm run build && rm -fr node_modules && npm ci --production --offline && rm -fr ../.npm

ENV NODE_ENV=production

ENTRYPOINT ["node", "."]

EXPOSE 3000



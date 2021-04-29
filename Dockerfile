FROM node:15.12.0
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN yarn install --production

COPY . .

CMD [ "node", "server.js" ]
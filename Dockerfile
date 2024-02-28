FROM node:21

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY prisma ./prisma/

COPY --chown=node:node . .

COPY .env ./

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
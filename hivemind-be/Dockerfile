FROM node:20.15.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

RUN npm install -g @nestjs/cli

RUN npm install prisma@5.20.0 --save-dev

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD npx prisma migrate deploy && npm run start:prod
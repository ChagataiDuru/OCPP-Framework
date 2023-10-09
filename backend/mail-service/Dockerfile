FROM node:18-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY . .

RUN npm install

# Build the NestJS application
RUN npm run build

FROM node:18-alpine as runner

WORKDIR /app

COPY package.json .

EXPOSE 4003

COPY --from=builder /app .

CMD ["npm", "run", "start:dev"]xw
FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Build the NestJS application
RUN npm run build

FROM node:20-alpine as runner

WORKDIR /app

COPY package.json .

EXPOSE 4000

COPY --from=builder /app .

CMD ["npm", "run", "start:dev"]
# Use an official Node runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY frontend/ocpp-csms-angular/package*.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY frontend/ocpp-csms-angular .

# Build the Angular app
RUN ng build --prod

# Use a smaller base image for the final image
FROM nginx:alpine

# Copy the built app from the builder stage to the NGINX web server's public directory
COPY --from=builder /usr/src/app/dist/ocpp-csms-angular /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the application
CMD ["nginx", "-g", "daemon off;"]

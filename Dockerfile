# Use the official Node.js image from the Docker Hub
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the necessary dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Command to run the application
CMD ["node", "dist/update-dns.js"]

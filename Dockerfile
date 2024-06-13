# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Bundle app source
COPY dist/ ./dist/

# Build TypeScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

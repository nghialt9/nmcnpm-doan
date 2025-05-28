# Use a lightweight Node.js image as the base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your application code
COPY . .

# Expose port for the application
EXPOSE 8007

# Start the application (replace "start.js" with your actual entry point)
CMD [ "npm", "start" ]

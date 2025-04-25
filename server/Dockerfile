FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY server/ ./

# Expose the port your app runs on
EXPOSE 3001

# Set the start command explicitly
CMD ["node", "server.js"] 
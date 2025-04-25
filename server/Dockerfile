FROM node:18

# Create app directory
WORKDIR /app

# First copy only the server directory
COPY server server/

# Set working directory to server
WORKDIR /app/server

# Install dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 3001

# Set the start command explicitly
CMD ["node", "server.js"] 
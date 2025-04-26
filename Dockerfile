FROM node:18-slim

# Create and set working directory
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY server/ ./

# Expose the port your app runs on
EXPOSE ${PORT}

# Set environment variables
ENV NODE_ENV=production

# Set the start command explicitly
CMD ["node", "server.js"] 
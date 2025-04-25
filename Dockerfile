FROM node:18

# Create and set working directory
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY server/ ./

# Expose the port your app runs on
EXPOSE 3001

# Create a shell script to run the application
RUN echo '#!/bin/sh\nnode server.js' > start.sh && \
    chmod +x start.sh

# Set the start command explicitly
ENTRYPOINT ["/app/start.sh"] 
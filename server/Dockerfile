FROM node:18

# Create app directory
WORKDIR /app/server

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the server directory contents
COPY server/ .

# Expose the port your app runs on
EXPOSE 3001

# Set the start command explicitly
ENTRYPOINT ["node"]
CMD ["server.js"] 
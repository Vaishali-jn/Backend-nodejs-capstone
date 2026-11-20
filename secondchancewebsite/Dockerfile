
# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application code
COPY . .

# Expose application port
EXPOSE 9000

# Run the application
CMD ["node", "index.js"]

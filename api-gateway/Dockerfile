FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY libs/package*.json ./libs/
COPY api-gateway/package*.json ./api-gateway/

# Install dependencies
WORKDIR /app/libs
RUN npm install
WORKDIR /app/api-gateway
RUN npm install

# Copy source files
WORKDIR /app
COPY libs/tsconfig.json ./libs/
COPY libs/src ./libs/src
COPY api-gateway/tsconfig*.json ./api-gateway/
COPY api-gateway/src ./api-gateway/src
COPY api-gateway/test ./api-gateway/test

# Build libs first
WORKDIR /app/libs
RUN npm run build

# Build api-gateway
WORKDIR /app/api-gateway
RUN npm run build

# Make sure the build worked
RUN ls -la dist/

EXPOSE 3000

# Run the application
WORKDIR /app/api-gateway
CMD ["node", "dist/main.js"]
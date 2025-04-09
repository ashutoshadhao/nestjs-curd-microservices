FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY libs/package*.json ./libs/
COPY product-service/package*.json ./product-service/

# Install dependencies
WORKDIR /app/libs
RUN npm install
WORKDIR /app/product-service
RUN npm install

# Copy source files
WORKDIR /app
COPY libs/tsconfig.json ./libs/
COPY libs/src ./libs/src
COPY product-service/tsconfig*.json ./product-service/
COPY product-service/src ./product-service/src
COPY product-service/test ./product-service/test

# Build libs first
WORKDIR /app/libs
RUN npm run build

# Build product-service
WORKDIR /app/product-service
RUN npm run build

# Make sure the build worked
RUN ls -la dist/

EXPOSE 3002 4002

# Run the application
WORKDIR /app/product-service
CMD ["node", "dist/main.js"]
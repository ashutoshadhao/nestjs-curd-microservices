FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY libs/package*.json ./libs/
COPY user-service/package*.json ./user-service/

# Install dependencies
WORKDIR /app/libs
RUN npm install
WORKDIR /app/user-service
RUN npm install

# Copy source files
WORKDIR /app
COPY libs/tsconfig.json ./libs/
COPY libs/src ./libs/src
COPY user-service/tsconfig*.json ./user-service/
COPY user-service/src ./user-service/src
COPY user-service/test ./user-service/test

# Build libs first
WORKDIR /app/libs
RUN npm run build

# Build user-service
WORKDIR /app/user-service
RUN npm run build

# Make sure the build worked
RUN ls -la dist/

EXPOSE 3001 4001

# Run the application
WORKDIR /app/user-service
CMD ["node", "dist/main.js"]
#!/bin/bash

# Script to install dependencies separately in each repository
echo "Installing dependencies in each repository..."

# Install libs dependencies
echo "🔹 Installing libs dependencies..."
cd libs || exit
npm install --no-workspaces
npm run build
cd ..

# Install user-service dependencies
echo "🔹 Installing user-service dependencies..."
cd user-service || exit
npm install --no-workspaces
cd ..

# Install product-service dependencies
echo "🔹 Installing product-service dependencies..."
cd product-service || exit
npm install --no-workspaces
cd ..

# Install api-gateway dependencies
echo "🔹 Installing api-gateway dependencies..."
cd api-gateway || exit
npm install --no-workspaces
cd ..

echo "✅ Dependency installation complete!"
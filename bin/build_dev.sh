#!/bin/bash

# We can take pull in the same file but once jenkins setup, we don't need to do this
set -e

echo "🔄 Cleaning previous build..."
rm -rf .next

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔧 Building for development..."
npx dotenv -e .env.development -- next build

echo "🚀 Restarting PM2 process..."
pm2 delete communication_system || true
dotenv -e .env.development -- pm2 start npm --name "communication_system" -- run start

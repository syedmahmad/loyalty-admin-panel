#!/bin/bash

# We can take pull in the same file but once jenkins setup, we don't need to do this
set -e

echo "🔄 Cleaning previous build..."
rm -rf .next

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔧 Building for development..."
npx dotenv -e .env -- next build

echo "🚀 Restarting PM2 process..."
pm2 delete loyalty_admin || true
dotenv -e .env -- pm2 start npm --name "loyalty_admin" -- run start

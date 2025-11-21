#!/bin/bash

echo "🚀 Starting Shop Management Desktop App..."
echo ""
echo "Building Angular app..."
npm run build

echo ""
echo "Launching Electron..."
npm run electron

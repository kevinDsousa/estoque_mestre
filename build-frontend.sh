#!/bin/bash
set -e

echo "Building frontend..."
pnpm --filter front build

echo "Checking if browser directory exists..."
if [ -d "apps/front/dist/front/browser" ]; then
    echo "Copying files from browser directory..."
    cp -r apps/front/dist/front/browser/* apps/front/dist/front/
    echo "Removing browser directory..."
    rm -rf apps/front/dist/front/browser
    echo "Files copied successfully!"
else
    echo "Browser directory not found, files should already be in the correct location"
fi

echo "Build completed successfully!"

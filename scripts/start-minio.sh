#!/bin/bash

echo "🚀 Starting MinIO for Estoque Mestre..."

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose first."
    exit 1
fi

# Start MinIO
docker-compose -f docker-compose.minio.yml up -d

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
sleep 10

# Check if MinIO is running
if docker-compose -f docker-compose.minio.yml ps | grep -q "Up"; then
    echo "✅ MinIO is running!"
    echo "📊 MinIO Console: http://localhost:9001"
    echo "🔑 Username: minioadmin"
    echo "🔑 Password: minioadmin"
    echo "📁 Bucket: estoque-mestre"
else
    echo "❌ Failed to start MinIO"
    exit 1
fi








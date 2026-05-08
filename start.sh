#!/bin/bash

# CloudPulse Smart Startup Script
# Automatically finds available ports and starts the application

echo "🚀 CloudPulse Smart Startup"
echo "=========================="

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Find available backend port
BACKEND_PORT=5000
while ! check_port $BACKEND_PORT; do
    echo "⚠️  Port $BACKEND_PORT is in use, trying next port..."
    BACKEND_PORT=$((BACKEND_PORT + 1))
    if [ $BACKEND_PORT -gt 5010 ]; then
        echo "❌ No available ports found between 5000-5010"
        exit 1
    fi
done
echo "✅ Backend will use port: $BACKEND_PORT"

# Find available frontend port
FRONTEND_PORT=80
while ! check_port $FRONTEND_PORT; do
    echo "⚠️  Port $FRONTEND_PORT is in use, trying next port..."
    FRONTEND_PORT=$((FRONTEND_PORT + 1))
    if [ $FRONTEND_PORT -gt 90 ]; then
        echo "❌ No available ports found between 80-90"
        exit 1
    fi
done
echo "✅ Frontend will use port: $FRONTEND_PORT"

# Create temporary docker-compose file with dynamic ports
cat > docker-compose.temp.yml <<EOF
version: '3.8'

services:
  backend:
    image: ghcr.io/chiranth-janardhan-moger/cloudpulse/backend:main-dac8e92
    container_name: cloudpulse-backend
    ports:
      - "$BACKEND_PORT:5000"
    environment:
      - PORT=5000
    restart: unless-stopped
    networks:
      - cloudpulse-network

  frontend:
    image: ghcr.io/chiranth-janardhan-moger/cloudpulse/frontend:main-dac8e92
    container_name: cloudpulse-frontend
    ports:
      - "$FRONTEND_PORT:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - cloudpulse-network

networks:
  cloudpulse-network:
    driver: bridge
EOF

echo ""
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.temp.yml up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CloudPulse started successfully!"
    echo "=========================="
    echo "📊 Frontend: http://localhost:$FRONTEND_PORT"
    echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
    echo ""
    echo "To view logs: docker-compose -f docker-compose.temp.yml logs -f"
    echo "To stop:      docker-compose -f docker-compose.temp.yml down"
else
    echo "❌ Failed to start containers"
    rm docker-compose.temp.yml
    exit 1
fi

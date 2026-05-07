#!/bin/bash

echo "=========================================="
echo "Cloud Idle Instance Monitor Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo ""
    echo "Please edit backend/.env and add your AWS credentials:"
    echo "  - AWS_ACCESS_KEY_ID"
    echo "  - AWS_SECRET_ACCESS_KEY"
    echo "  - AWS_REGION"
    echo ""
    read -p "Press Enter to continue after updating the .env file..."
fi

# Build and start containers
echo ""
echo "Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Application is running at:"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost:5000"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""

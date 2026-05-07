@echo off
echo ==========================================
echo Cloud Idle Instance Monitor Setup
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create backend .env file if it doesn't exist
if not exist backend\.env (
    echo Creating backend\.env file...
    copy backend\.env.example backend\.env
    echo.
    echo Please edit backend\.env and add your AWS credentials:
    echo   - AWS_ACCESS_KEY_ID
    echo   - AWS_SECRET_ACCESS_KEY
    echo   - AWS_REGION
    echo.
    pause
)

REM Build and start containers
echo.
echo Building and starting Docker containers...
docker-compose up --build -d

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Application is running at:
echo   Frontend: http://localhost
echo   Backend:  http://localhost:5000
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop the application:
echo   docker-compose down
echo.
pause

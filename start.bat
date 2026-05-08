@echo off
REM CloudPulse Smart Startup Script for Windows
REM Automatically finds available ports and starts the application

echo.
echo CloudPulse Smart Startup
echo ==========================
echo.

REM Function to check if port is available
set BACKEND_PORT=5000
:check_backend_port
netstat -ano | findstr ":%BACKEND_PORT% " >nul 2>&1
if %errorlevel% equ 0 (
    echo Port %BACKEND_PORT% is in use, trying next port...
    set /a BACKEND_PORT+=1
    if %BACKEND_PORT% gtr 5010 (
        echo No available ports found between 5000-5010
        exit /b 1
    )
    goto check_backend_port
)
echo Backend will use port: %BACKEND_PORT%

REM Find available frontend port
set FRONTEND_PORT=80
:check_frontend_port
netstat -ano | findstr ":%FRONTEND_PORT% " >nul 2>&1
if %errorlevel% equ 0 (
    echo Port %FRONTEND_PORT% is in use, trying next port...
    set /a FRONTEND_PORT+=1
    if %FRONTEND_PORT% gtr 90 (
        echo No available ports found between 80-90
        exit /b 1
    )
    goto check_frontend_port
)
echo Frontend will use port: %FRONTEND_PORT%

REM Create temporary docker-compose file
echo version: '3.8' > docker-compose.temp.yml
echo. >> docker-compose.temp.yml
echo services: >> docker-compose.temp.yml
echo   backend: >> docker-compose.temp.yml
echo     image: ghcr.io/chiranth-janardhan-moger/cloudpulse/backend:main-dac8e92 >> docker-compose.temp.yml
echo     container_name: cloudpulse-backend >> docker-compose.temp.yml
echo     ports: >> docker-compose.temp.yml
echo       - "%BACKEND_PORT%:5000" >> docker-compose.temp.yml
echo     environment: >> docker-compose.temp.yml
echo       - PORT=5000 >> docker-compose.temp.yml
echo     restart: unless-stopped >> docker-compose.temp.yml
echo     networks: >> docker-compose.temp.yml
echo       - cloudpulse-network >> docker-compose.temp.yml
echo. >> docker-compose.temp.yml
echo   frontend: >> docker-compose.temp.yml
echo     image: ghcr.io/chiranth-janardhan-moger/cloudpulse/frontend:main-dac8e92 >> docker-compose.temp.yml
echo     container_name: cloudpulse-frontend >> docker-compose.temp.yml
echo     ports: >> docker-compose.temp.yml
echo       - "%FRONTEND_PORT%:80" >> docker-compose.temp.yml
echo     depends_on: >> docker-compose.temp.yml
echo       - backend >> docker-compose.temp.yml
echo     restart: unless-stopped >> docker-compose.temp.yml
echo     networks: >> docker-compose.temp.yml
echo       - cloudpulse-network >> docker-compose.temp.yml
echo. >> docker-compose.temp.yml
echo networks: >> docker-compose.temp.yml
echo   cloudpulse-network: >> docker-compose.temp.yml
echo     driver: bridge >> docker-compose.temp.yml

echo.
echo Starting Docker containers...
docker-compose -f docker-compose.temp.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo CloudPulse started successfully!
    echo ==========================
    echo Frontend: http://localhost:%FRONTEND_PORT%
    echo Backend:  http://localhost:%BACKEND_PORT%
    echo.
    echo To view logs: docker-compose -f docker-compose.temp.yml logs -f
    echo To stop:      docker-compose -f docker-compose.temp.yml down
) else (
    echo Failed to start containers
    del docker-compose.temp.yml
    exit /b 1
)

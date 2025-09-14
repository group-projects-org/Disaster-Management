@echo off
echo Installing Disaster Management Server as Windows Service...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ Please run this script as Administrator
    echo Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

REM Check if NSSM is available
where nssm >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ NSSM found
) else (
    echo ❌ NSSM not found. Installing NSSM...
    echo Please download NSSM from: https://nssm.cc/
    echo Place nssm.exe in this folder and run this script again
    pause
    exit /b 1
)

REM Get current directory
set "CURRENT_DIR=%~dp0"
set "PYTHON_PATH=%CURRENT_DIR%python.exe"
set "APP_PATH=%CURRENT_DIR%app.py"

REM Install the service
echo Installing service...
nssm install "DisasterManagementServer" "%PYTHON_PATH%" "%APP_PATH%"
nssm set "DisasterManagementServer" AppDirectory "%CURRENT_DIR%"
nssm set "DisasterManagementServer" Description "Disaster Management System Backend Server"
nssm set "DisasterManagementServer" Start SERVICE_AUTO_START

echo.
echo ✅ Service installed successfully!
echo.
echo To start the service: net start DisasterManagementServer
echo To stop the service: net stop DisasterManagementServer
echo To remove the service: nssm remove DisasterManagementServer
echo.
pause

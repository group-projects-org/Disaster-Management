@echo off
echo Starting Disaster Management Server...
echo.
echo Server will run on: http://127.0.0.1:8000
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python app.py
pause

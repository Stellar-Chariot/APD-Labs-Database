@echo off
echo Starting Scientific Data Management System...

:: Set paths
set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0backend\scientific-data-frontend

:: Check if MongoDB is running (you will need to adjust this based on your setup)
echo Checking if MongoDB is running...
:: This is a simple check - you might need to adjust based on your MongoDB installation
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running.
) else (
    echo WARNING: MongoDB might not be running. Some features may not work.
    echo Please start MongoDB before continuing.
    pause
)

:: Start backend in a new window
echo Starting backend server...
start cmd /k "cd /d "%BACKEND_DIR%" && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 5 /nobreak

:: Start frontend in a new window
echo Starting frontend...
start cmd /k "cd /d "%FRONTEND_DIR%" && npm start"

echo ========================================================
echo Scientific Data Management System starting...
echo Backend: http://localhost:4000/graphql
echo Frontend: http://localhost:3000
echo ========================================================

echo Press any key to close this window (services will continue running in their own windows)
pause > nul 
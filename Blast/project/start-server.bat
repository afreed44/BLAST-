@echo off
echo Starting BLAST Podilato Server...
echo ================================

cd /d "%~dp0"

if not exist "server" (
    echo Error: Server directory not found!
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

cd server

if not exist "package.json" (
    echo Error: package.json not found in server directory!
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo Starting server...
npm start

pause

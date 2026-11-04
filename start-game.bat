@echo off
title Space Shooter Odyssey - Game Server
color 0B

echo =======================================================
echo   SPACE SHOOTER ODYSSEY - 24/7 AUTO-RUN LAUNCHER
echo =======================================================
echo.

cd /d "%~dp0"

:: Check if frontend dist exists
if not exist "frontend\dist\index.html" (
    echo [*] First time setup: Building frontend and backend...
    call npm run build:all
) else if not exist "backend\dist\server.js" (
    echo [*] Building backend...
    call npm run build:backend
)

echo [*] Launching browser in 3 seconds...
start "" timeout /t 3 /nobreak >nul & start http://localhost:5000

:LOOP
echo [*] Starting game server on http://localhost:5000...
node backend\dist\server.js
echo [!] Server exited or stopped at %date% %time%.
echo [*] Auto-restarting in 2 seconds...
timeout /t 2 /nobreak >nul
goto LOOP

@echo off
chcp 65001 >nul
title DrawStamp Editor Starter

echo ==================================================
echo         DrawStamp Editor Starter
echo ==================================================
echo.

rem 1. Check if node_modules directory exists
if not exist node_modules (
    echo [Info] Dependency library not found, running npm install automatically...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [Error] Dependency installation failed, please check Node.js environment.
        pause
        exit /b %errorlevel%
    )
    echo.
    echo [Success] Dependencies installed successfully!
    echo.
)

rem 2. Start Vite dev server and open in browser
echo [Info] Starting Vite dev server and opening editor in browser...
echo.
call npx vite --open

pause

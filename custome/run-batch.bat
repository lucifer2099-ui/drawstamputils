@echo off
chcp 65001 >nul
title Batch Stamp Generator

echo ==================================================
echo         Starting Batch Stamp Generation...
echo ==================================================
echo.

rem Navigate to root directory
cd /d "%~dp0\.."

rem Run the batch generation script
call npm run batch

echo.
echo ==================================================
echo   Done! Images saved in custome/output directory.
echo ==================================================
echo.
pause

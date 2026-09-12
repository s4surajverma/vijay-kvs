@echo off
title KVS Administrator Web Portal Setup

echo ====================================================
echo Starting KVS Administrator Web Portal locally...
echo ====================================================
echo.

echo [1/3] Terminating any existing server process on port 8089...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8089 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [2/3] Starting HTTP server on http://localhost:8089/ ...
start "KVS Portal Server" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

echo Waiting for server initialization...
timeout /t 2 /nobreak >nul

echo [3/3] Opening application in default web browser...
start http://localhost:8089/

echo.
echo ====================================================
echo Server successfully launched at http://localhost:8089/
echo Keep the server console window open while using the application.
echo ====================================================
echo.
pause

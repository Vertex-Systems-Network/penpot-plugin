@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. The download page will open; install the LTS version, then double-click this file again.
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)
node spike\ui\server.mjs
pause

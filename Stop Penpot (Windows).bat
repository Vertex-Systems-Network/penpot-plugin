@echo off
rem Stops the self-hosted Penpot. Designs are kept and come back on the next start.
cd /d "%~dp0self-host"
docker compose stop
echo Penpot stopped. Your designs are kept.
pause

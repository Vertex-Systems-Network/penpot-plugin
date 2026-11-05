@echo off
rem Starts the self-hosted Penpot (Docker) and opens it at http://localhost:9001
cd /d "%~dp0self-host"
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop is not installed. The download page will open; install it, start it once, then double-click this file again.
  start "" "https://www.docker.com/products/docker-desktop/"
  pause
  exit /b 1
)
docker info >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop is installed but not running. Start Docker Desktop, wait until it says "running", then double-click this file again.
  pause
  exit /b 1
)
if not exist ".env" (
  for /f %%k in ('powershell -NoProfile -Command "[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])"') do echo PENPOT_SECRET_KEY=%%k> .env
  echo Created a private secret key in self-host\.env
)
echo Starting Penpot. The first start downloads about 1.5 GB and can take several minutes.
docker compose up -d
if errorlevel 1 (
  echo Penpot did not start. Copy the messages above for Claude.
  pause
  exit /b 1
)
echo Waiting for Penpot to answer ...
powershell -NoProfile -Command "$u='http://localhost:9001'; for($i=0;$i -lt 120;$i++){ try { Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 3 | Out-Null; exit 0 } catch { Start-Sleep 3 } }; exit 1"
if errorlevel 1 (
  echo Penpot is still starting. Open http://localhost:9001 in a minute.
) else (
  echo Penpot is ready.
)
start "" "http://localhost:9001"
pause

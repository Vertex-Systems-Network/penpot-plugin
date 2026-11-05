#!/bin/bash
# Starts the self-hosted Penpot (Docker) and opens it at http://localhost:9001
cd "$(dirname "$0")/self-host" || exit 1
pause_exit() { read -n 1 -s -r -p "Press any key to close."; exit "$1"; }
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is not installed. The download page will open; install it, start it once, then double-click this file again."
  open "https://www.docker.com/products/docker-desktop/"; pause_exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop is installed but not running. Start it, wait until it says running, then double-click this file again."; pause_exit 1
fi
if [ ! -f .env ]; then
  echo "PENPOT_SECRET_KEY=$(openssl rand -base64 48 | tr -d '\n')" > .env
  echo "Created a private secret key in self-host/.env"
fi
echo "Starting Penpot. The first start downloads about 1.5 GB and can take several minutes."
docker compose up -d || { echo "Penpot did not start. Copy the messages above for Claude."; pause_exit 1; }
echo "Waiting for Penpot to answer ..."
for _ in $(seq 1 120); do curl -sf -o /dev/null http://localhost:9001 && break; sleep 3; done
open "http://localhost:9001"
echo "Penpot is at http://localhost:9001"
pause_exit 0

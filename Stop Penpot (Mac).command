#!/bin/bash
# Stops the self-hosted Penpot. Designs are kept and come back on the next start.
cd "$(dirname "$0")/self-host" || exit 1
docker compose stop
echo "Penpot stopped. Your designs are kept."
read -n 1 -s -r -p "Press any key to close."

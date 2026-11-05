# penpot-plugin

Writes designs into Penpot through its backend API, so no Penpot browser tab has to stay open.

## Why

The official Penpot MCP server sends every command to a plugin running inside an open Penpot tab. When the browser suspends or freezes that tab, design work stops. This server talks to Penpot's RPC API with an access token instead.

The public design.penpot.app puts token API calls behind a Cloudflare browser check ("Just a moment..."), which scripts cannot pass. So this runs against a self-hosted Penpot.

## 1. Run Penpot on your computer

Needs [Docker Desktop](https://www.docker.com/products/docker-desktop/), running, and about 4 GB of free memory.

1. Double-click `Start Penpot (Windows).bat` (or `Start Penpot (Mac).command`). The first start downloads about 1.5 GB; later starts take seconds. Penpot opens at http://localhost:9001.
2. Create an account there (no email check; the address only needs to look like one).
3. Move the existing designs over: on design.penpot.app open the file, use **File, Export** to save a `.penpot` file, then in your local Penpot use **Import** on the dashboard.
4. Make a token: **Settings, Access tokens, Generate new token**.

`Stop Penpot (Windows).bat` stops it; designs are kept for the next start. `self-host/docker-compose.yaml` is Penpot's official stack with `enable-access-tokens` added; the start script writes a private secret key to `self-host/.env` once.

## 2. Write a design

Needs [Node.js](https://nodejs.org/en/download) 18 or newer.

1. Double-click `Start Design Writer (Windows).bat` (or `Start Design Writer (Mac).command`). A page opens in your browser.
2. Paste the access token and the file id (from the file's address bar, after `file-id=`). The Penpot address is already `http://localhost:9001`.
3. Pick a design file from `designs/` (for example `01-overview.json`).
4. Choose **Run now** or **Schedule for later** and press **Write to Penpot**. The progress bar shows the percentage and the layer being written; **Pause**, **Resume**, **Cancel** and **Reschedule** appear while a run is active.

It adds the design as a new page. Penpot's editor lays out flex boards and measures text itself when the page opens (confirmed by `spike/check-api.mjs`), so the writer sends flex rules, not computed positions.

From a terminal (this is how Claude runs it on a linked computer): put the token in `.penpot-token` (never committed), then `node src/render.mjs designs/01-overview.json <file id>`.

## Design files

`node designs/build.mjs` regenerates the JSON screens from WPEssential's tokens. The tree format is documented at the top of `src/render.mjs`. Checks: `node src/render.test.mjs` and `node src/e2e.test.mjs`.

# penpot-plugin

An MCP server that designs in Penpot through its backend API, so no Penpot browser tab has to stay open.

Status: spike. The real server is built once the spike answers the questions below.

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

## 2. Run the spike

Needs [Node.js](https://nodejs.org/en/download) 18 or newer.

1. Double-click `Start Penpot spike (Windows).bat` (or `Start Penpot spike (Mac).command`). A form opens in your browser.
2. Paste the access token and the file id (from the file's address bar, after `file-id=`). The Penpot address is already `http://localhost:9001`.
3. Choose **Run now** or **Schedule for later** and press **Run the test**. A progress bar shows each step and its percentage; **Pause**, **Resume**, **Cancel** and **Reschedule** appear while a run is active.
4. Answer the three questions and press **Copy result for Claude**.

From a terminal instead: `PENPOT_TOKEN=<token> PENPOT_FILE_ID=<file id> node spike/check-api.mjs`.

It creates a page named "API spike" and checks:

1. whether the token API accepts the calls;
2. whether API-created text renders;
3. whether the editor applies flex layout to an API-created board.

Delete the "API spike" page afterwards.

## Plan

Based on [zcube/penpot-mcp-server](https://github.com/zcube/penpot-mcp-server) (MIT), plus what it lacks:

1. A layout engine: flex layout (Yoga) and text measurement (font metrics), because the backend stores shapes but the browser editor normally computes layout and text size.
2. A `render_tree` tool: describe a screen as a tree of boards, text, rectangles and icons with flex rules; the server computes positions and writes it in small batches with progress, pause, resume, cancel and scheduling.
3. The same local UI to watch and control running jobs.

How much of step 1 is needed depends on the spike.

# penpot-plugin

An MCP server that designs in Penpot through its backend API, so no Penpot browser tab has to stay open.

Status: spike. The real server is built once the spike answers the questions below.

## Why

The official Penpot MCP server sends every command to a plugin running inside an open Penpot tab. When the browser suspends or freezes that tab, design work stops. This server talks to Penpot's RPC API with an access token instead.

## Plan

Based on [zcube/penpot-mcp-server](https://github.com/zcube/penpot-mcp-server) (MIT), plus what it lacks:

1. A layout engine: flex layout (Yoga) and text measurement (font metrics), because the backend stores shapes but the browser editor normally computes layout and text size.
2. A `render_tree` tool: describe a screen as a tree of boards, text, rectangles and icons with flex rules; the server computes positions and writes it in one `update-file` call.
3. Batching and small changes, so large screens never need a browser.

How much of step 1 is needed depends on the spike.

## Spike

```bash
PENPOT_TOKEN=<access token> PENPOT_FILE_ID=<file id> node spike/check-api.mjs
```

Get a token in Penpot under Settings, Access tokens. It creates a page named "API spike" and checks:

1. whether design.penpot.app accepts token API calls or Cloudflare blocks them;
2. whether API-created text renders;
3. whether the editor applies flex layout to an API-created board.

Delete the "API spike" page afterwards.

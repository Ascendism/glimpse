# Glimpse Cortex Package

This document describes the Glimpse Cortex Store package — how it's structured, how agents interact with it, and how it relates to the standalone multiplayer game.

## Package Identity

- **ID**: `cortex.glimpse`
- **Publisher**: PhotoniX / Ascendism
- **License**: MIT
- **Version**: 0.1.0
- **Entitlement**: Free
- **Repository**: https://github.com/Ascendism/glimpse

## What is This Package?

Glimpse is a **multiplayer identify-the-clip party game** where players watch video clips and compete to guess the title. This Cortex package exposes the game's multiplayer engine and content library as **agent-driveable operations** (ops).

### Two Ways to Use Glimpse

1. **Standalone Web Game** (Primary Path)
   - Run `npm run dev` and visit `http://localhost:3000`
   - Host creates table, shares code, players join
   - Real-time multiplayer with polling sync
   - Full UI for watching clips, guessing, scoring

2. **Cortex Package** (Agent-Driven Path)
   - Install via Cortex Store
   - Agents can create tables, manage library, configure routines
   - Drive game state through ops (`glimpse.table.*`, `glimpse.library.*`, etc.)
   - Suitable for automated tournaments, content management, analytics

## Architecture

### Data Separation

The package distinguishes three layers of data:

1. **Package Code** (`cortex-package.json`, ops, adapters)
   - Installed by Cortex Store
   - Lives in package registry
   - Read-only after installation

2. **Package Data** (future: user preferences, default catalogs)
   - Install-scoped configuration
   - Shipped in package, may be edited by user
   - Not touched by game runtime

3. **Project/Game Data** (game tables, player scores, library clips)
   - Runtime state managed by `game-state.ts`
   - Persisted to temp directory (`/tmp/glimpse-dev-state/`)
   - NOT stored in package installation
   - Survives dev server restarts but not system reboots

### File Layout

```
glimpse/
├── cortex-package.json         # Package metadata (schema: cortex-package.v1)
├── tools.manifest.json         # Op declarations (schema: tools.manifest.v1)
├── ops/
│   └── index.js                # createOps(ctx) - centralized implementation
├── adapters/
│   ├── cortex/
│   │   └── activate.js         # Cortex activation/deactivation
│   └── mcp/
│       └── server.js           # MCP server stub (Node.js)
├── scripts/
│   └── pack-release.sh         # Build cortex-glimpse-${version}.tgz
├── src/                        # TanStack Start app (standalone game)
│   ├── routes/                 # API routes + UI pages
│   ├── components/             # React components
│   └── lib/
│       ├── game-state.ts       # Multiplayer state (ops wrapper target)
│       ├── library.ts          # Clip library types
│       └── puzzle.ts           # Board layout logic
├── PACKAGE.md                  # This file
├── README.md                   # Quick start for standalone game
└── package.json                # Node/npm dependencies
```

## Operations (Ops)

All ops live in `ops/index.js` via `createOps(ctx)`. Adapters (Cortex, MCP) wire the same implementation — **no forked logic**.

### Table Management

- **`glimpse.table.create`** → Create multiplayer table, return 6-char code
- **`glimpse.table.inspect(tableId)`** → Get full game state
- **`glimpse.table.list`** → List active tables (note: requires state exposure, currently limited)

### Library Management

- **`glimpse.library.list(tableId)`** → List all clips and playlists
- **`glimpse.library.addYoutubeClip(tableId, ...)`** → Add YouTube clip with metadata
- **`glimpse.library.inspect(tableId, clipId)`** → Get detailed clip info

### Routine Orchestration

- **`glimpse.routine.configure(tableId, config)`** → Set up automated playlist
- **`glimpse.routine.start(tableId)`** → Start routine playback
- **`glimpse.routine.pause(tableId)`** → Pause routine
- **`glimpse.routine.stop(tableId)`** → Stop and reset
- **`glimpse.routine.inspect(tableId)`** → Check routine status

### Game State

- **`glimpse.game.getState(tableId)`** → Compact snapshot (phase, players, scores)

### Host Overrides

- **`glimpse.segment.advance(tableId)`** → Manually increase clip duration (1s → 2s → 3s → 5s)
- **`glimpse.hint.give(tableId)`** → Reveal hint letters from title

## Installation

### Cortex Store (Recommended for Agents)

```bash
# Future: Once published to Cortex Store
cortex install cortex.glimpse
```

The Cortex runtime will:
1. Download `cortex-glimpse-${version}.tgz`
2. Verify checksums from `SHA256SUMS.txt`
3. Unpack to package directory
4. Call `adapters/cortex/activate.js` to register ops

### Manual Installation (Development)

```bash
git clone https://github.com/Ascendism/glimpse.git
cd glimpse
npm install
npm run dev  # Standalone game server on :3000
```

To test ops:

```bash
node adapters/mcp/server.js --test
```

## Building a Release

```bash
bash scripts/pack-release.sh
```

Produces:
- `cortex-glimpse-0.1.0.tgz` (package tarball)
- `SHA256SUMS.txt` (checksums)

The script:
- Reads version from `cortex-package.json`
- Excludes `node_modules`, `.git`, `.env*`, build artifacts
- Stages required files (ops, adapters, manifests, docs)
- Creates compressed tarball with checksums

To verify:

```bash
sha256sum -c SHA256SUMS.txt
```

## Adapters

### Cortex Adapter

**File**: `adapters/cortex/activate.js`

Exports `activate(cortexContext)` and `deactivate(cortexContext)`.

On activation:
1. Creates ops via `createOps({ logger, permissions, workspacePath })`
2. Registers each op with `cortexContext.registerOps(name, handler)`
3. Returns success with ops list

### MCP Adapter (Stub)

**File**: `adapters/mcp/server.js`

Demonstrates how to wire ops for MCP. A full implementation would:
1. Import `@modelcontextprotocol/sdk`
2. Set up stdio transport
3. Register ops as MCP tools (with schemas from `tools.manifest.json`)
4. Handle `tool_call` requests by invoking ops
5. Stream responses

Currently a stub that validates ops can be loaded in Node context.

## Permissions

Declared in `cortex-package.json`:

- **`fs.read`** (workspace) — Read persisted game table state
- **`fs.write`** (workspace) — Persist game tables, clips, scores
- **`net.fetch`** (`*.youtube.com`, `*.googleapis.com`) — Optional: validate YouTube metadata

All permissions include reason strings for transparency.

## UI vs. Skill

The `ui.skill` field is set to `enabled: false` because:

- Glimpse is a **standalone TanStack/Vite party game** with its own full UI
- The entire app is NOT a Cortex Skill chrome overlay
- Use `npm run dev` for multiplayer gameplay
- This package exposes **ops only** for agent-driven table/library management

If you want a minimal Cortex Skill UI (e.g., table browser, library manager), that would be a separate lightweight component, not the full game UI.

## Limitations & Future Work

### Current Limitations

1. **No Persistence Beyond Temp Directory**
   - Tables stored in `/tmp/` (survives dev restarts, not reboots)
   - Production needs database (PostgreSQL, Redis, etc.)

2. **Polling-Based Sync**
   - Clients poll `/api/table/{tableId}/state` every 1 second
   - Higher latency than WebSocket/SSE
   - Future: real-time transport

3. **Table Listing Incomplete**
   - `glimpse.table.list` currently limited
   - Requires exposing internal state map or implementing table index

4. **MCP Adapter is Stub**
   - Full MCP protocol implementation pending
   - Needs `@modelcontextprotocol/sdk` integration

5. **No "Close Enough" Matching**
   - Host must manually judge all guesses
   - Future: fuzzy string matching for scoring

### Future Enhancements

- **Database persistence** (replace in-memory Map)
- **WebSocket/SSE** for real-time sync
- **Fuzzy matching** for automated scoring
- **Escalating points** based on speed/accuracy
- **Full MCP server** with stdio transport
- **Catalog management** (import/export clip packs)
- **Analytics dashboard** (agent-driven via ops)

## Troubleshooting

### Ops fail with "Game state module not available"

**Cause**: TypeScript modules not built or Node can't import ESM.

**Fix**:
```bash
npm install
npm run build  # If build script exists
```

Or ensure Node.js >= 16 with ESM support.

### Tables disappear after reboot

**Expected**: Tables stored in `/tmp/` are cleared on reboot.

**Workaround**: Implement persistent storage (database).

### MCP server doesn't respond

**Status**: MCP adapter is a stub.

**Workaround**: Call ops directly from `ops/index.js` or use Cortex adapter.

## Contributing

Glimpse is open source (MIT License). To contribute:

1. Fork https://github.com/Ascendism/glimpse
2. Create feature branch: `git checkout -b feature/your-feature`
3. Add ops/adapters as needed
4. Update `tools.manifest.json` for new ops
5. Test with `npm run dev` and `bash scripts/pack-release.sh`
6. Submit PR to `main`

## Credits

- **Publisher**: PhotoniX / Ascendism
- **Original Cortex Implementation**: CarapaceUDE/cortex (reference in `reference/cortex-glimpse/`)
- **TanStack Start Rebuild**: This repository (standalone web app)
- **UI Foundation**: Lovable.dev board seed (preserved styling)

## License

MIT License - see repository for full text.

## Support

- **Issues**: https://github.com/Ascendism/glimpse/issues
- **Discussions**: https://github.com/Ascendism/glimpse/discussions
- **Cortex Store**: (future: link to catalog page once published)

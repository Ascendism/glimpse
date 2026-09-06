# Cortex Glimpse - Reference Implementation

This is a **read-only snapshot** of Glimpse as it lived inside the CarapaceUDE/cortex repository.

## Purpose

This directory contains a frozen reference copy of the original Glimpse implementation from the Cortex monorepo. It is preserved here for historical reference and code archaeology purposes only.

## Important Notes

⚠️ **This is NOT the live product.**

- This code is a static snapshot and should not be modified
- Do not integrate this code into the new UI unless explicitly asked
- The live rebuild is the main app in this repository
- This reference exists purely for documentation and comparison purposes

## Original Structure

The original Glimpse implementation in CarapaceUDE/cortex consisted of:

- `lib/cortexGlimpse/` - Core game logic, room management, catalog handling, Discord auth, and backend services
- `public/glimpse/` - Client-side code, UI components, HTML pages, and styles

## What This Contains

This reference copy includes:

1. **Backend Logic** (`lib/cortexGlimpse/`):
   - Game state management (boardState, room, roundClock)
   - Content catalog and clip selection (catalog, clipSelect, seedPack)
   - Game mechanics (judge, matcher, scoring, hunt)
   - Media handling (mediaItem, materializeClip, youtubeValidation)
   - Authentication and identity (discordAuth, identityDb)
   - HTTP endpoints and WebSocket handlers (http, client communication)

2. **Frontend Assets** (`public/glimpse/`):
   - Player and host interfaces (player.js, host.js, host.html, play.html)
   - Game client logic (client.js)
   - UI styling (glimpse.css)
   - Stage and on-air components (stage.html, boardStage.js, onair.js)
   - Video synchronization (videoSync.js)
   - Archive board functionality (archiveBoard.js)

## Source Repository

Copied from: [CarapaceUDE/cortex](https://github.com/CarapaceUDE/cortex)

See MANIFEST.md for the exact commit SHA and file listing.

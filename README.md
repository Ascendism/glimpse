# Glimpse

**Glimpse** is a multiplayer party game where players identify movies, TV shows, and songs from video clips in real-time.

## What is Glimpse?

Glimpse is a host-authoritative identify-the-clip party game where:

- Everyone watches/hears **the same clip simultaneously**
- Players submit **free-text guesses** to identify the movie/show/song
- The **host** controls playback, judges guesses, and manages the game flow
- Scores are tracked live for all players
- After judging, the title is revealed with an animated **flip-tile board** (keeping the Lovable board UI)

## Features

- **Multiplayer Seats**: Join a table with a code, see all players and live scores
- **Synced Clip Playback**: YouTube embeds with host transport authority
- **Shared Chat**: Everyone can chat at the table
- **Free-Text Guessing**: Type any guess during the playing phase
- **Host Controls**: 
  - Start rounds by selecting clips
  - Lock guesses to move to judging
  - Edit any player's score
  - Reveal the title with flip-tile animation
  - Host can also play and guess
- **Animated Title Reveal**: After judging, the PuzzleBoard flip tiles reveal the title letter-by-letter

## How to Play

1. **Create a Table**: Click "Create Table" to generate a unique table code
2. **Invite Friends**: Share the table code with friends who join via "Join Table"
3. **Host Starts Round**: Host picks a clip from the library
4. **Watch & Guess**: Everyone watches the clip and submits guesses
5. **Lock & Judge**: Host locks guesses and reviews submissions
6. **Reveal**: Host reveals the title with the animated board
7. **Repeat**: Continue with more clips and track scores

## Development

### Install

```sh
bun install
# or
npm install
```

### Run Dev Server

```sh
bun run dev
# or
npm run dev
```

### Build

```sh
bun run build
# or
npm run build
```

## Technical Stack

- **TanStack Start** + React for the frontend
- **File-based API routes** for multiplayer state
- **In-memory game state** with polling (simple sync without external services)
- **YouTube embeds** for clip playback
- **Lovable board UI** (stage-bg, gold colors, flip tiles, Bebas/Barlow fonts)

## Cortex Package

Glimpse is also available as a **Cortex Store package** (`cortex.glimpse`) that exposes multiplayer game operations for agent-driven table management, library CRUD, and routine orchestration.

- **For agents/ops**: See [PACKAGE.md](./PACKAGE.md) for package structure, ops documentation, and installation
- **For standalone play**: Continue with the instructions above (`npm run dev`)

The Cortex package provides ops like `glimpse.table.create`, `glimpse.library.addYoutubeClip`, and `glimpse.routine.start` for programmatic game management.

## Notes

This project was reshaped from a Wheel of Fortune letter-guessing game into Glimpse, preserving the Lovable-seeded board UI and styling while completely replacing the gameplay with identify-the-clip multiplayer mechanics.

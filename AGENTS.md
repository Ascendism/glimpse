# Glimpse — Agent Notes

## Overview

Glimpse is a multiplayer identify-the-clip party game built with TanStack Start + React. The UI foundation (Lovable board seed) was preserved: stage background, gold colors, flip tiles, fonts, and CSS utilities from `src/styles.css`.

## Architecture

### Frontend
- **Main route**: `src/routes/index.tsx` — handles lobby (create/join), game table UI, and rendering
- **PuzzleBoard**: `src/components/PuzzleBoard.tsx` — flip-tile reveal for titles (unchanged from Lovable seed)
- **Polling**: Client polls `/api/table/{tableId}/state` every 1 second for game state updates

### Backend
- **Game state**: `src/lib/game-state.ts` — in-memory multiplayer state management
- **Clips**: `src/lib/puzzle.ts` — `GLIMPSE_CLIPS` array with YouTube IDs, titles, categories
- **API routes**: `src/routes/api.table.*` — file-based routes for create, join, state, guess, chat, host actions

### Multiplayer Flow
1. Host creates table → gets `tableId`
2. Players join with table code + name → receive `playerId`
3. Game phases: `lobby` → `playing` → `guessing` → `judging` → `reveal`
4. Host controls: start round, lock guesses, reveal title, edit scores, reset
5. Players: watch synced clip, submit guesses, chat

### Key Changes from Lovable Seed
- Removed letter-guessing loop (alphabet keyboard, vowel buy, "Solve It")
- Replaced `PUZZLES` with `GLIMPSE_CLIPS` (title, type, category, youtubeId)
- Added multiplayer: players, scores, phases, guesses, chat
- Added host controls for game flow
- Kept PuzzleBoard for title reveal after judging
- Kept all Lovable styling: `stage-bg`, `text-gold-gradient`, `board-frame`, `tile-*`, `marquee-lights`

## How to Run

```sh
bun install
bun run dev
```

Visit `http://localhost:3000` → Create Table → Share code → Play!

## Extending

- **Add clips**: Edit `GLIMPSE_CLIPS` in `src/lib/puzzle.ts`
- **Persistence**: Replace in-memory `Map` in `game-state.ts` with a database
- **Real-time**: Replace polling with WebSocket/SSE for lower latency
- **Close Enough matching**: Add fuzzy string matching in host judging UI
- **Escalating points**: Implement point rules based on speed/accuracy

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

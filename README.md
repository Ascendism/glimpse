# Glimpse

A multiplayer identify-the-clip party game using TanStack Start, React, and a Node server.

```sh
npm ci
npm run dev -- --port 3000
```

Open http://localhost:3000. Create a table, share its invite, select clips, configure a routine, and start. The host judges; players guess and vote for longer segments or hints. Finish the game to save Discord-linked players' scores to the global leaderboard.

See [DISCORD_SETUP.md](DISCORD_SETUP.md) for Discord credentials, production deployment, persistence, and tests. Guest play works without Discord credentials. Put credentials in `.env` beside `package.json`; use `.env.example` as the template.

## Your clip library

Create a table and open **Operator Console → Glimpse Management** before configuring a routine.

1. Paste a YouTube URL/ID or a public hosted video URL and click **Load video**.
2. Play or scrub to your desired opening, then click **Mark start**. Move to the ending and click **Mark stop**. You can also enter exact fractional seconds.
3. Use **Preview selection** to audition just that range; playback stops at the stop marker. **Go to start**, **Go to stop**, and **Stop preview** help refine it.
4. Enter the answer/title, category, and content type, then **Save clip**. Search, edit, or delete clips in the library below.
5. Select saved clips in the game playlist, then configure and start the routine. Progressive game segments stay inside the saved range.

Custom clips and edits are stored in SQLite and automatically loaded into future tables you create. Guests keep their library through a private browser cookie; signing in with Discord claims that browser's guest clips and makes the library available on other signed-in devices. Clearing cookies before signing in loses access to a guest library. Deleting a custom clip removes it from your saved library and the current table; other tables already using a copy retain it. Built-in examples are seeded into each new table.

Clipping saves source URLs and playback boundaries, not downloaded/transcoded video files. Hosted URLs must work for all players and use HTTPS when the game is served over HTTPS. YouTube videos must allow embedded playback; unavailable/private videos and live streams cannot be reliably clipped. Keep the server's `GLIMPSE_STATE_DIR` on persistent storage to retain libraries, accounts, and scores.

## Implementation

- `src/lib/game-actions.ts`: validated server functions and seat-cookie authorization.
- `src/lib/game-state.ts`: table state, readiness, routine timing, votes, safe viewer snapshots, and recovery.
- `src/lib/discord-oauth.ts`: server-validated OAuth flow and HttpOnly sessions.
- `src/lib/db.ts` / `game-results.ts`: SQLite accounts, sessions, and transactional leaderboard results.
- `src/routes/index.tsx`: host/player flow; `stage.tsx`: read-only display; `leaderboard.tsx`: global standings.
- `src/components/GlimpsePlayer.tsx`: bounded playback and host-position synchronization.

Run one Node server process with persistent storage. This version is not a distributed/serverless game backend. Keep published Git history intact because the repository syncs with Lovable.

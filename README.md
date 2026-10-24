# Glimpse

A multiplayer identify-the-clip party game using TanStack Start, React, and a Node server.

```sh
npm ci
npm run dev -- --port 3000
```

Open http://localhost:3000. Create a table, share its invite, select clips, configure a routine, and start. The host judges; players guess and vote for longer segments or hints. Finish the game to save Discord-linked players' scores to the global leaderboard.

See [DISCORD_SETUP.md](DISCORD_SETUP.md) for Discord credentials, production deployment, persistence, and tests. Guest play works without Discord credentials. Put credentials in `.env` beside `package.json`; use `.env.example` as the template.

## Implementation

- `src/lib/game-actions.ts`: validated server functions and seat-cookie authorization.
- `src/lib/game-state.ts`: table state, readiness, routine timing, votes, safe viewer snapshots, and recovery.
- `src/lib/discord-oauth.ts`: server-validated OAuth flow and HttpOnly sessions.
- `src/lib/db.ts` / `game-results.ts`: SQLite accounts, sessions, and transactional leaderboard results.
- `src/routes/index.tsx`: host/player flow; `stage.tsx`: read-only display; `leaderboard.tsx`: global standings.
- `src/components/GlimpsePlayer.tsx`: bounded playback and host-position synchronization.

Run one Node server process with persistent storage. This version is not a distributed/serverless game backend. Keep published Git history intact because the repository syncs with Lovable.

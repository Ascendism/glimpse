# Discord login and leaderboard setup

1. Copy `.env.example` to `.env` beside `package.json`. A blank `.env` is already prepared in the audit checkout.
2. Open https://discord.com/developers/applications and create/select your application.
3. Put the application's Client ID in `DISCORD_CLIENT_ID` and OAuth2 Client Secret in `DISCORD_CLIENT_SECRET`.
4. Under OAuth2 > Redirects, add `http://localhost:3000/auth/discord/callback`. Set `DISCORD_REDIRECT_URI` to exactly that value.
5. Run `npm ci`, then `npm run dev -- --port 3000`. Restart the server after editing `.env`.

For a hosted game, register `https://YOUR-DOMAIN/auth/discord/callback` in Discord and use the same URL in the server environment. Everyone must use that domain. Use HTTPS. These settings belong on the server, never in `VITE_` variables or committed files. No bot token, bot invite, or Discord server permissions are needed: login requests only the `identify` scope.

## Playing and recording results

Log in before creating or joining a table. Guest play remains available. An invite survives the Discord redirect. Each Discord account can occupy one seat per table. Refreshing a tab restores its seat; leaving releases it. Login cookies are HttpOnly, expire after seven days, and logout deletes the server session.

The host selects clips and judges answers; the host does not compete. Players submit or lock guesses. Late joiners watch until the next round. The host can pause, skip phases, provide hints, and adjust scores. After judging, choose **Finish Game & Save Scores** from reveal or lobby. Results come from the server's scores and can only be saved once per game. Ties share placement. Guests and the host are excluded from global stats. **New Game** clears table scores and starts a fresh leaderboard result. Scores are host-judged party results, not a tamper-proof competitive ranking.

A host who leaves explicitly transfers hosting. If a host closes their tab or loses connection, another player can take over after 45 seconds; this resets the current round. An expired seat returns to the join form.

## Deployment and storage

Use Node 22.22 or newer and a **single Node server process**:

```sh
npm ci
npm run build
npm start
```

The start command reads `.env`. `PORT` controls the production port. The Node build is intentional: SQLite native bindings and filesystem state cannot run in the former Cloudflare worker target. Set `GLIMPSE_STATE_DIR` to a writable persistent volume. The default is `.data/` in the working directory, containing `glimpse.db` and `tables.json`. Back up that directory. An ephemeral filesystem loses accounts, sessions, and scores on redeploy. Multiple replicas require a shared database/state architecture; do not run this implementation in a multi-worker cluster.

The older build stored data in the operating system's temporary `glimpse-dev-state` directory. To preserve those records, stop the old process and set `GLIMPSE_STATE_DIR` to that existing directory, or copy its files to the new persistent directory while stopped. Old tables lack private seat tokens and are discarded; create a new table. Old leaderboard records remain readable.

Use YouTube clips that allow embedding or public hosted video URLs. Browser-local blob/file URLs cannot be shared with other devices, so the local-file form has been replaced with hosted URLs. Browser autoplay restrictions can require each viewer to tap **Enable video and sound**. External YouTube availability, embedding restrictions, and region restrictions remain provider-dependent.

## Verification

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
```

Browser tests use separate host/player/stage contexts and a simulated Discord provider in the test server only. They exercise real application cookies, RPC authorization, OAuth state checks, invite restoration, refresh, scoring, leaderboard, logout, and media playback. A final real Discord consent/login must be checked after supplying credentials; automated tests cannot validate an unconfigured Discord application.

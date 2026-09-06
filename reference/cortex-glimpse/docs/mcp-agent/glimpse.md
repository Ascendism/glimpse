# Glimpse

Host-authoritative media-recognition party game.

- Control Room: `GET /glimpse` (full host workspace, not a skill iframe)
- Skill slash: `/glimpse` → same Control Room (`SKILL_UI_HREF = '/glimpse'`)
- Guests (no Cortex): `GET /play/glimpse/:invite`
- Broadcast / OBS: `GET /play/glimpse/:invite/stage` (16:9)
- Host APIs: `/api/glimpse/*`
- Engine: `lib/cortexGlimpse/`
Storage: `{operatorHome}/glimpse/` (personal). Discord OAuth creds: `{operatorHome}/glimpse/discord.json` (copy `data/shipped/glimpse-discord.example.json`). Identity + table chat SQLite: `{operatorHome}/glimpse/identity.sqlite`. Redirect URL in the Discord app: `http://<host>:<port>/play/glimpse/auth/discord/callback`.

Guests never need a Cortex install or HTTP auth token. The invite is the credential.

**Hunt (off the hub):** operator **Find more** on the host table. Default is yt-dlp `ytsearch` (no browser). Optional Fling uses a **background tab** only — routines live in `{operatorHome}/glimpse/routines/`, never as hub-tick jobs. Shipped graph: `data/shipped/glimpse-fling-yt-search.blueprint.json`.

Guest clip: host ffmpeg extract into `{operatorHome}/glimpse/clips/` via Cortex clipping (`ingestClipMediaSource` + `composeClipCandidateWithFfmpeg`). Understand (`understandFromObservation`) can shift the window. Guests play `/play/glimpse/:invite/media` in the HTML animation stage (anime/motion stack wipe + mask). YouTube iframe is only a last resort if ingest/ffmpeg cannot produce a file.

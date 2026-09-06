'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { createRoomService } = require('../lib/cortexGlimpse/room');
const { registerGlimpseHttpRoutes } = require('../lib/cortexGlimpse/http');

const PORT = Number(process.env.GLIMPSE_PORT || 3788);
const HOME = process.env.HARNESS_GLIMPSE_HOME || path.join(os.tmpdir(), 'glimpse-live');
fs.mkdirSync(HOME, { recursive: true });

const app = express();
app.use(express.json());
const service = createRoomService({ operatorHome: HOME, now: () => Date.now() });
registerGlimpseHttpRoutes(app, { service });

app.get('/health', (_req, res) => res.json({ ok: true, game: 'glimpse' }));

const server = app.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(`glimpse-live http://127.0.0.1:${PORT} home=${HOME}\n`);
});
server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

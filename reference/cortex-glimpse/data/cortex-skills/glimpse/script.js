#!/usr/bin/env node
'use strict';

const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const SKILL_UI_HREF = '/glimpse';
const SKILL_ID = 'glimpse';

const { catalogForPool } = require(path.join(REPO_ROOT, 'lib', 'cortexGlimpse'));
const { getService } = require(path.join(REPO_ROOT, 'lib', 'cortexGlimpse', 'http.js'));

function parseArgs(argv) {
  const jsonArg = argv.find((entry) => entry.startsWith('{'));
  if (jsonArg) {
    try {
      return JSON.parse(jsonArg);
    } catch {
      /* fall through */
    }
  }
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--action' && argv[i + 1]) out.action = argv[++i];
    else if (argv[i] === '--pool' && argv[i + 1]) out.pool = argv[++i];
    else if (argv[i] === '--challenge' && argv[i + 1]) out.challenge = argv[++i];
    else if (argv[i] === '--acceptance' && argv[i + 1]) out.acceptance = argv[++i];
    else if (argv[i] === '--displayName' && argv[i + 1]) out.displayName = argv[++i];
  }
  return out;
}

function envelope(ok, result, extra = {}) {
  const resultWithOk = { ok: ok === true, ...result };
  process.stdout.write(
    `${JSON.stringify({
      ok: ok === true,
      macro_id: SKILL_ID,
      result: resultWithOk,
      exports: { href: resultWithOk.href, action: resultWithOk.action },
      steps_taken: extra.steps_taken || [],
      warnings: extra.warnings || [],
      confidence: 1,
      needs_user: false
    })}\n`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const action = String(args.action || 'open_ui').trim().toLowerCase();
  const href = SKILL_UI_HREF;
  const ui = { auto_open: true, title: 'Glimpse' };

  if (action === 'open_ui' || action === 'status') {
    envelope(true, { action, href, ui, join_hint: '/play/glimpse/:invite' });
    return;
  }

  if (action === 'catalog') {
    const items = catalogForPool(args.pool || 'mixed').map((i) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      year: i.year
    }));
    envelope(true, { action, href, ui, items });
    return;
  }

  if (action === 'create_room') {
    const svc = getService();
    const room = svc.createRoom({
      host: { id: 'host', displayName: args.displayName || 'Host' },
      pool: args.pool || 'mixed',
      challenge: args.challenge || 'close_enough',
      acceptance: args.acceptance || 'normal'
    });
    envelope(true, { action, href, ui, room });
    return;
  }

  envelope(false, { action, href, ui, error: 'unknown_action' });
}

main();

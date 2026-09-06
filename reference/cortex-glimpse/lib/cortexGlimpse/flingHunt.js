'use strict';

/**
 * Glimpse Fling hunt routines live under operator-home glimpse/routines/.
 * They never register hub-tick jobs. Browser hunts open a *background* tab
 * so they do not steal the operator's current page.
 */

const fs = require('fs');
const path = require('path');
const store = require('./store');
const { extractWatchIdsFromText, mergeHits } = require('./hunt');

const ROUTINE_VERSION = 1;

function youtubeSearchUrl(query, pool) {
  const suffix = pool === 'movies' ? ' trailer' : pool === 'television' || pool === 'tv' ? ' scene' : ' official audio';
  const q = encodeURIComponent(`${query}${suffix}`.trim());
  return `https://www.youtube.com/results?search_query=${q}`;
}

function huntGraph(kind) {
  return {
    schema: 'cortex_blueprint_v1',
    format: 'fling',
    id: `glimpse-yt-search-${kind}`,
    title: `Glimpse YouTube hunt (${kind})`,
    description:
      'Background-tab YouTube search for Glimpse. Does not steal the focused tab. Not a hub-tick job.',
    version: ROUTINE_VERSION,
    nodes: [
      { id: 'start', type: 'start', x: 40, y: 80 },
      { id: 'gate', type: 'fling_gate_online', x: 200, y: 80, config: { require_usable: true } },
      {
        id: 'open',
        type: 'fling_tab_open',
        x: 380,
        y: 80,
        config: { active: false, url: '' }
      },
      { id: 'wait', type: 'fling_tab_wait', x: 560, y: 80, config: { wait_until: 'complete', timeout_ms: 15000 } },
      { id: 'index', type: 'fling_tab_content_index', x: 740, y: 80, config: { query: 'video' } },
      { id: 'close', type: 'fling_tab_close', x: 920, y: 80, config: {} }
    ],
    edges: [
      { from: 'start', to: 'gate' },
      { from: 'gate', to: 'open', port: 'then' },
      { from: 'open', to: 'wait' },
      { from: 'wait', to: 'index' },
      { from: 'index', to: 'close' }
    ]
  };
}

function routinesDir(root) {
  return path.join(root, 'routines');
}

function ensureHuntRoutines(ctx = {}) {
  const root = store.resolveRoot(ctx).root;
  store.ensureDir(routinesDir(root));
  const kinds = ['music', 'movies', 'tv'];
  const routines = kinds.map((kind) => {
    const file = path.join(routinesDir(root), `glimpse-yt-search-${kind}.v${ROUTINE_VERSION}.json`);
    if (!fs.existsSync(file)) {
      require('../cortexLibraries/scopeRoots').writeJsonAtomic(file, huntGraph(kind));
    }
    return { kind, id: `glimpse-yt-search-${kind}`, path: file };
  });
  return { root, routines };
}

function flattenPciText(pci) {
  if (!pci) return '';
  if (typeof pci === 'string') return pci;
  try {
    return JSON.stringify(pci);
  } catch {
    return String(pci);
  }
}

async function runFlingYoutubeSearch(query, opts = {}) {
  const pool = opts.pool || 'mixed';
  const url = youtubeSearchUrl(query, pool);
  ensureHuntRoutines(opts);
  if (typeof opts.runFling === 'function') {
    const raw = await opts.runFling({ query, url, pool });
    const ids = extractWatchIdsFromText(flattenPciText(raw));
    return mergeHits(ids.map((id) => ({ id, url: `https://www.youtube.com/watch?v=${id}` })));
  }

  const { getFlingExtensionStatus } = require('../flingExtensionPresence.js');
  const status = getFlingExtensionStatus();
  if (!status.online) {
    const e = new Error('Fling browser offline');
    e.code = 'fling_offline';
    throw e;
  }

  const tabTools = require('../flingTabToolRuntime.js');
  const opened = await tabTools.runFlingTabOpen({ url, active: false }, {});
  if (opened && opened.error) {
    const e = new Error(opened.error || opened.message || 'fling_open_failed');
    e.code = 'fling_open_failed';
    throw e;
  }
  const tabId = opened && opened.tab_id;
  try {
    if (typeof tabTools.runFlingTabWait === 'function') {
      await tabTools.runFlingTabWait({ tab_id: tabId, wait_until: 'complete', timeout_ms: 15000 }, {});
    }
    const pci = await tabTools.runFlingTabContentIndex({ tab_id: tabId, query: 'video' }, {});
    const ids = extractWatchIdsFromText(flattenPciText(pci));
    return mergeHits(ids.map((id) => ({ id, url: `https://www.youtube.com/watch?v=${id}` })));
  } finally {
    try {
      if (tabId != null) await tabTools.runFlingTabClose({ target_tab_id: tabId, tab_id: tabId }, {});
    } catch {
      /* leave tab if close refused */
    }
  }
}

module.exports = {
  youtubeSearchUrl,
  huntGraph,
  ensureHuntRoutines,
  runFlingYoutubeSearch
};

'use strict';

const { seedCatalog, findCatalogItem, catalogForPool } = require('./catalog');
const { normalizeMediaItem } = require('./mediaItem');
const store = require('./store');

function livePath(root) {
  return require('path').join(root, 'catalog.json');
}

function loadLiveCatalog(ctx = {}) {
  const root = store.resolveRoot(ctx).root;
  const doc = require('../cortexLibraries/scopeRoots').readJson(livePath(root), null);
  const items = doc && Array.isArray(doc.items) ? doc.items : [];
  return items.map((x) => normalizeMediaItem(x));
}

function saveLiveItems(ctx, items) {
  const root = store.resolveRoot(ctx).root;
  store.ensureDir(root);
  const existing = loadLiveCatalog(ctx);
  const byId = new Map(existing.map((x) => [x.id, x]));
  for (const it of items || []) {
    if (it && it.id) byId.set(it.id, normalizeMediaItem(it));
  }
  const next = [...byId.values()];
  require('../cortexLibraries/scopeRoots').writeJsonAtomic(livePath(root), {
    schema_version: 1,
    items: next
  });
  return next;
}

function mergedCatalog(pool, ctx = {}) {
  const live = loadLiveCatalog(ctx);
  const seed = catalogForPool(pool);
  const seen = new Set(seed.map((x) => x.id));
  const extra = live.filter((x) => {
    if (seen.has(x.id)) return false;
    if (pool === 'music') return x.type === 'song';
    if (pool === 'movies') return x.type === 'movie';
    if (pool === 'television' || pool === 'tv') return x.type === 'tv';
    return true;
  });
  return seed.concat(extra);
}

function findLiveOrSeed(id, ctx = {}) {
  const seed = findCatalogItem(id);
  if (seed) return seed;
  return loadLiveCatalog(ctx).find((x) => x.id === id) || null;
}

module.exports = {
  loadLiveCatalog,
  saveLiveItems,
  mergedCatalog,
  findLiveOrSeed,
  livePath
};

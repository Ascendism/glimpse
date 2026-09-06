'use strict';

function normalizeGuess(raw) {
  let s = String(raw || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\b(feat\.?|ft\.?|featuring)\b.*$/g, ' ');
  s = s.replace(/&/g, ' and ');
  s = s.replace(/[^a-z0-9\s]/g, ' ');
  s = s.replace(/\b(the|a|an|by|and)\b/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function tokenSet(raw) {
  const n = normalizeGuess(raw);
  return new Set(n ? n.split(' ') : []);
}

function editDistance(a, b) {
  const s = String(a || '');
  const t = String(b || '');
  const m = s.length;
  const n = t.length;
  if (!m) return n;
  if (!n) return m;
  const prev = new Array(n + 1);
  const cur = new Array(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;
  for (let i = 1; i <= m; i += 1) {
    cur[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j += 1) prev[j] = cur[j];
  }
  return prev[n];
}

function similarity(a, b) {
  const na = normalizeGuess(a);
  const nb = normalizeGuess(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    return 0.82 + 0.18 * ratio;
  }
  const ta = tokenSet(na);
  const tb = tokenSet(nb);
  let inter = 0;
  for (const tok of ta) if (tb.has(tok)) inter += 1;
  const union = ta.size + tb.size - inter;
  const jacc = union ? inter / union : 0;
  const dist = editDistance(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  const lev = maxLen ? 1 - dist / maxLen : 0;
  return Math.max(jacc, lev);
}

function bestSimilarity(guess, candidates) {
  let best = 0;
  let hit = '';
  for (const c of candidates || []) {
    const s = similarity(guess, c);
    if (s > best) {
      best = s;
      hit = String(c);
    }
  }
  return { score: best, hit };
}

module.exports = {
  normalizeGuess,
  tokenSet,
  editDistance,
  similarity,
  bestSimilarity
};

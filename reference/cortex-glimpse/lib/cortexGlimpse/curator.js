'use strict';

const { ROUND_INTENTS, poolToTypes } = require('./constants');
const { itemAffinity, knowledgeFrontier } = require('./knowledge');
const { selectClip } = require('./clipSelect');

const COLD_INTENT_CYCLE = Object.freeze([
  'surprise',
  'expand',
  'boundary',
  'confirm',
  'reinforce',
  'discover'
]);

function predictedRecognition(item, profiles) {
  if (!profiles.length) return 0.5;
  const vals = profiles.map((p) => itemAffinity(p, item));
  return vals.reduce((s, n) => s + n, 0) / vals.length;
}

function playerFairness(item, profiles, favorDebt) {
  if (!profiles.length) return 0;
  let best = 0;
  let bestId = '';
  for (const p of profiles) {
    const a = itemAffinity(p, item);
    if (a > best) {
      best = a;
      bestId = p.playerId;
    }
  }
  const debt = Number(favorDebt && favorDebt[bestId]) || 0;
  return debt > 0 ? 0.35 : 0.05;
}

function scoreCandidate(item, ctx = {}) {
  const profiles = ctx.profiles || [];
  const rec = predictedRecognition(item, profiles);
  const frontier = rec >= 0.55 && rec <= 0.85 ? 0.3 : rec > 0.85 ? 0.05 : 0.12;
  const fairness = playerFairness(item, profiles, ctx.favorDebt || {});
  const novelty = (ctx.recentItemIds || []).includes(item.id) ? 0 : 0.2;
  const clipQuality = item.candidateClips && item.candidateClips.length ? 0.15 : 0;
  const obscurity = rec < 0.25 ? 0.25 : 0;
  const total = rec + frontier + fairness + novelty + clipQuality - obscurity;
  return { total, rec, frontier, fairness, novelty, clipQuality, obscurity };
}

function hashSalt(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitter(id, salt) {
  return (hashSalt(`${salt}:${id}`) % 1000) / 1000;
}

function pickIntent(item, rec, ctx, usedIntents) {
  const favor = ctx.favorDebt || {};
  const disadvantaged = Object.entries(favor).sort((a, b) => b[1] - a[1])[0];
  if (disadvantaged && disadvantaged[1] > 0 && !usedIntents.has('balance')) {
    const profiles = ctx.profiles || [];
    const target = profiles.find((p) => p.playerId === disadvantaged[0]);
    if (target && itemAffinity(target, item) >= 0.45) return 'balance';
  }
  if (rec >= 0.88) return 'confirm';
  if (rec >= 0.55 && rec <= 0.85) return 'boundary';
  if (rec >= 0.35 && rec < 0.55) return 'expand';
  if ((ctx.recentItemIds || []).length > 4 && !usedIntents.has('surprise')) return 'surprise';
  return rec < 0.35 ? 'discover' : 'reinforce';
}

function coldTable(profiles) {
  if (!profiles || !profiles.length) return true;
  return profiles.every((p) => {
    const people = Object.keys(p.people || {}).length;
    const concepts = Object.keys(p.concepts || {}).length;
    const titles = Object.keys(p.titles || {}).length;
    return people + concepts + titles === 0;
  });
}

function planNextRounds(input) {
  const catalog = input.catalog || [];
  const types = poolToTypes(input.pool);
  const recent = new Set(input.recentItemIds || []);
  const count = Math.max(1, Math.trunc(Number(input.count) || 6));
  const salt = input.salt || 'glimpse';
  const scored = catalog
    .filter((item) => types.includes(item.type))
    .filter((item) => !recent.has(item.id))
    .map((item) => {
      const s = scoreCandidate(item, input);
      return { item, s: { ...s, total: s.total + jitter(item.id, salt) * 0.2 } };
    })
    .sort((a, b) => b.s.total - a.s.total);

  const byType = {};
  for (const t of types) byType[t] = [];
  for (const row of scored) {
    if (!byType[row.item.type]) byType[row.item.type] = [];
    byType[row.item.type].push(row);
  }

  const out = [];
  const usedIntents = new Set();
  const usedIds = new Set();
  let typeCursor = 0;
  const rotate = coldTable(input.profiles);

  while (out.length < count) {
    let row = null;
    for (let step = 0; step < types.length; step += 1) {
      const t = types[(typeCursor + step) % types.length];
      const bucket = byType[t] || [];
      const hit = bucket.find((r) => !usedIds.has(r.item.id));
      if (hit) {
        row = hit;
        typeCursor = (typeCursor + step + 1) % types.length;
        break;
      }
    }
    if (!row) break;
    usedIds.add(row.item.id);
    const rec = row.s.rec;
    let intent = pickIntent(row.item, rec, input, usedIntents);
    if (rotate || usedIntents.has(intent)) {
      intent = COLD_INTENT_CYCLE[out.length % COLD_INTENT_CYCLE.length];
    }
    if (!ROUND_INTENTS.includes(intent)) intent = 'boundary';
    usedIntents.add(intent);
    const clip = selectClip(row.item, { difficulty: rec > 0.8 ? 0.35 : 0.55 });
    const preds = {};
    for (const p of input.profiles || []) preds[p.playerId] = Number(itemAffinity(p, row.item).toFixed(2));
    out.push({
      intent,
      item: row.item,
      clip,
      predicted: preds,
      reason: `${intent} rec=${rec.toFixed(2)}`,
      score: row.s
    });
  }

  if (!out.some((x) => x.intent === 'balance') && (input.profiles || []).length >= 2) {
    const favor = input.favorDebt || {};
    const targetId = Object.entries(favor).sort((a, b) => b[1] - a[1])[0];
    if (targetId) {
      const target = (input.profiles || []).find((p) => p.playerId === targetId[0]);
      const alt = scored.find((row) => !usedIds.has(row.item.id) && target && itemAffinity(target, row.item) >= 0.4);
      if (alt) {
        out[out.length - 1] = {
          intent: 'balance',
          item: alt.item,
          clip: selectClip(alt.item, { difficulty: 0.45 }),
          predicted: {},
          reason: `balance toward ${target.playerId}`,
          score: alt.s
        };
      } else if (out[0]) {
        out[0] = { ...out[0], intent: 'balance', reason: `balance toward ${targetId[0]}` };
      }
    }
  }
  return out;
}

function frontierSummary(profiles, catalog) {
  return (profiles || []).map((p) => ({
    playerId: p.playerId,
    frontier: knowledgeFrontier(p, catalog)
  }));
}

module.exports = {
  planNextRounds,
  scoreCandidate,
  predictedRecognition,
  frontierSummary
};

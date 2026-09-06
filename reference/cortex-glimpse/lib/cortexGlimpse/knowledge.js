'use strict';

function emptyProfile(playerId) {
  return {
    playerId: String(playerId || 'player'),
    domains: { music: 0.5, movies: 0.5, tv: 0.5 },
    concepts: {},
    people: {},
    eras: {},
    titles: {},
    seen: [],
    updatedAt: null
  };
}

function bump(map, key, delta) {
  if (!key) return;
  const k = String(key);
  const cur = Number(map[k]) || 0;
  map[k] = Math.max(0, Math.min(1, cur + delta));
}

function domainKey(item) {
  if (item.type === 'song') return 'music';
  if (item.type === 'tv') return 'tv';
  return 'movies';
}

function applyEvidence(profile, evidence, item) {
  const next = {
    ...profile,
    domains: { ...profile.domains },
    concepts: { ...profile.concepts },
    people: { ...profile.people },
    eras: { ...profile.eras },
    titles: { ...profile.titles },
    seen: Array.from(new Set([...(profile.seen || []), item && item.id].filter(Boolean)))
  };
  const ok = evidence && evidence.correct;
  const dk = domainKey(item || {});
  bump(next.domains, dk, ok ? 0.06 : -0.02);
  if (item && item.title) bump(next.titles, item.title, ok ? 0.25 : -0.08);
  if (item && item.franchise) bump(next.concepts, item.franchise, ok ? 0.12 : 0.02);
  if (item && item.series) bump(next.concepts, item.series, ok ? 0.18 : 0.03);
  if (item && item.era) bump(next.eras, item.era, ok ? 0.08 : 0.01);
  for (const ev of (evidence && evidence.evidence) || []) {
    const bag = ev.kind === 'people' ? next.people : ev.kind === 'eras' ? next.eras : next.concepts;
    bump(bag, ev.concept, ok ? Math.max(0.16, (Number(ev.knowledge) || 0.5) * 0.35) : 0.05);
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

function mergeRoomProfile(profiles) {
  const room = emptyProfile('room');
  if (!profiles.length) return room;
  const bags = ['domains', 'concepts', 'people', 'eras', 'titles'];
  for (const bag of bags) {
    const keys = new Set();
    for (const p of profiles) Object.keys(p[bag] || {}).forEach((k) => keys.add(k));
    for (const k of keys) {
      const avg = profiles.reduce((s, p) => s + (Number(p[bag][k]) || 0), 0) / profiles.length;
      room[bag][k] = avg;
    }
  }
  room.seen = Array.from(new Set(profiles.flatMap((p) => p.seen || [])));
  return room;
}

function itemAffinity(profile, item) {
  let s = 0.2;
  s += (Number(profile.domains[domainKey(item)]) || 0.5) * 0.25;
  if (item.era) s += (Number(profile.eras[item.era]) || 0) * 0.2;
  for (const person of item.people || []) s += (Number(profile.people[person]) || 0) * 0.18;
  for (const g of item.genres || []) s += (Number(profile.concepts[g]) || 0) * 0.12;
  if (item.franchise) s += (Number(profile.concepts[item.franchise]) || 0) * 0.2;
  if (item.series) s += (Number(profile.concepts[item.series]) || 0) * 0.25;
  if (profile.titles[item.title] >= 0.8) s += 0.4;
  return Math.max(0, Math.min(1, s));
}

function knowledgeFrontier(profile, catalog) {
  const known = [];
  const uncertain = [];
  const untested = [];
  for (const item of catalog || []) {
    const seen = (profile.seen || []).includes(item.id);
    const aff = itemAffinity(profile, item);
    if (seen && (profile.titles[item.title] || 0) >= 0.7) known.push({ id: item.id, affinity: aff, item });
    else if (seen) uncertain.push({ id: item.id, affinity: aff, item });
    else untested.push({ id: item.id, affinity: aff, item });
  }
  untested.sort((a, b) => b.affinity - a.affinity);
  return {
    known,
    uncertain,
    untested_adjacent: untested.filter((x) => x.affinity >= 0.35).slice(0, 16),
    untested
  };
}

function adjacentCandidates(profile, catalog) {
  return knowledgeFrontier(profile, catalog).untested_adjacent.map((x) => x.item);
}

module.exports = {
  emptyProfile,
  applyEvidence,
  mergeRoomProfile,
  knowledgeFrontier,
  adjacentCandidates,
  itemAffinity,
  domainKey
};

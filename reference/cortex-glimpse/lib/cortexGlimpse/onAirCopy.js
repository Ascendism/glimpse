'use strict';

/**
 * Pack Glimpse table state + agent copy into on-air HTML beats.
 * Guests never dump raw agent prose — the stage interprets it.
 */

function interpretAgentCopy(text) {
  const lines = String(text || '')
    .split(/\n+/)
    .map((s) => s.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
  const beats = [];
  for (const line of lines) {
    const upper = line === line.toUpperCase() && /[A-Z]/.test(line) && line.length <= 48;
    if (upper) beats.push({ role: 'kicker', text: line });
    else if (line.length <= 52) beats.push({ role: 'slam', text: line.replace(/^[""]|[""]$/g, '') });
    else beats.push({ role: 'agent', text: line });
  }
  return beats;
}

function add(beats, role, text, tone) {
  const t = String(text || '').trim();
  if (!t) return;
  beats.push({
    id: `b${beats.length}`,
    role,
    text: t,
    tone: tone || 'neutral',
    delayMs: beats.length * 35
  });
}

function packOnAir(view = {}) {
  const beats = [];
  const phase = String(view.phase || 'lobby');
  if (phase === 'lobby') {
    add(beats, 'kicker', 'STANDBY');
    add(beats, 'chyron', 'Table open');
  } else if (phase === 'playing' || phase === 'guessing') {
    add(beats, 'kicker', 'ON AIR');
    const sample =
      view.round && Number(view.round.clipIndex) >= 0
        ? `SAMPLE ${Number(view.round.clipIndex) + 1}`
        : 'SAMPLE';
    const stake = view.round && view.round.stake;
    add(beats, 'chyron', stake ? `${sample}  ·  ${stake} PTS` : sample);
  } else if (phase === 'reveal') {
    add(beats, 'kicker', 'IDENTIFIED');
    const rev = view.reveal || {};
    add(beats, 'slam', rev.title, 'gold');
    add(beats, 'chyron', [rev.artist, rev.director, rev.series, rev.year].filter(Boolean).join('  ·  '));
    for (const s of view.lastScores || view.scores || []) {
      if (s.acceptable) add(beats, 'hit', `${s.displayName}  +${s.points || 0}`, 'ok');
      else add(beats, 'miss', s.guess ? `${s.displayName} — ${s.guess}` : s.displayName, 'miss');
      if (s.interpretation) {
        for (const b of interpretAgentCopy(s.interpretation)) add(beats, b.role, b.text, 'agent');
      }
    }
  }
  if (view.agentCopy) {
    for (const b of interpretAgentCopy(view.agentCopy)) add(beats, b.role, b.text, 'agent');
  }
  const ticker = beats
    .filter((b) => b.role === 'hit' || b.role === 'miss' || b.role === 'chyron')
    .map((b) => b.text)
    .join('   ·   ');
  return { phase, beats, ticker };
}

module.exports = { packOnAir, interpretAgentCopy };

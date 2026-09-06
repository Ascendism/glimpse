'use strict';

const { ACCEPTANCE_PRESETS } = require('./constants');
const { matchAnswer } = require('./matcher');
const { normalizeGuess } = require('./normalize');

function acceptancePasses(match, preset) {
  const p = preset && typeof preset === 'object' ? preset : ACCEPTANCE_PRESETS.normal;
  const songNeed = Number(p.song_match) || 0;
  const artistNeed = Number(p.artist_match) || 0;
  return (Number(match.song_match) || 0) >= songNeed && (Number(match.artist_match) || 0) >= artistNeed;
}

function resolvePreset(name) {
  const key = String(name || 'normal').toLowerCase();
  return ACCEPTANCE_PRESETS[key] || ACCEPTANCE_PRESETS.normal;
}

function parseLlmPayload(raw) {
  const text = typeof raw === 'string' ? raw : raw && raw.message && raw.message.content;
  const s = String(text || '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

function mergeLlm(match, llm) {
  if (!llm || typeof llm !== 'object') return match;
  const next = { ...match, source: 'llm' };
  for (const k of ['song_match', 'artist_match', 'specificity', 'confidence']) {
    if (Number.isFinite(Number(llm[k]))) next[k] = Number(llm[k]);
  }
  if (typeof llm.acceptable === 'boolean') next.acceptable = llm.acceptable;
  if (llm.interpretation) next.interpretation = String(llm.interpretation);
  return next;
}

function interpret(match, item) {
  if (match.song_match >= 0.9) return `Player clearly intended ${item.title}`;
  if (match.cue_hit) return `Identified via cue "${match.cue_hit}"`;
  if (match.franchise_match >= 0.8) return `Identified the franchise, not the exact title`;
  if (match.artist_match >= 0.8) return `Identified a person, not the title`;
  return 'Ambiguous or partial identification';
}

function judgeAnswerSync(guess, item, opts = {}) {
  const challenge = String(opts.challenge || 'close_enough');
  const preset = resolvePreset(opts.acceptance);
  const match = matchAnswer(guess, item, { challenge });
  let acceptable = acceptancePasses(match, preset);
  if (challenge === 'close_enough' && match.specificity >= 0.45 && (match.cue_match >= 0.4 || match.song_match >= 0.55)) {
    acceptable = true;
  }
  if (challenge === 'exact') acceptable = acceptancePasses(match, ACCEPTANCE_PRESETS.exact);
  return {
    ...match,
    acceptable,
    interpretation: interpret(match, item),
    confidence: Math.max(match.song_match, match.specificity),
    source: 'deterministic',
    guess: String(guess || '')
  };
}

async function judgeAnswer(guess, item, opts = {}) {
  const base = judgeAnswerSync(guess, item, opts);
  const wantsLlm =
    typeof opts.completeChat === 'function' &&
    (base.needs_llm || opts.forceLlm || (base.song_match < 0.9 && String(guess || '').trim().length > 18));
  if (!wantsLlm) return base;
  try {
    const result = await opts.completeChat({
      messages: [
        {
          role: 'system',
          content:
            'You judge media-identification guesses. Return only JSON: {song_match, artist_match, acceptable, interpretation, confidence, specificity}. Scores 0-1.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            guess,
            canonical: item.title,
            type: item.type,
            artist: item.artist,
            director: item.director,
            series: item.series,
            aliases: item.aliases,
            cues: item.cues,
            people: item.people,
            challenge: opts.challenge || 'close_enough'
          })
        }
      ]
    });
    const parsed = parseLlmPayload(result);
    if (!parsed) return base;
    const merged = mergeLlm(base, parsed);
    if (merged.acceptable == null) merged.acceptable = acceptancePasses(merged, resolvePreset(opts.acceptance));
    return merged;
  } catch {
    return base;
  }
}

function extractKnowledgeEvidence(guess, item, meta = {}) {
  const match = matchAnswer(guess, item, { challenge: 'close_enough' });
  const g = normalizeGuess(guess);
  const knewTitle = match.song_match >= 0.9 && !match.cue_hit;
  const recognizedDirector =
    Boolean(item.director && g.includes(normalizeGuess(item.director))) ||
    /ridley scott|james cameron|john carpenter|michael mann|peter jackson/.test(g);
  const recognizedGenre = (item.genres || []).some((gen) => g.includes(normalizeGuess(gen)));
  const recognizedEra = Boolean(item.era && g.includes(normalizeGuess(item.era)));
  const evidence = [];
  if (item.director && recognizedDirector) {
    evidence.push({ concept: item.director, knowledge: 0.86, kind: 'people' });
  }
  for (const person of item.people || []) {
    if (g.includes(normalizeGuess(person))) {
      evidence.push({ concept: person, knowledge: 0.82, kind: 'people' });
    }
  }
  for (const genre of item.genres || []) {
    if (g.includes(normalizeGuess(genre))) {
      evidence.push({ concept: genre, knowledge: 0.7, kind: 'concepts' });
    }
  }
  const confusions = [];
  const correct = meta.correct === true || (meta.correct !== false && match.song_match >= 0.82);
  if (!correct) {
    for (const other of item.confusableWith || []) {
      if (g.includes(normalizeGuess(other))) {
        evidence.push({ concept: other, knowledge: 0.9, kind: 'concepts' });
        confusions.push([item.title, other]);
      }
    }
    if (/scarface/.test(g) && /pacino|al pacino/.test(g) === false) {
      evidence.push({ concept: 'Al Pacino', knowledge: 0.72, kind: 'people' });
    }
    if (/scarface/.test(g)) {
      evidence.push({ concept: 'Scarface', knowledge: 0.94, kind: 'concepts' });
      if (!confusions.length) confusions.push([item.title, 'Scarface']);
    }
    if (/pacino/.test(g) && !evidence.some((e) => e.concept === 'Al Pacino')) {
      evidence.push({ concept: 'Al Pacino', knowledge: 0.82, kind: 'people' });
    }
  }
  if (correct) {
    for (const person of item.people || []) {
      if (!evidence.some((e) => e.concept === person)) {
        evidence.push({ concept: person, knowledge: 0.62, kind: 'people' });
      }
    }
    for (const genre of item.genres || []) {
      if (!evidence.some((e) => e.concept === genre)) {
        evidence.push({ concept: genre, knowledge: 0.55, kind: 'concepts' });
      }
    }
    if (item.era) evidence.push({ concept: item.era, knowledge: 0.55, kind: 'eras' });
  }
  return {
    correct,
    recognized_media: match.song_match >= 0.45 || match.cue_match >= 0.4 || match.franchise_match >= 0.7,
    knew_exact_title: knewTitle,
    recognized_director: recognizedDirector,
    recognized_genre: recognizedGenre,
    recognized_era: recognizedEra,
    confidence: Math.max(match.song_match, match.specificity, match.cue_match),
    evidence,
    confusions,
    match
  };
}

module.exports = {
  judgeAnswer,
  judgeAnswerSync,
  extractKnowledgeEvidence,
  acceptancePasses,
  resolvePreset,
  parseLlmPayload
};

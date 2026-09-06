'use strict';

/**
 * YouTube video validation and health checking for Glimpse catalog.
 * Validates that videos are embeddable and playable before they reach live rounds.
 */

const https = require('https');

/**
 * Check if a YouTube video ID is properly formatted.
 */
function isValidYouTubeId(id) {
  return typeof id === 'string' && /^[\w-]{11}$/.test(id);
}

const { DEAD_YOUTUBE_IDS } = require('./deadYouTubeIds');

/**
 * Known bad/placeholder IDs that should never be used.
 */
const BLACKLIST = new Set(['kYzz0FSgpSU', '3kYzz0FSgpS']);

function isBlacklisted(id) {
  return BLACKLIST.has(id) || DEAD_YOUTUBE_IDS.has(id);
}

/**
 * Check if a YouTube video exists and is embeddable.
 * Uses oembed endpoint which is fast and doesn't require API keys.
 * Returns { ok: true } if embeddable, { ok: false, reason } otherwise.
 */
async function checkYouTubeEmbeddable(youtubeId, opts = {}) {
  if (!isValidYouTubeId(youtubeId)) {
    return { ok: false, reason: 'invalid_id' };
  }
  if (isBlacklisted(youtubeId)) {
    return { ok: false, reason: 'blacklisted' };
  }

  const timeoutMs = opts.timeoutMs || 5000;
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;

  return new Promise((resolve) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.title) {
              resolve({ ok: true, title: parsed.title });
              return;
            }
          } catch {
            // Fall through to error
          }
        }
        if (res.statusCode === 404 || res.statusCode === 401 || res.statusCode === 403) {
          resolve({ ok: false, reason: 'not_embeddable', statusCode: res.statusCode });
          return;
        }
        resolve({ ok: false, reason: 'check_failed', statusCode: res.statusCode });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, reason: 'timeout' });
    });

    req.on('error', (err) => {
      resolve({ ok: false, reason: 'network_error', error: err.message });
    });
  });
}

/**
 * Validate multiple YouTube IDs in batch with concurrency control.
 * Returns a Map of id -> validation result.
 */
async function batchValidateYouTube(ids, opts = {}) {
  const concurrency = opts.concurrency || 5;
  const results = new Map();
  const queue = [...new Set(ids)].filter(Boolean);

  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) continue;
      const result = await checkYouTubeEmbeddable(id, opts);
      results.set(id, result);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Filter catalog items to only include those with valid, embeddable YouTube videos.
 * Returns { valid, invalid } arrays.
 */
function partitionByValidation(items, validationResults) {
  const valid = [];
  const invalid = [];

  for (const item of items) {
    const ytId = item.source && item.source.youtubeVideoId;
    if (!ytId) {
      invalid.push({ item, reason: 'no_youtube_id' });
      continue;
    }
    const result = validationResults.get(ytId);
    if (result && result.ok) {
      valid.push(item);
    } else {
      invalid.push({ item, reason: result ? result.reason : 'not_checked', ytId });
    }
  }

  return { valid, invalid };
}

/**
 * Generate a report of catalog health showing which items have dead videos.
 */
function catalogHealthReport(partition) {
  const total = partition.valid.length + partition.invalid.length;
  const reasons = {};
  for (const entry of partition.invalid) {
    const r = entry.reason || 'unknown';
    reasons[r] = (reasons[r] || 0) + 1;
  }

  return {
    total,
    valid: partition.valid.length,
    invalid: partition.invalid.length,
    validPercent: total > 0 ? Math.round((partition.valid.length / total) * 100) : 0,
    reasons,
    invalidItems: partition.invalid.map((e) => ({
      id: e.item.id,
      title: e.item.title,
      ytId: e.ytId,
      reason: e.reason
    }))
  };
}

module.exports = {
  isValidYouTubeId,
  isBlacklisted,
  checkYouTubeEmbeddable,
  batchValidateYouTube,
  partitionByValidation,
  catalogHealthReport
};

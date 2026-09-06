'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidYouTubeId,
  isBlacklisted,
  partitionByValidation,
  catalogHealthReport
} = require('../lib/cortexGlimpse/youtubeValidation');

describe('YouTube validation', () => {
  it('validates YouTube ID format', () => {
    assert.equal(isValidYouTubeId('dQw4w9WgXcQ'), true);
    assert.equal(isValidYouTubeId('CD-EBM7QAM0'), true);
    assert.equal(isValidYouTubeId('y6120QOlsfU'), true);
    assert.equal(isValidYouTubeId('invalid'), false);
    assert.equal(isValidYouTubeId(''), false);
    assert.equal(isValidYouTubeId(null), false);
  });

  it('checks blacklist for known bad IDs', () => {
    assert.equal(isBlacklisted('kYzz0FSgpSU'), true);
    assert.equal(isBlacklisted('3kYzz0FSgpS'), true);
    assert.equal(isBlacklisted('dQw4w9WgXcQ'), false);
  });

  it('partitions catalog by validation results', () => {
    const items = [
      { id: 'item1', title: 'Good Video', source: { youtubeVideoId: 'good1234567' } },
      { id: 'item2', title: 'Bad Video', source: { youtubeVideoId: 'bad12345678' } },
      { id: 'item3', title: 'No ID', source: {} }
    ];

    const validationResults = new Map([
      ['good1234567', { ok: true }],
      ['bad12345678', { ok: false, reason: 'not_embeddable' }]
    ]);

    const { valid, invalid } = partitionByValidation(items, validationResults);
    assert.equal(valid.length, 1);
    assert.equal(valid[0].id, 'item1');
    assert.equal(invalid.length, 2);
    assert.equal(invalid[0].item.id, 'item2');
    assert.equal(invalid[0].reason, 'not_embeddable');
    assert.equal(invalid[1].item.id, 'item3');
    assert.equal(invalid[1].reason, 'no_youtube_id');
  });

  it('generates catalog health report with statistics', () => {
    const partition = {
      valid: [{ id: 'item1' }, { id: 'item2' }],
      invalid: [
        { item: { id: 'item3', title: 'Bad1' }, reason: 'not_embeddable', ytId: 'bad1' },
        { item: { id: 'item4', title: 'Bad2' }, reason: 'not_embeddable', ytId: 'bad2' },
        { item: { id: 'item5', title: 'NoYT' }, reason: 'no_youtube_id' }
      ]
    };

    const report = catalogHealthReport(partition);
    assert.equal(report.total, 5);
    assert.equal(report.valid, 2);
    assert.equal(report.invalid, 3);
    assert.equal(report.validPercent, 40);
    assert.equal(report.reasons.not_embeddable, 2);
    assert.equal(report.reasons.no_youtube_id, 1);
    assert.equal(report.invalidItems.length, 3);
    assert.equal(report.invalidItems[0].id, 'item3');
  });
});

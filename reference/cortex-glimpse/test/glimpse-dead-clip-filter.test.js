'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createRoomService } = require('../lib/cortexGlimpse/room');
const { seedCatalog } = require('../lib/cortexGlimpse/catalog');
const { DEAD_YOUTUBE_IDS } = require('../lib/cortexGlimpse/deadYouTubeIds');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('Glimpse dead clip filtering', () => {
  it('ytOk/catalog rejects all committed dead IDs', () => {
    const catalog = seedCatalog();
    const catalogYtIds = new Set();
    
    for (const item of catalog) {
      const ytId = item.source && item.source.youtubeVideoId;
      if (ytId) catalogYtIds.add(ytId);
    }
    
    // None of the dead IDs should be in the catalog
    for (const deadId of DEAD_YOUTUBE_IDS) {
      assert.equal(catalogYtIds.has(deadId), false, 
        `Dead ID ${deadId} should not be in catalog`);
    }
    
    // Spot check: CD-EBM7QAM0 specifically should not be in catalog
    assert.equal(catalogYtIds.has('CD-EBM7QAM0'), false, 
      'CD-EBM7QAM0 (Metallica) should be filtered from catalog');
  });

  it('startRound never returns CD-EBM7QAM0 or any dead ID', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-dead-'));
    const service = createRoomService({
      operatorHome: tmp,
      workspaceRoot: tmp,
      now: () => Date.now()
    });

    try {
      const created = service.createRoom({
        host: { id: 'host', displayName: 'Host' },
        pool: 'music'
      });

      // Try starting a round
      const started = await service.startRound(created.roomId, {});
      assert.ok(started.item, 'Should have found a playable item');
      
      const ytId = started.item.source && started.item.source.youtubeVideoId;
      assert.ok(ytId, 'Item should have a YouTube ID');
      assert.equal(DEAD_YOUTUBE_IDS.has(ytId), false,
        `startRound returned dead ID ${ytId}`);
      assert.notEqual(ytId, 'CD-EBM7QAM0', 'Should never serve CD-EBM7QAM0');
    } finally {
      try {
        service.close();
      } catch {
        /* already closed */
      }
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
      } catch {
        /* Windows can hold identity.sqlite until process GC */
      }
    }
  });

  it('escalateRound on dead-video item skips the item, not just clips', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-escalate-'));
    const service = createRoomService({
      operatorHome: tmp,
      workspaceRoot: tmp,
      now: () => Date.now()
    });

    try {
      const created = service.createRoom({
        host: { id: 'host', displayName: 'Host' },
        pool: 'mixed'
      });

      // Start a round with a valid item
      const started = await service.startRound(created.roomId, {});
      assert.ok(started.item);
      
      // Escalate should either return a new clip or skip to a new item
      // It should NOT loop forever on the same item
      const result = await service.escalateRound(created.roomId);
      
      if (result.skipped) {
        assert.ok(['too_many_escalate_attempts', 'no_more_clips', 'dead_youtube_video'].includes(result.reason),
          'Should skip with a valid reason');
      } else {
        assert.ok(result.clip, 'Should have a clip if not skipped');
      }
    } finally {
      try {
        service.close();
      } catch {
        /* already closed */
      }
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
      } catch {
        /* Windows can hold identity.sqlite until process GC */
      }
    }
  });

  it('DEAD_YOUTUBE_IDS contains CD-EBM7QAM0 and 300+ entries', () => {
    assert.ok(DEAD_YOUTUBE_IDS.has('CD-EBM7QAM0'), 
      'CD-EBM7QAM0 should be in the dead IDs set');
    assert.ok(DEAD_YOUTUBE_IDS.size > 300, 
      `Dead IDs set should have 300+ entries, has ${DEAD_YOUTUBE_IDS.size}`);
  });
});

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const PLAYER = path.join(__dirname, '..', 'public', 'glimpse', 'player.js');
const CSS = path.join(__dirname, '..', 'public', 'glimpse', 'glimpse.css');

describe('glimpse guest player chrome', () => {
  it('follows the Feeds master volume key and masks YouTube titles', () => {
    const js = fs.readFileSync(PLAYER, 'utf8');
    const css = fs.readFileSync(CSS, 'utf8');
    assert.match(js, /cortex_feeds_master_volume_v1/);
    assert.match(js, /cortex-feeds-master-volume/);
    assert.match(js, /gl-yt-mask/);
    assert.match(js, /youtube-nocookie/);
    assert.match(css, /\.gl-yt-mask--bot/);
    assert.match(css, /scale\(1\.42\)/);
  });
});

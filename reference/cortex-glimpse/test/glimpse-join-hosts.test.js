'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isTailscaleV4, isLoopback } = require('../lib/cortexGlimpse/joinHosts');

describe('glimpse join hosts', () => {
  it('treats CGNAT 100.64/10 as phone-reachable Tailscale, not loopback', () => {
    assert.equal(isTailscaleV4('100.64.0.3'), true);
    assert.equal(isTailscaleV4('100.127.1.1'), true);
    assert.equal(isTailscaleV4('192.168.1.9'), false);
    assert.equal(isLoopback('127.0.0.1'), true);
    assert.equal(isLoopback('100.64.0.3'), false);
  });
});

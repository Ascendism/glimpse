'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

const UI = path.join(__dirname, '..', 'data', 'cortex-skills', 'glimpse', 'ui');

function loadHostApi(fetchImpl) {
  const src = fs.readFileSync(path.join(UI, 'app.js'), 'utf8');
  const start = src.indexOf('async function api(');
  const end = src.indexOf('function setStatus(', start);
  assert.ok(start >= 0 && end > start, 'expected api() helper in host app.js');
  const code = src.slice(start, end);
  const context = { fetch: fetchImpl, console };
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.api = api;`, context);
  return context.api;
}

describe('glimpse host control room clicks', () => {
  it('surfaces an HTML 500 from create table instead of throwing', async () => {
    const api = loadHostApi(async () => ({
      ok: false,
      status: 500,
      async json() {
        throw new SyntaxError('Unexpected token <');
      },
      async text() {
        return '<html><body><pre>Error: NODE_MODULE_VERSION 130</pre></body></html>';
      }
    }));
    const j = await api('POST', '/api/glimpse/rooms', { displayName: 'Host' });
    assert.equal(j.ok, false);
    assert.match(String(j.message || ''), /NODE_MODULE_VERSION|HTTP 500/i);
  });

  it('does not share the queue button id with the queue list', () => {
    const html = fs.readFileSync(path.join(UI, 'index.html'), 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dupes, [], `duplicate ids: ${dupes.join(',')}`);
  });

  it('copy and hunt tell the host to create a table first', () => {
    const src = fs.readFileSync(path.join(UI, 'app.js'), 'utf8');
    assert.match(src, /Create a table first/);
    assert.match(src, /ce-copy/);
    assert.match(src, /ce-hunt/);
  });

  it('Find more disables while hunting and reports Fling miss instead of a silent success', () => {
    const src = fs.readFileSync(path.join(UI, 'app.js'), 'utf8');
    const html = fs.readFileSync(path.join(UI, 'index.html'), 'utf8');
    assert.match(src, /state\.huntBusy/);
    assert.match(src, /Hunting…/);
    assert.match(src, /huntFlingNote/);
    assert.match(src, /Fling is offline/);
    assert.match(src, /searched YouTube without the browser/);
    assert.match(src, /No clips for/);
    assert.match(html, /id="ce-fling-hint"/);
    assert.match(src, /\/api\/fling\/extension\/status/);
  });

  it('does not replay queue enter animations on an unchanged poll', () => {
    const src = fs.readFileSync(path.join(UI, 'app.js'), 'utf8');
    assert.match(src, /dataset\.fp|data-fp/);
    const paint = src.slice(src.indexOf('function paintQueue'), src.indexOf('async function refresh'));
    assert.match(paint, /dataset\.fp/);
    assert.doesNotMatch(paint, /gl-enter/);
  });

  it('host page is dealer controls with confirm and transport', () => {
    const html = fs.readFileSync(path.join(UI, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /id="ce-guess"/);
    assert.doesNotMatch(html, /id="ce-onair"/);
    assert.doesNotMatch(html, /id="ce-host-answer"/);
    assert.doesNotMatch(html, /onair\.js/);
    assert.doesNotMatch(html, /host plays too/i);
    assert.match(html, /id="ce-create"/);
    assert.match(html, /id="ce-copy"/);
    assert.match(html, /id="ce-confirm"/);
    assert.match(html, /id="ce-clip"/);
    assert.match(html, /player\.js/);
  });

  it('full-page Control Room is GET /glimpse host.html with kick and hunt', () => {
    const hostHtml = path.join(__dirname, '..', 'public', 'glimpse', 'host.html');
    const hostJs = path.join(__dirname, '..', 'public', 'glimpse', 'host.js');
    const html = fs.readFileSync(hostHtml, 'utf8');
    const src = fs.readFileSync(hostJs, 'utf8');
    assert.match(html, /id="ce-create"/);
    assert.match(html, /id="ce-copy"/);
    assert.match(html, /id="ce-confirm"/);
    assert.match(html, /id="ce-clip"/);
    assert.match(html, /id="ce-hunt"/);
    assert.match(html, /host\.js/);
    assert.match(src, /\/api\/glimpse\/rooms\/\$\{state\.roomId\}\/kick/);
    assert.match(src, /\/api\/glimpse\/rooms\/\$\{state\.roomId\}\/promote/);
    assert.match(src, /huntBusy/);
    assert.match(src, /Hunting…/);
  });
});

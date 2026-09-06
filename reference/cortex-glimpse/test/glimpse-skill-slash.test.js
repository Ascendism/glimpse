'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadSkillPack } = require('../lib/cortexSkills/loadSkillPack');
const { loadSkillTriggerCatalog } = require('../lib/cortexSkills/skillTriggerCatalog');

describe('glimpse skill pack slash', () => {
  it('loads as a valid pack and registers /glimpse as an immediate slash', () => {
    const pack = loadSkillPack('glimpse');
    assert.equal(pack.skill_id, 'glimpse');
    const hooks = pack.profile && pack.profile.hooks;
    assert.equal(hooks && hooks.composer_immediate, true);
    const ui = pack.profile && pack.profile.ui;
    assert.equal(ui && ui.contract, 'skill_ui_v1');
    const cat = loadSkillTriggerCatalog();
    const row = cat.rows.find((r) => r.skill_id === 'glimpse' && r.value === '/glimpse');
    assert.ok(row, 'expected /glimpse in trigger catalog');
    assert.equal(row.matched_via_kind, 'slash');
  });

  it('opens the Control Room at GET /glimpse, not the skill iframe path', () => {
    const script = fs.readFileSync(
      path.join(__dirname, '..', 'data', 'cortex-skills', 'glimpse', 'script.js'),
      'utf8'
    );
    assert.match(script, /SKILL_UI_HREF = '\/glimpse'/);
    assert.doesNotMatch(script, /\/api\/cortex-skills\/glimpse\/ui\//);
  });

  it('registers GET /glimpse before express.static so the Control Room is not 301ed', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    const route = src.indexOf("app.get('/glimpse', sendGlimpseHost)");
    const staticMount = src.indexOf('express.static(_harnessPublicDir');
    assert.ok(route >= 0, 'expected sendGlimpseHost route');
    assert.ok(staticMount > route, 'GET /glimpse must be registered before public static');
  });
});

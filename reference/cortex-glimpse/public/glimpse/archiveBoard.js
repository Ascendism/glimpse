import * as THREE from 'three';

const COLS = 12;
const ROWS = 8;

function tex(draw, w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function wordTex(text, w, h, px, fill = '#ffe7a8') {
  return tex((ctx, tw, th) => {
    ctx.clearRect(0, 0, tw, th);
    ctx.fillStyle = fill;
    ctx.font = `800 ${px}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(text || ''), tw / 2, th / 2 + 4);
  }, w, h);
}

function plate(map, w, h) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false })
  );
}

function iron(hex) {
  return new THREE.MeshStandardMaterial({ color: hex, metalness: 0.55, roughness: 0.45 });
}

function gold() {
  return new THREE.MeshStandardMaterial({
    color: 0xf0c060,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0x7a4e14,
    emissiveIntensity: 0.85
  });
}

function box(mat, w, h, d, x, y, z, name, shadows) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.name = name;
  m.castShadow = shadows;
  m.receiveShadow = shadows;
  return m;
}

function makeFlap(label, cellW, cellH, shadows, mats) {
  const g = new THREE.Group();
  g.add(box(mats.flap, cellW * 0.9, cellH, 0.08, 0, 0, 0, `flap-${label}`, shadows));
  const p = plate(wordTex(label === ' ' ? '' : label, 256, 256, 150), cellW * 0.72, cellH * 0.7);
  p.position.z = 0.05;
  p.name = 'glyph';
  g.add(p);
  g.userData.ch = label;
  return g;
}

function setFlapText(group, text, cellW, cellH) {
  const chars = String(text || '').toUpperCase().split('');
  while (group.children.length < chars.length) {
    const flap = makeFlap(' ', cellW, cellH, true, group.userData.mats);
    group.add(flap);
  }
  group.children.forEach((child, i) => {
    const ch = chars[i] || '';
    child.visible = i < Math.max(chars.length, 1);
    const cx = chars.length ? -((chars.length - 1) * cellW) / 2 + i * cellW : 0;
    child.position.x = cx;
    if (child.userData.ch === ch) return;
    child.userData.ch = ch;
    const glyph = child.getObjectByName('glyph');
    if (glyph && glyph.material && glyph.material.map) glyph.material.map.dispose();
    if (glyph) {
      glyph.material.map = wordTex(ch, 256, 256, 150);
      glyph.material.needsUpdate = true;
    }
  });
}

function makeTile(c, r, x, y, tw, th, shadows, mats) {
  const g = new THREE.Group();
  g.position.set(x, y, 0.18);
  g.name = `tile-${c}-${r}`;
  const body = box(mats.tile, tw, th, 0.07, 0, 0, 0, `body-${c}-${r}`, shadows);
  const well = box(mats.tileIn, tw * 0.72, th * 0.72, 0.02, 0, 0, 0.04, `well-${c}-${r}`, shadows);
  const glyph = plate(wordTex('', 256, 256, 180, '#ffe9b0'), tw * 0.7, th * 0.78);
  glyph.position.z = 0.06;
  glyph.name = 'glyph';
  glyph.visible = false;
  g.add(body, well, glyph);
  g.userData = { col: c, row: r, ch: '', lit: false, occupied: false, flip: 0, targetFlip: 0 };
  return g;
}

export function createArchiveBoard(options = {}) {
  const shadows = options.shadows ?? true;
  const root = new THREE.Group();
  root.name = 'The Archive';

  const mats = {
    wall: iron(0x2e2a24),
    dark: iron(0x1e1b17),
    tile: iron(0x4e463c),
    tileIn: iron(0x2a241c),
    tileLit: new THREE.MeshStandardMaterial({
      color: 0xc9a24a,
      metalness: 0.35,
      roughness: 0.35,
      emissive: 0x7a4e14,
      emissiveIntensity: 0.55
    }),
    pod: iron(0x353028),
    flap: iron(0x3f382c),
    gold: gold(),
    stage: iron(0x2a2620)
  };

  root.add(box(mats.stage, 3.4, 0.1, 1.15, 0, -1.06, 0.55, 'apron', shadows));
  root.add(box(mats.gold, 3.42, 0.03, 0.06, 0, -1.0, 1.1, 'apron-lip', shadows));
  for (let i = 0; i < 9; i += 1) {
    root.add(box(mats.gold, 0.09, 0.02, 0.03, -1.4 + i * 0.35, -1.0, 1.05, `apron-lamp-${i}`, shadows));
  }

  root.add(box(mats.dark, 2.15, 1.72, 0.28, 0, 0.12, 0.0, 'puzzle-wall', shadows));

  const tw = 0.155;
  const th = 0.155;
  const gap = 0.016;
  const ox = -((COLS - 1) * (tw + gap)) / 2;
  const oy = 0.68;
  const tiles = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const tile = makeTile(c, r, ox + c * (tw + gap), oy - r * (th + gap), tw, th, shadows, mats);
      tiles.push(tile);
      root.add(tile);
    }
  }

  root.add(box(mats.dark, 1.28, 0.32, 0.08, 0, 1.12, 0.2, 'title-plaque', shadows));
  const title = plate(wordTex('THE ARCHIVE', 1024, 256, 110), 1.18, 0.16);
  title.position.set(0, 1.16, 0.25);
  root.add(title);
  const sub = plate(wordTex('GUESS THE TITLE', 1024, 128, 52, '#e2c888'), 0.86, 0.07);
  sub.name = 'subtitle';
  sub.position.set(0, 1.02, 0.25);
  root.add(sub);

  root.add(box(mats.wall, 0.32, 2.15, 0.45, -1.22, 0.12, 0.02, 'pillar-L', shadows));
  root.add(box(mats.wall, 0.32, 2.15, 0.45, 1.22, 0.12, 0.02, 'pillar-R', shadows));
  root.add(box(mats.wall, 2.76, 0.28, 0.42, 0, 1.28, 0.04, 'header', shadows));
  root.add(box(mats.gold, 2.76, 0.04, 0.06, 0, 1.4, 0.26, 'header-light', shadows));
  root.add(box(mats.gold, 0.05, 2.15, 0.05, -1.22, 0.12, 0.26, 'pillar-L-light', shadows));
  root.add(box(mats.gold, 0.05, 2.15, 0.05, 1.22, 0.12, 0.26, 'pillar-R-light', shadows));

  function pod(x, y, w, h, name) {
    root.add(box(mats.pod, w, h, 0.32, x, y, 0.22, name, shadows));
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy], i) => {
      root.add(box(mats.gold, 0.06, 0.06, 0.04, x + sx * (w / 2 - 0.05), y + sy * (h / 2 - 0.05), 0.39, `${name}-c${i}`, shadows));
    });
  }

  function label(text, x, y, w, h, px) {
    const p = plate(wordTex(text, 512, 128, px), w, h);
    p.position.set(x, y, 0.4);
    root.add(p);
    return p;
  }

  const L = -1.62;
  pod(L, 0.62, 0.86, 0.62, 'year');
  label('YEAR', L, 0.86, 0.22, 0.05, 48);
  const yearFlaps = new THREE.Group();
  yearFlaps.position.set(L, 0.54, 0.4);
  yearFlaps.userData.mats = mats;
  yearFlaps.name = 'year-flaps';
  root.add(yearFlaps);

  pod(L, 0.0, 0.86, 0.5, 'genre');
  label('GENRE', L, 0.18, 0.24, 0.05, 44);
  const genreGlyph = plate(wordTex('', 512, 128, 80), 0.58, 0.16);
  genreGlyph.name = 'genre-glyph';
  genreGlyph.position.set(L, -0.04, 0.4);
  root.add(genreGlyph);

  pod(L, -0.58, 0.86, 0.54, 'runtime');
  label('RUNTIME', L, -0.38, 0.3, 0.045, 40);
  const runtimeFlaps = new THREE.Group();
  runtimeFlaps.position.set(L, -0.58, 0.4);
  runtimeFlaps.userData.mats = mats;
  runtimeFlaps.name = 'runtime-flaps';
  root.add(runtimeFlaps);

  const R = 1.62;
  pod(R, 0.66, 0.86, 0.56, 'category');
  label('CATEGORY', R, 0.86, 0.34, 0.045, 36);
  const categoryFlaps = new THREE.Group();
  categoryFlaps.position.set(R, 0.58, 0.4);
  categoryFlaps.userData.mats = mats;
  categoryFlaps.name = 'category-flaps';
  root.add(categoryFlaps);

  const wheel = new THREE.Group();
  wheel.position.set(R, 0.04, 0.4);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 40), mats.pod);
  disc.rotation.x = Math.PI / 2;
  wheel.add(disc);
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 10, 40), mats.gold));
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 8, 32), mats.gold));
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), mats.gold);
  hub.position.z = 0.05;
  wheel.add(hub);
  wheel.name = 'wheel';
  root.add(wheel);

  pod(R, -0.58, 0.86, 0.5, 'hints');
  label('HINTS', R, -0.4, 0.24, 0.05, 44);
  const hintGlyph = plate(wordTex('STAND BY', 512, 64, 40), 0.7, 0.055);
  hintGlyph.name = 'hint-glyph';
  hintGlyph.position.set(R, -0.56, 0.4);
  root.add(hintGlyph);

  function paintGlyph(mesh, text, w, h, px) {
    if (!mesh || !mesh.material) return;
    if (mesh.material.map) mesh.material.map.dispose();
    mesh.material.map = wordTex(text, w, h, px);
    mesh.material.needsUpdate = true;
  }

  function applyBoard(state) {
    const next = state || { cells: [], category: '', year: '', genre: '', runtime: '', hints: 0 };
    const byKey = new Map();
    (next.cells || []).forEach((cell) => byKey.set(`${cell.col},${cell.row}`, cell));
    tiles.forEach((tile, i) => {
      const cell = byKey.get(`${tile.userData.col},${tile.userData.row}`);
      const occupied = Boolean(cell && (cell.occupied || cell.ch || cell.lit));
      const lit = Boolean(cell && cell.lit);
      const ch = cell && cell.ch ? String(cell.ch).toUpperCase() : '';
      tile.visible = true;
      tile.userData.occupied = occupied;
      const body = tile.children[0];
      if (body) body.material = occupied ? (lit ? mats.tileLit : mats.tile) : mats.tileIn;
      tile.scale.setScalar(occupied ? 1 : 0.92);
      if (tile.userData.ch !== ch || tile.userData.lit !== lit) {
        tile.userData.ch = ch;
        tile.userData.lit = lit;
        tile.userData.targetFlip = lit && ch ? 1 : occupied ? 0.15 : 0;
        const glyph = tile.getObjectByName('glyph');
        if (glyph) {
          paintGlyph(glyph, ch, 256, 256, 180);
          glyph.visible = Boolean(ch);
        }
        tile.userData.stagger = i * 0.012;
      }
    });
    setFlapText(yearFlaps, next.year || '----', 0.2, 0.28);
    setFlapText(categoryFlaps, next.category || '----', 0.15, 0.22);
    setFlapText(runtimeFlaps, next.runtime || '---', 0.2, 0.2);
    paintGlyph(genreGlyph, next.genre || '----', 512, 128, 80);
    const hintText = next.hints > 0 ? `${next.hints} USED` : 'ONE AT A TIME';
    paintGlyph(hintGlyph, hintText, 512, 64, 36);
    const cue = next.category === 'SONG' ? 'GUESS THE SONG' : next.category === 'SHOW' ? 'GUESS THE SHOW' : 'GUESS THE TITLE';
    paintGlyph(sub, cue, 1024, 128, 52);
    root.userData.boardKey = `${next.phase}|${next.year}|${next.category}|${(next.cells || []).map((c) => c.ch).join('')}`;
  }

  root.userData.applyBoard = applyBoard;
  root.userData.tiles = tiles;
  root.userData.tick = (_dt, elapsed) => {
    mats.gold.emissiveIntensity = 0.7 + Math.sin((elapsed || 0) * 1.5) * 0.15;
    wheel.rotation.z = Math.sin((elapsed || 0) * 0.35) * 0.08;
    tiles.forEach((tile) => {
      const target = tile.userData.targetFlip || 0;
      const delay = tile.userData.stagger || 0;
      if ((elapsed || 0) < delay) return;
      const cur = tile.userData.flip || 0;
      const next = cur + (target - cur) * 0.18;
      tile.userData.flip = next;
      tile.rotation.x = (1 - next) * -0.55;
    });
  };

  applyBoard({ cells: [], category: '', year: '', genre: '', runtime: '', hints: 0 });
  return root;
}

export function createSculptModel(options = {}) {
  return createArchiveBoard(options);
}

export function createGameBoardModel(options = {}) {
  return createArchiveBoard(options);
}

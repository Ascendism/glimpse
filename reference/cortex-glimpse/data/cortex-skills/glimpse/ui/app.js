'use strict';

const STORE = 'glimpse.host.v1';
const state = { roomId: '', joinUrl: '', stageUrl: '', hostId: 'host', huntBusy: false };

function $(id) {
  return document.getElementById(id);
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function api(method, url, body) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    return { ok: false, message: (e && e.message) || 'network failed' };
  }
  const text = await res.text();
  let j = null;
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    const scraped = String(text || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
    return { ok: false, message: scraped || `HTTP ${res.status}` };
  }
  if (!j || typeof j !== 'object') return { ok: false, message: `HTTP ${res.status}` };
  if (!res.ok && j.ok !== false) {
    return { ok: false, message: j.message || `HTTP ${res.status}`, ...j };
  }
  return j;
}

function setStatus(text, ok) {
  const el = $('ce-status');
  if (!el) return;
  el.textContent = text;
  el.dataset.state = ok ? 'ok' : 'unknown';
}

function needTable() {
  if (state.roomId) return true;
  setStatus('Create a table first', false);
  return false;
}

function persist() {
  localStorage.setItem(STORE, JSON.stringify({ roomId: state.roomId, hostId: state.hostId }));
}

function renderRoom(room) {
  if (!room) return;
  const box = $('ce-players');
  const people = room.players || room.scores || [];
  if (box) {
    box.innerHTML = people
      .map((p) => {
        const locked = (room.lockedIds || []).indexOf(p.playerId) >= 0;
        const last = (room.lastScores || []).find((s) => s.playerId === p.playerId);
        const isCurrentHost = p.playerId === room.hostId;
        const cls = [
          'gl-play-seat',
          p.ready ? 'is-ready' : '',
          locked && room.phase !== 'reveal' ? 'is-locked' : '',
          room.phase === 'reveal' && last && last.acceptable ? 'is-hit' : '',
          room.phase === 'reveal' && last && !last.acceptable ? 'is-miss' : ''
        ]
          .filter(Boolean)
          .join(' ');
        const badges = [
          isCurrentHost ? '<span class="gl-badge gl-badge-host">HOST</span>' : '',
          p.ready ? '<span class="gl-badge gl-badge-ready">READY</span>' : ''
        ]
          .filter(Boolean)
          .join(' ');
        const actions = isCurrentHost
          ? ''
          : `<button type="button" class="gl-seat-btn gl-kick" data-player="${esc(p.playerId)}" title="Kick player">✕</button>
             <button type="button" class="gl-seat-btn gl-promote" data-player="${esc(p.playerId)}" title="Promote to host">⬆</button>`;
        return `<div class="${cls}">
          <div class="gl-seat-info">
            <span>${esc(p.displayName || p.playerId)}</span>
            ${badges}
          </div>
          <div class="gl-seat-actions">
            <strong>${p.score || 0}</strong>
            ${actions}
          </div>
        </div>`;
      })
      .join('');
  }
  const r = room.round;
  if ($('ce-round')) {
    $('ce-round').textContent = r
      ? `Round ${r.index || ''} · ${room.phase} · sample ${(Number(r.clipIndex) || 0) + 1} · ${room.lockedCount || 0}/${people.length} in`
      : `Phase: ${room.phase || 'lobby'} · ${people.length} seated`;
  }
  if ($('ce-start')) $('ce-start').textContent = room.phase === 'reveal' ? 'Next round' : 'Start round';
  const confirm = $('ce-confirm');
  if (confirm) {
    confirm.disabled = !(room.phase === 'lobby' && room.allReady);
    confirm.textContent = room.phase === 'countdown' ? 'Counting down' : 'Confirm';
  }
  if (room.inviteCode && $('ce-code')) $('ce-code').textContent = room.inviteCode;
  const nudge = $('ce-nudge');
  if (nudge) {
    if (room.nudges && room.nudges.length) {
      nudge.classList.remove('hidden');
      nudge.textContent =
        room.nudges.map((n) => n.displayName).join(', ') +
        (room.nudges.length === 1 ? ' wants another clip' : ' want another clip');
    } else {
      nudge.classList.add('hidden');
      nudge.textContent = '';
    }
  }
}

function paintQueue(rows) {
  const list = $('ce-queue-list') || $('ce-queue');
  if (!list || !Array.isArray(rows)) return;
  const fp = rows.map((q) => `${q.title || ''}|${q.intent || ''}|${q.type || ''}`).join('\n');
  if (list.dataset.fp === fp) return;
  list.dataset.fp = fp;
  list.innerHTML = rows
    .map((q) => `<div class="gl-q"><div>${esc(q.title)}<br><small>${esc(q.intent)} · ${esc(q.type)}</small></div></div>`)
    .join('');
}

function applyTransport(room, clipPlay) {
  const mount = $('ce-clip');
  const idle = $('ce-preview-idle');
  if (!mount || !window.GlimpsePlayer) return;
  if (clipPlay && room && room.phase === 'playing') {
    const key = String(room.round && room.round.playAt) + ':' + String(room.round && room.round.clipIndex);
    if (state.clipKey !== key) {
      state.clipKey = key;
      if (idle) idle.classList.add('hidden');
      window.GlimpsePlayer.play(mount, clipPlay).then(function (player) {
        if (!player || player.__glTransportBound) return;
        player.__glTransportBound = true;
        player.on('pause', function () {
          if (state.ignoringTransport || !state.roomId) return;
          api('POST', `/api/glimpse/rooms/${state.roomId}/transport`, { paused: true });
        });
        player.on('play', function () {
          if (state.ignoringTransport || !state.roomId) return;
          api('POST', `/api/glimpse/rooms/${state.roomId}/transport`, { paused: false });
        });
      });
    }
  }
  state.ignoringTransport = true;
  if (room && room.paused) window.GlimpsePlayer.pause(mount);
  else if (room && room.phase === 'playing') window.GlimpsePlayer.resume(mount);
  setTimeout(function () {
    state.ignoringTransport = false;
  }, 80);
}

// Auto-recovery: listen for player errors and swap to another clip
window.addEventListener('glimpse-player-error', async function (e) {
  if (!state.roomId || state.recovering) return;
  state.recovering = true;
  setStatus('Video unavailable — switching clip', false);
  try {
    const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/escalate`, {});
    if (j.ok) {
      setStatus(`Switched to clip ${(j.clipIndex || 0) + 1}`, true);
      refresh();
    } else {
      setStatus('Could not recover — try Another clip button', false);
    }
  } catch {
    setStatus('Recovery failed', false);
  } finally {
    setTimeout(function () {
      state.recovering = false;
    }, 2000);
  }
});

async function refresh() {
  if (!state.roomId) return;
  const j = await api('GET', `/api/glimpse/rooms/${state.roomId}`);
  if (!j.ok) return;
  renderRoom(j.room);
  paintQueue(j.queue);
  state.phase = j.room && j.room.phase;
  applyTransport(j.room, j.clipPlay);
  if (j.joinUrl) {
    state.joinUrl = j.phoneUrl || j.joinUrl;
    state.phoneUrl = j.phoneUrl || j.joinUrl;
    state.stageUrl = j.stageUrl || `${state.joinUrl.replace(/\/$/, '')}/stage`;
    if (j.inviteToken) state.inviteToken = j.inviteToken;
    if ($('ce-link')) $('ce-link').textContent = state.joinUrl;
  }
}

async function adopt(j) {
  state.roomId = j.roomId;
  state.joinUrl = j.phoneUrl || j.joinUrl;
  state.phoneUrl = j.phoneUrl || j.joinUrl;
  state.stageUrl = j.stageUrl || `${String(state.joinUrl || '').replace(/\/$/, '')}/stage`;
  state.inviteToken = j.inviteToken || '';
  persist();
  if ($('ce-link')) $('ce-link').textContent = state.joinUrl;
  setStatus('Table live', true);
  renderRoom(j.room || j);
  paintQueue(j.queue);
}

$('ce-players').onclick = async (ev) => {
  const kickBtn = ev.target.closest('.gl-kick');
  const promoteBtn = ev.target.closest('.gl-promote');
  if (!state.roomId) return;
  if (kickBtn) {
    const playerId = kickBtn.getAttribute('data-player');
    if (!playerId) return;
    const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/kick`, {
      playerId,
      callerId: state.hostId
    });
    setStatus(j.ok ? 'Player kicked' : j.message, j.ok);
    if (j.ok) refresh();
  } else if (promoteBtn) {
    const playerId = promoteBtn.getAttribute('data-player');
    if (!playerId) return;
    const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/promote`, {
      playerId,
      callerId: state.hostId
    });
    setStatus(j.ok ? 'Host promoted' : j.message, j.ok);
    if (j.ok) {
      state.hostId = playerId;
      persist();
      if (j.room) renderRoom(j.room);
      refresh();
    }
  }
};

$('ce-create').onclick = async () => {
  try {
    const catalog = parseCatalog();
    const match = matchingOf();
    const j = await api('POST', '/api/glimpse/rooms', {
      hostId: state.hostId,
      pool: catalog.pool,
      era: catalog.era || undefined,
      challenge: match.challenge,
      acceptance: match.acceptance
    });
    if (!j.ok) {
      setStatus(j.message || 'failed', false);
      return;
    }
    adopt(j);
  } catch (e) {
    setStatus((e && e.message) || 'failed', false);
  }
};

function parseCatalog() {
  const raw = String(($('ce-catalog') && $('ce-catalog').value) || 'mixed');
  const parts = raw.split('|');
  return { pool: parts[0] || 'mixed', era: parts[1] || '' };
}

function matchingOf() {
  const v = String(($('ce-match') && $('ce-match').value) || 'close_enough');
  if (v === 'exact') return { challenge: 'exact', acceptance: 'exact' };
  return { challenge: 'close_enough', acceptance: 'normal' };
}

async function fillCatalog() {
  const sel = $('ce-catalog');
  if (!sel) return;
  try {
    const j = await api('GET', '/api/glimpse/catalog?pool=mixed');
    const eras = (j.facets && j.facets.eras) || [];
    const groups = [
      ['mixed', 'Mixed'],
      ['movies', 'Movies'],
      ['television', 'TV shows'],
      ['music', 'Music']
    ];
    const cur = sel.value;
    let html = '';
    for (let i = 0; i < groups.length; i += 1) {
      const pool = groups[i][0];
      const label = groups[i][1];
      html += '<option value="' + pool + '">' + label + ' (any era)</option>';
      for (let e = 0; e < eras.length; e += 1) {
        const era = eras[e];
        html +=
          '<option value="' + pool + '|' + era + '">' + label + ' (' + era + ')</option>';
      }
    }
    sel.innerHTML = html;
    if (cur) sel.value = cur;
  } catch {
    /* keep static options */
  }
}

async function copy(text, label) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setStatus(label, true);
  } catch {
    setStatus(text, true);
  }
}

$('ce-copy').onclick = () => {
  if (!state.phoneUrl && !state.joinUrl) {
    setStatus('Create a table first', false);
    return;
  }
  copy(state.phoneUrl || state.joinUrl, 'Phone join URL copied');
};

$('ce-confirm').onclick = async () => {
  if (!needTable()) return;
  const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/confirm`, {});
  setStatus(j.ok ? 'Countdown' : j.message, j.ok);
  refresh();
};

$('ce-start').onclick = async () => {
  if (!needTable()) return;
  const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/start`, {});
  setStatus(j.ok ? 'Live' : j.message, j.ok);
  refresh();
};

$('ce-escalate').onclick = async () => {
  if (!needTable()) return;
  const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/escalate`, {});
  setStatus(j.ok ? `Clip ${(j.clipIndex || 0) + 1}` : j.message, j.ok);
  refresh();
};

$('ce-lock').onclick = async () => {
  if (!needTable()) return;
  const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/lock`, {});
  setStatus(j.ok ? 'Locked' : j.message, j.ok);
  refresh();
};

$('ce-queue').onclick = async () => {
  if (!needTable()) return;
  const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/queue`, { count: 8 });
  if (!j.ok) return;
  paintQueue(j.queue);
};

function huntFlingNote(j) {
  const fling = j && j.fling && typeof j.fling === 'object' ? j.fling : null;
  if (!fling || !fling.attempted) return '';
  if (!fling.ok) {
    if (fling.code === 'fling_offline') {
      return 'Fling is offline — searched YouTube without the browser.';
    }
    return `Fling hunt failed (${fling.error || fling.code || 'error'}) — searched YouTube without the browser.`;
  }
  if (j.via !== 'fling') {
    return 'Fling opened a tab but found nothing — searched YouTube without the browser.';
  }
  return '';
}

function paintHunt(j) {
  const out = $('ce-hunt-out');
  if (!out) return;
  const items = Array.isArray(j.items) ? j.items : [];
  const note = huntFlingNote(j);
  const query = String(j.query || '').trim();
  if (!items.length) {
    out.innerHTML = `<p class="gl-link">${esc(
      note || (query ? `No clips for "${query}". Try Find more again.` : 'No clips. Try Find more again.')
    )}</p>`;
    return;
  }
  out.innerHTML =
    (note ? `<p class="gl-link">${esc(note)}</p>` : '') +
    (query ? `<p class="gl-link">${esc(query)}</p>` : '') +
    items
      .map(
        (it) =>
          `<button type="button" class="gl-q" data-item="${esc(it.id)}"><div>${esc(it.title)}<br><small>${esc(it.type)} · play this</small></div></button>`
      )
      .join('');
  out.onclick = async (ev) => {
    const btn = ev.target.closest('[data-item]');
    if (!btn || !state.roomId) return;
    const started = await api('POST', `/api/glimpse/rooms/${state.roomId}/start`, {
      itemId: btn.getAttribute('data-item')
    });
    setStatus(started.ok ? 'Live' : started.message, started.ok);
    refresh();
  };
}

async function refreshFlingHint() {
  const hint = $('ce-fling-hint');
  if (!hint) return;
  const j = await api('GET', '/api/fling/extension/status');
  if (j && j.ok && j.online) {
    hint.textContent = 'Fling online · hunt uses a background tab';
    return;
  }
  hint.textContent = 'Fling offline · pair the extension before checking this';
}

$('ce-hunt').onclick = async () => {
  if (!needTable()) return;
  if (state.huntBusy) return;
  const btn = $('ce-hunt');
  state.huntBusy = true;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Hunting…';
  }
  setStatus('Hunting…', true);
  try {
    const j = await api('POST', `/api/glimpse/rooms/${state.roomId}/hunt`, {
      use_fling: $('ce-fling') && $('ce-fling').checked
    });
    if (!j.ok) {
      setStatus(j.message || 'hunt failed', false);
      paintHunt({ items: [], query: '', fling: j.fling });
      return;
    }
    const n = Array.isArray(j.items) ? j.items.length : 0;
    const note = huntFlingNote(j);
    setStatus(note || `Found ${n} via ${j.via === 'fling' ? 'Fling' : 'YouTube search'}`, n > 0 && !note);
    paintHunt(j);
  } finally {
    state.huntBusy = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Find more on YouTube';
    }
  }
};

if ($('ce-fling')) {
  $('ce-fling').addEventListener('change', () => {
    void refreshFlingHint();
  });
}

(async function boot() {
  await fillCatalog();
  void refreshFlingHint();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.roomId) {
      state.roomId = saved.roomId;
      state.hostId = saved.hostId || 'host';
      await refresh();
      if (state.joinUrl) setStatus('Table resumed', true);
    }
  } catch {
    /* first open */
  }
})();

setInterval(refresh, 2000);

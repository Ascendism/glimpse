'use strict';

const os = require('os');
const { spawnSync } = require('child_process');

function isLoopback(ip) {
  return ip === '127.0.0.1' || ip === '::1' || String(ip).startsWith('127.');
}

/** Tailscale / CGNAT shared address space — discovered, not a specific box. */
function isTailscaleV4(ip) {
  const m = String(ip).match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a === 100 && b >= 64 && b <= 127;
}

function ipv4FromOs() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const rows of Object.values(ifs || {})) {
    for (const row of rows || []) {
      if (!row || row.internal) continue;
      if (row.family === 'IPv4' || row.family === 4) out.push(row.address);
    }
  }
  return out;
}

function ipv4FromTailscaleCli() {
  try {
    const r = spawnSync('tailscale', ['ip', '-4'], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 2500
    });
    if (r.status !== 0) return [];
    return String(r.stdout || '')
      .split(/\s+/)
      .map((s) => s.trim())
      .filter((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s));
  } catch {
    return [];
  }
}

function discoverJoinHosts() {
  const ips = [...new Set([...ipv4FromTailscaleCli(), ...ipv4FromOs()])].filter((ip) => !isLoopback(ip));
  const ts = ips.filter(isTailscaleV4);
  const lan = ips.filter((ip) => !isTailscaleV4(ip));
  return { tailscale: ts, lan, all: [...ts, ...lan] };
}

function hostPort(hostHeader, fallbackPort) {
  const h = String(hostHeader || '');
  const m = h.match(/:(\d+)$/);
  if (m) return { hostname: h.slice(0, h.length - m[0].length), port: m[1] };
  return { hostname: h || '127.0.0.1', port: String(fallbackPort || '') };
}

function isLoopbackHost(hostHeader) {
  const { hostname } = hostPort(hostHeader, '');
  return isLoopback(hostname) || hostname === 'localhost';
}

/**
 * Phone-reachable join URL. If the operator opened Cortex on localhost,
 * rewrite to a discovered Tailscale or LAN IPv4 so guests can actually load it.
 */
function publicJoinUrl(req, token, pathSuffix = '') {
  const proto = (req.get && req.get('x-forwarded-proto')) || req.protocol || 'http';
  const header = req.get && req.get('host');
  const { hostname, port } = hostPort(header, '');
  const suffix = pathSuffix || '';
  const pathJoin = `/play/glimpse/${token}${suffix}`;
  const pack = (host) => {
    const hp = port && host.indexOf(':') < 0 ? `${host}:${port}` : host;
    return `${proto}://${hp}${pathJoin}`;
  };
  const found = discoverJoinHosts();
  const phoneHost = found.tailscale[0] || found.lan[0] || null;
  const requestUrl = header ? pack(hostname) : pathJoin;
  const phoneUrl = phoneHost ? pack(phoneHost) : requestUrl;
  return {
    joinUrl: isLoopbackHost(header) ? phoneUrl : requestUrl,
    requestUrl,
    phoneUrl,
    hosts: found
  };
}

module.exports = {
  isLoopback,
  isTailscaleV4,
  discoverJoinHosts,
  publicJoinUrl
};

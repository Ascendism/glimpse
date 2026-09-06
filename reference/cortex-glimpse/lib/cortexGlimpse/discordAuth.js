'use strict';

const fs = require('fs');
const { credsPath } = require('./identityDb');

function loadDiscordCreds(root) {
  const file = credsPath(root);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const clientId = String(raw.client_id || raw.clientId || '').trim();
    const clientSecret = String(raw.client_secret || raw.clientSecret || '').trim();
    const botToken = String(raw.bot_token || raw.botToken || raw.token || '').trim();
    if (!clientId) return null;
    return { clientId, clientSecret, botToken, path: file };
  } catch {
    return null;
  }
}

function authorizeUrl({ creds, redirectUri, state }) {
  const u = new URL('https://discord.com/api/oauth2/authorize');
  u.searchParams.set('client_id', creds.clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', 'identify');
  u.searchParams.set('state', state);
  u.searchParams.set('prompt', 'consent');
  return u.toString();
}

async function exchangeCode(opts) {
  const fetchFn = opts.fetchFn || fetch;
  const body = new URLSearchParams({
    client_id: opts.creds.clientId,
    client_secret: opts.creds.clientSecret,
    grant_type: 'authorization_code',
    code: opts.code,
    redirect_uri: opts.redirectUri
  });
  const res = await fetchFn('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  const json = await res.json();
  if (!json.access_token) {
    const err = new Error(json.error_description || json.error || 'discord_token_failed');
    err.code = 'discord_token';
    throw err;
  }
  return json;
}

async function fetchDiscordMe(opts) {
  const fetchFn = opts.fetchFn || fetch;
  const res = await fetchFn('https://discord.com/api/users/@me', {
    headers: { authorization: `Bearer ${opts.accessToken}` }
  });
  const json = await res.json();
  if (!json.id) {
    const err = new Error('discord_me_failed');
    err.code = 'discord_me';
    throw err;
  }
  return {
    discordId: String(json.id),
    username: json.global_name || json.username || 'Player',
    handle: json.username || '',
    avatar: json.avatar
      ? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png`
      : null
  };
}

module.exports = {
  loadDiscordCreds,
  authorizeUrl,
  exchangeCode,
  fetchDiscordMe
};

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { resolveScopedLibraryRoot, ensureDir, writeJsonAtomic, readJson } = require('../cortexLibraries/scopeRoots');
const { FOLDER_NAME, SCHEMA_VERSION } = require('./constants');

function resolveRoot(ctx = {}) {
  return resolveScopedLibraryRoot(FOLDER_NAME, ctx);
}

function roomsDir(root) {
  return path.join(root, 'rooms');
}

function profilesDir(root) {
  return path.join(root, 'profiles');
}

function roomPath(root, roomId) {
  return path.join(roomsDir(root), `${safe(roomId)}.json`);
}

function profilePath(root, playerId) {
  return path.join(profilesDir(root), `${safe(playerId)}.json`);
}

function safe(id) {
  return String(id || 'x').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function loadRoom(root, roomId) {
  return readJson(roomPath(root, roomId), null);
}

function saveRoom(root, room) {
  ensureDir(roomsDir(root));
  writeJsonAtomic(roomPath(root, room.roomId), { schema_version: SCHEMA_VERSION, ...room });
  return room;
}

function listRooms(root) {
  const dir = roomsDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(path.join(dir, f), null))
    .filter(Boolean);
}

function loadProfile(root, playerId) {
  return readJson(profilePath(root, playerId), null);
}

function saveProfile(root, profile) {
  ensureDir(profilesDir(root));
  writeJsonAtomic(profilePath(root, profile.playerId), { schema_version: SCHEMA_VERSION, ...profile });
  return profile;
}

module.exports = {
  resolveRoot,
  roomsDir,
  profilesDir,
  roomPath,
  loadRoom,
  saveRoom,
  listRooms,
  loadProfile,
  saveProfile,
  newId,
  ensureDir
};

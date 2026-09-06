'use strict';

const constants = require('./constants');
const normalize = require('./normalize');
const mediaItem = require('./mediaItem');
const catalog = require('./catalog');
const matcher = require('./matcher');
const judge = require('./judge');
const scoring = require('./scoring');
const clipSelect = require('./clipSelect');
const knowledge = require('./knowledge');
const curator = require('./curator');
const store = require('./store');
const { createRoomService } = require('./room');
const hunt = require('./hunt');
const flingHunt = require('./flingHunt');
const liveCatalog = require('./liveCatalog');

module.exports = {
  ...constants,
  ...normalize,
  ...mediaItem,
  ...catalog,
  ...matcher,
  ...judge,
  ...scoring,
  ...clipSelect,
  ...knowledge,
  ...curator,
  store,
  createRoomService,
  boardState: require('./boardState'),
  materializeClip: require('./materializeClip'),
  ...require('./onAirCopy'),
  ...hunt,
  ...flingHunt,
  ...liveCatalog
};

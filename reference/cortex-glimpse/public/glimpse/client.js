'use strict';

const io = require('socket.io-client');
const { VideoSync } = require('./videoSync');

class GlimpseClient {
  constructor(roomCode, playerName, socket) {
    this.roomCode = roomCode;
    this.playerName = playerName;
    this.socket = socket;
    this.videoSync = null;
    this.callbacks = {};
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  setupVideoSync(player) {
    this.videoSync = new VideoSync(player, this.socket);
  }

  joinRoom() {
    this.socket.emit('join-room', {
      roomCode: this.roomCode,
      playerName: this.playerName
    });
  }

  submitGuess(guess) {
    this.socket.emit('submit-guess', {
      roomCode: this.roomCode,
      guess
    });
  }

  startGame() {
    this.socket.emit('start-game', { roomCode: this.roomCode });
  }

  nextRound() {
    this.socket.emit('next-round', { roomCode: this.roomCode });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

function connectToRoom(roomCode, playerName, serverUrl = '') {
  const socket = io(serverUrl);
  const client = new GlimpseClient(roomCode, playerName, socket);

  socket.on('connect', () => {
    console.log('Connected to server');
    client.joinRoom();
  });

  socket.on('room-state', (state) => {
    if (client.callbacks['room-state']) {
      client.callbacks['room-state'](state);
    }
  });

  socket.on('round-start', (data) => {
    if (client.callbacks['round-start']) {
      client.callbacks['round-start'](data);
    }
  });

  socket.on('round-end', (data) => {
    if (client.callbacks['round-end']) {
      client.callbacks['round-end'](data);
    }
  });

  socket.on('game-over', (data) => {
    if (client.callbacks['game-over']) {
      client.callbacks['game-over'](data);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    if (client.callbacks['error']) {
      client.callbacks['error'](error);
    }
  });

  return client;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GlimpseClient, connectToRoom };
}

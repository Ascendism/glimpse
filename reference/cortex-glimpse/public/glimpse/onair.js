'use strict';

const { VideoSync } = require('./videoSync');

class OnAirController {
  constructor(socket, roomCode) {
    this.socket = socket;
    this.roomCode = roomCode;
    this.videoSync = null;
    this.currentClip = null;
    this.isHost = false;
  }

  initialize() {
    this.setupSocketListeners();
    this.joinRoom();
  }

  setupSocketListeners() {
    this.socket.on('room-state', (state) => {
      this.handleRoomState(state);
    });

    this.socket.on('round-start', (data) => {
      this.handleRoundStart(data);
    });

    this.socket.on('clip-playing', (data) => {
      this.handleClipPlaying(data);
    });

    this.socket.on('round-end', (data) => {
      this.handleRoundEnd(data);
    });

    this.socket.on('sync-video', (data) => {
      if (this.videoSync) {
        this.videoSync.handleSync(data);
      }
    });
  }

  joinRoom() {
    this.socket.emit('join-onair', {
      roomCode: this.roomCode
    });
  }

  setupVideoSync(player, isHost = false) {
    this.isHost = isHost;
    this.videoSync = new VideoSync(player, this.socket, isHost);
    
    if (isHost) {
      this.videoSync.startBroadcasting(this.roomCode);
    }
  }

  handleRoomState(state) {
    console.log('Room state updated:', state);
    
    if (this.onRoomStateUpdate) {
      this.onRoomStateUpdate(state);
    }
  }

  handleRoundStart(data) {
    console.log('Round starting:', data);
    this.currentClip = data.clip;
    
    if (this.onRoundStart) {
      this.onRoundStart(data);
    }
    
    if (this.videoSync && data.clip) {
      this.playClip(data.clip);
    }
  }

  handleClipPlaying(data) {
    console.log('Clip playing:', data);
    
    if (this.onClipPlaying) {
      this.onClipPlaying(data);
    }
  }

  handleRoundEnd(data) {
    console.log('Round ended:', data);
    
    if (this.onRoundEnd) {
      this.onRoundEnd(data);
    }
    
    if (this.videoSync) {
      this.videoSync.pause();
    }
  }

  playClip(clip) {
    if (!this.videoSync) {
      console.error('VideoSync not initialized');
      return;
    }

    this.videoSync.loadVideo(clip.videoId, clip.startTime, clip.endTime);
  }

  startRound() {
    if (!this.isHost) {
      console.error('Only host can start rounds');
      return;
    }

    this.socket.emit('host-start-round', {
      roomCode: this.roomCode
    });
  }

  nextRound() {
    if (!this.isHost) {
      console.error('Only host can advance rounds');
      return;
    }

    this.socket.emit('host-next-round', {
      roomCode: this.roomCode
    });
  }

  revealAnswer() {
    if (!this.isHost) {
      console.error('Only host can reveal answers');
      return;
    }

    this.socket.emit('host-reveal-answer', {
      roomCode: this.roomCode
    });
  }

  disconnect() {
    if (this.videoSync) {
      this.videoSync.stopBroadcasting();
    }
    
    if (this.socket) {
      this.socket.emit('leave-onair', {
        roomCode: this.roomCode
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OnAirController };
}

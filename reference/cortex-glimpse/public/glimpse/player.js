'use strict';

const socket = io();
let roomCode = null;
let playerName = null;
let gameState = null;

// Join screen handlers
document.getElementById('join-btn').addEventListener('click', joinGame);
document.getElementById('room-code-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinGame();
});
document.getElementById('player-name-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinGame();
});

function joinGame() {
  const roomCodeInput = document.getElementById('room-code-input').value.trim().toUpperCase();
  const playerNameInput = document.getElementById('player-name-input').value.trim();
  
  if (!roomCodeInput || !playerNameInput) {
    showJoinError('Please enter both room code and your name');
    return;
  }
  
  roomCode = roomCodeInput;
  playerName = playerNameInput;
  
  socket.emit('join-room', {
    roomCode: roomCode,
    playerName: playerName
  });
}

function showJoinError(message) {
  const errorDiv = document.getElementById('join-error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 3000);
}

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('room-joined', (data) => {
  console.log('Successfully joined room:', data);
  document.getElementById('join-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
});

socket.on('room-state', (state) => {
  gameState = state;
  updateDisplay(state);
});

socket.on('round-start', (data) => {
  console.log('Round started:', data);
  handleRoundStart(data);
});

socket.on('round-end', (data) => {
  console.log('Round ended:', data);
  handleRoundEnd(data);
});

socket.on('game-over', (data) => {
  console.log('Game over:', data);
  handleGameOver(data);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  if (document.getElementById('game-screen').style.display === 'none') {
    showJoinError(error.message || 'Failed to join game');
  } else {
    updateStatusMessage(`Error: ${error.message}`);
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  updateStatusMessage('Disconnected from server');
});

// Game screen handlers
document.getElementById('submit-guess-btn').addEventListener('click', submitGuess);
document.getElementById('guess-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitGuess();
});

function submitGuess() {
  const guessInput = document.getElementById('guess-input');
  const guess = guessInput.value.trim();
  
  if (!guess) return;
  
  socket.emit('submit-guess', {
    roomCode: roomCode,
    guess: guess
  });
  
  guessInput.value = '';
  guessInput.disabled = true;
  document.getElementById('submit-guess-btn').disabled = true;
  updateStatusMessage('Guess submitted!');
}

// Display update functions
function updateDisplay(state) {
  updateRoundInfo(state);
  updatePlayerList(state.players);
  
  if (state.status === 'waiting') {
    updateStatusMessage('Waiting for game to start...');
    hideGuessArea();
  }
}

function updateRoundInfo(state) {
  const roundInfo = document.getElementById('round-number');
  
  if (state.status === 'playing') {
    roundInfo.textContent = `Round ${state.currentRound}/${state.totalRounds}`;
  } else if (state.status === 'waiting') {
    roundInfo.textContent = 'Waiting to start...';
  } else if (state.status === 'ended') {
    roundInfo.textContent = 'Game Over';
  }
}

function updatePlayerList(players) {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  
  // Sort by score
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  sortedPlayers.forEach((player, index) => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    if (player.name === playerName) {
      playerCard.style.background = 'rgba(255, 215, 0, 0.3)';
    }
    
    playerCard.innerHTML = `
      <div class="player-name">
        ${index < 3 ? ['🥇', '🥈', '🥉'][index] : ''} 
        ${player.name}
      </div>
      <div class="player-score">${player.score || 0} pts</div>
    `;
    playerList.appendChild(playerCard);
  });
}

function updateStatusMessage(message) {
  document.getElementById('status-message').textContent = message;
}

function handleRoundStart(data) {
  showVideoArea(data.clip);
  showGuessArea();
  updateStatusMessage('Watch the clip and make your guess!');
}

function handleRoundEnd(data) {
  hideVideoArea();
  hideGuessArea();
  
  const correctAnswer = data.correctAnswer || 'Unknown';
  updateStatusMessage(`Round over! The answer was: ${correctAnswer}`);
}

function handleGameOver(data) {
  hideVideoArea();
  hideGuessArea();
  
  const winner = data.winner || { name: 'Unknown', score: 0 };
  updateStatusMessage(`Game Over! Winner: ${winner.name} with ${winner.score} points!`);
}

function showVideoArea(clip) {
  const videoArea = document.getElementById('video-area');
  const videoPlayer = document.getElementById('video-player');
  
  if (clip && clip.videoId) {
    videoArea.style.display = 'block';
    videoPlayer.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${clip.videoId}?start=${clip.startTime}&end=${clip.endTime}&autoplay=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
  }
}

function hideVideoArea() {
  document.getElementById('video-area').style.display = 'none';
}

function showGuessArea() {
  const guessArea = document.getElementById('guess-area');
  const guessInput = document.getElementById('guess-input');
  const submitBtn = document.getElementById('submit-guess-btn');
  
  guessArea.style.display = 'flex';
  guessInput.disabled = false;
  guessInput.value = '';
  submitBtn.disabled = false;
  guessInput.focus();
}

function hideGuessArea() {
  document.getElementById('guess-area').style.display = 'none';
}

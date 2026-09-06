'use strict';

const socket = io();
let roomCode = null;
let gameState = null;

// Initialize host
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('create-room');
});

socket.on('room-created', (data) => {
  roomCode = data.roomCode;
  document.getElementById('room-code').textContent = roomCode;
  console.log('Room created:', roomCode);
});

socket.on('room-state', (state) => {
  gameState = state;
  updateDisplay(state);
});

socket.on('player-joined', (data) => {
  console.log('Player joined:', data.playerName);
  updateStatusMessage(`${data.playerName} joined the game`);
});

socket.on('player-left', (data) => {
  console.log('Player left:', data.playerName);
  updateStatusMessage(`${data.playerName} left the game`);
});

socket.on('round-start', (data) => {
  console.log('Round started:', data);
  updateVideoPlayer(data.clip);
  document.getElementById('next-round-btn').style.display = 'none';
});

socket.on('round-end', (data) => {
  console.log('Round ended:', data);
  displayRoundResults(data);
  document.getElementById('next-round-btn').style.display = 'block';
});

socket.on('game-over', (data) => {
  console.log('Game over:', data);
  displayFinalResults(data);
  document.getElementById('start-game-btn').style.display = 'block';
  document.getElementById('next-round-btn').style.display = 'none';
  document.getElementById('end-game-btn').style.display = 'none';
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  updateStatusMessage(`Error: ${error.message}`);
});

// UI event handlers
document.getElementById('start-game-btn').addEventListener('click', () => {
  if (roomCode) {
    socket.emit('start-game', { roomCode });
    document.getElementById('start-game-btn').style.display = 'none';
    document.getElementById('end-game-btn').style.display = 'block';
  }
});

document.getElementById('next-round-btn').addEventListener('click', () => {
  if (roomCode) {
    socket.emit('next-round', { roomCode });
  }
});

document.getElementById('end-game-btn').addEventListener('click', () => {
  if (roomCode) {
    socket.emit('end-game', { roomCode });
  }
});

// Display update functions
function updateDisplay(state) {
  updatePlayerList(state.players);
  updateGameStatus(state);
  
  if (state.players.length > 0) {
    document.getElementById('start-game-btn').disabled = false;
  }
}

function updatePlayerList(players) {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  
  players.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.innerHTML = `
      <div class="player-name">${player.name}</div>
      <div class="player-score">${player.score || 0} pts</div>
    `;
    playerList.appendChild(playerCard);
  });
}

function updateGameStatus(state) {
  const statusDisplay = document.getElementById('status-display');
  
  if (state.status === 'waiting') {
    statusDisplay.textContent = `Waiting for players... (${state.players.length} joined)`;
  } else if (state.status === 'playing') {
    statusDisplay.textContent = `Round ${state.currentRound}/${state.totalRounds}`;
  } else if (state.status === 'ended') {
    statusDisplay.textContent = 'Game Over';
  }
}

function updateStatusMessage(message) {
  const statusDisplay = document.getElementById('status-display');
  const currentText = statusDisplay.textContent;
  statusDisplay.textContent = message;
  
  setTimeout(() => {
    if (statusDisplay.textContent === message) {
      statusDisplay.textContent = currentText;
    }
  }, 3000);
}

function updateVideoPlayer(clip) {
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
  } else {
    videoArea.style.display = 'none';
  }
}

function displayRoundResults(data) {
  const resultsDiv = document.getElementById('round-results');
  const resultsList = document.getElementById('results-list');
  
  resultsDiv.style.display = 'block';
  resultsList.innerHTML = '<h3>Correct Answer: ' + data.correctAnswer + '</h3>';
  
  if (data.guesses && data.guesses.length > 0) {
    const guessesHtml = data.guesses.map(guess => `
      <div class="guess-result">
        <strong>${guess.playerName}:</strong> ${guess.guess}
        ${guess.correct ? '✓' : '✗'}
        (+${guess.points} pts)
      </div>
    `).join('');
    resultsList.innerHTML += guessesHtml;
  } else {
    resultsList.innerHTML += '<p>No guesses this round</p>';
  }
}

function displayFinalResults(data) {
  const resultsDiv = document.getElementById('round-results');
  const resultsList = document.getElementById('results-list');
  
  resultsDiv.style.display = 'block';
  resultsList.innerHTML = '<h2>Final Results</h2>';
  
  const sortedPlayers = [...data.players].sort((a, b) => b.score - a.score);
  
  const playersHtml = sortedPlayers.map((player, index) => `
    <div class="player-result">
      <span class="rank">#${index + 1}</span>
      <span class="name">${player.name}</span>
      <span class="score">${player.score} pts</span>
    </div>
  `).join('');
  
  resultsList.innerHTML += playersHtml;
}

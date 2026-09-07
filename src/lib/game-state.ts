export type Player = {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  lockedIn: boolean;
};

export type Guess = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  locked: boolean;
};

export type ChatMessage = {
  id: string;
  playerId: string | null;
  playerName: string;
  text: string;
  timestamp: number;
  isSystem: boolean;
};

export type GamePhase =
  | "lobby"
  | "playing"
  | "guessing"
  | "judging"
  | "reveal";

export type GameState = {
  tableId: string;
  players: Player[];
  currentClipId: string | null;
  phase: GamePhase;
  guesses: Guess[];
  chat: ChatMessage[];
  clipPlaying: boolean;
  clipPosition: number;
  revealedTitle: boolean;
  sessionPaused: boolean;
};

// In-memory game state (replace with a database in production)
// Hang on globalThis to survive HMR in dev
declare global {
  // eslint-disable-next-line no-var
  var __glimpseTables: Map<string, GameState> | undefined;
}

const tables = globalThis.__glimpseTables ?? new Map<string, GameState>();
if (!globalThis.__glimpseTables) {
  globalThis.__glimpseTables = tables;
}

export function createTable(): string {
  // Generate uppercase table code
  const tableId = Math.random().toString(36).substring(2, 8).toUpperCase();
  tables.set(tableId, {
    tableId,
    players: [],
    currentClipId: null,
    phase: "lobby",
    guesses: [],
    chat: [],
    clipPlaying: false,
    clipPosition: 0,
    revealedTitle: false,
    sessionPaused: false,
  });
  return tableId;
}

export function getTable(tableId: string): GameState | undefined {
  // Normalize lookup to uppercase
  return tables.get(tableId.toUpperCase());
}

function addSystemMessage(tableId: string, text: string): void {
  const table = getTable(tableId);
  if (!table) return;

  const message: ChatMessage = {
    id: Math.random().toString(36).substring(2, 15),
    playerId: null,
    playerName: "System",
    text,
    timestamp: Date.now(),
    isSystem: true,
  };

  table.chat.push(message);
}

export function joinTable(tableId: string, playerName: string): Player | null {
  const table = getTable(tableId);
  if (!table) return null;

  const playerId = Math.random().toString(36).substring(2, 15);
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isHost: table.players.length === 0,
    lockedIn: false,
  };

  table.players.push(player);
  addSystemMessage(tableId, `${playerName} joined the table`);
  return player;
}

export function updateTable(tableId: string, updates: Partial<GameState>): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  Object.assign(table, updates);
  return true;
}

export function addGuess(tableId: string, playerId: string, text: string, locked: boolean = false): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  // Remove previous guess from this player
  table.guesses = table.guesses.filter((g) => g.playerId !== playerId);

  const guess: Guess = {
    id: Math.random().toString(36).substring(2, 15),
    playerId,
    playerName: player.name,
    text,
    timestamp: Date.now(),
    locked,
  };

  table.guesses.push(guess);

  if (locked) {
    player.lockedIn = true;
    addSystemMessage(tableId, `${player.name} locked in`);
  }

  return true;
}

export function addChatMessage(
  tableId: string,
  playerId: string,
  text: string,
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  const message: ChatMessage = {
    id: Math.random().toString(36).substring(2, 15),
    playerId,
    playerName: player.name,
    text,
    timestamp: Date.now(),
    isSystem: false,
  };

  table.chat.push(message);
  return true;
}

export function updatePlayerScore(
  tableId: string,
  playerId: string,
  score: number,
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  const oldScore = player.score;
  player.score = score;
  
  if (score !== oldScore) {
    const delta = score - oldScore;
    addSystemMessage(
      tableId,
      `${player.name} ${delta > 0 ? "+" : ""}${delta} → ${score}`,
    );
  }
  
  return true;
}

export function startRound(tableId: string, clipId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.currentClipId = clipId;
  table.phase = "playing";
  table.guesses = [];
  table.clipPlaying = true;
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  
  // Reset all players' locked-in state
  table.players.forEach((p) => (p.lockedIn = false));
  
  addSystemMessage(tableId, "Round started");
  return true;
}

export function setClipState(
  tableId: string,
  playing: boolean,
  position: number,
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.clipPlaying = playing;
  table.clipPosition = position;
  return true;
}

export function lockGuesses(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.phase = "judging";
  table.clipPlaying = false;
  
  // Lock all submitted guesses
  table.guesses.forEach((g) => (g.locked = true));
  table.players.forEach((p) => {
    if (table.guesses.some((g) => g.playerId === p.id)) {
      p.lockedIn = true;
    }
  });
  
  addSystemMessage(tableId, "Guesses locked — judging");
  return true;
}

export function revealTitle(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.phase = "reveal";
  table.revealedTitle = true;
  
  addSystemMessage(tableId, "Title revealed");
  return true;
}

export function resetRound(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.currentClipId = null;
  table.phase = "lobby";
  table.guesses = [];
  table.clipPlaying = false;
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  
  // Reset all players' locked-in state
  table.players.forEach((p) => (p.lockedIn = false));
  
  addSystemMessage(tableId, "Round reset — back to lobby");
  return true;
}

export function pauseSession(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.sessionPaused = true;
  table.clipPlaying = false;
  
  addSystemMessage(tableId, "Session paused");
  return true;
}

export function resumeSession(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.sessionPaused = false;
  
  addSystemMessage(tableId, "Session resumed");
  return true;
}

export function restartSession(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.currentClipId = null;
  table.phase = "lobby";
  table.guesses = [];
  table.clipPlaying = false;
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  
  // Reset all players' locked-in state but keep scores
  table.players.forEach((p) => (p.lockedIn = false));
  
  addSystemMessage(tableId, "Session restarted");
  return true;
}

export type Player = {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
};

export type Guess = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
};

export type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
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
};

// In-memory game state (replace with a database in production)
const tables = new Map<string, GameState>();

export function createTable(): string {
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
  });
  return tableId;
}

export function getTable(tableId: string): GameState | undefined {
  return tables.get(tableId);
}

export function joinTable(tableId: string, playerName: string): Player | null {
  const table = tables.get(tableId);
  if (!table) return null;

  const playerId = Math.random().toString(36).substring(2, 15);
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isHost: table.players.length === 0,
  };

  table.players.push(player);
  return player;
}

export function updateTable(tableId: string, updates: Partial<GameState>): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  Object.assign(table, updates);
  return true;
}

export function addGuess(tableId: string, playerId: string, text: string): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  const guess: Guess = {
    id: Math.random().toString(36).substring(2, 15),
    playerId,
    playerName: player.name,
    text,
    timestamp: Date.now(),
  };

  table.guesses.push(guess);
  return true;
}

export function addChatMessage(
  tableId: string,
  playerId: string,
  text: string,
): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  const message: ChatMessage = {
    id: Math.random().toString(36).substring(2, 15),
    playerId,
    playerName: player.name,
    text,
    timestamp: Date.now(),
  };

  table.chat.push(message);
  return true;
}

export function updatePlayerScore(
  tableId: string,
  playerId: string,
  score: number,
): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  player.score = score;
  return true;
}

export function startRound(tableId: string, clipId: string): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  table.currentClipId = clipId;
  table.phase = "playing";
  table.guesses = [];
  table.clipPlaying = true;
  table.clipPosition = 0;
  table.revealedTitle = false;
  return true;
}

export function setClipState(
  tableId: string,
  playing: boolean,
  position: number,
): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  table.clipPlaying = playing;
  table.clipPosition = position;
  return true;
}

export function lockGuesses(tableId: string): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  table.phase = "judging";
  table.clipPlaying = false;
  return true;
}

export function revealTitle(tableId: string): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  table.phase = "reveal";
  table.revealedTitle = true;
  return true;
}

export function resetRound(tableId: string): boolean {
  const table = tables.get(tableId);
  if (!table) return false;

  table.currentClipId = null;
  table.phase = "lobby";
  table.guesses = [];
  table.clipPlaying = false;
  table.clipPosition = 0;
  table.revealedTitle = false;
  return true;
}

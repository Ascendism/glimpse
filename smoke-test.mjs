#!/usr/bin/env node
/**
 * Automated smoke test for Glimpse multiplayer game.
 * Tests a full round: create → join → start → guess → lock → reveal
 * 
 * Usage: npm run dev (in another terminal), then: node smoke-test.mjs
 */

const BASE_URL = 'http://localhost:8081';

// Helper to call TanStack Start server functions
// Server functions are accessed via /_serverFn/<functionId> with the x-tsr-serverFn header
async function callServerFn(fnId, payload = {}) {
  const url = `${BASE_URL}/_serverFn/${fnId}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-tsr-serverFn': 'true', // Required for TanStack Start server functions
  };
  
  // POST request with data payload
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server function ${fnId} failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  return result;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSmokeTest() {
  console.log('🧪 Starting Glimpse Smoke Test\n');
  
  let tableId, player1Id, player2Id;
  
  try {
    // Step 1: Create table with host
    console.log('📝 Step 1: Creating table with host "Alice"...');
    const createResult = await callServerFn('createTable', { hostName: 'Alice' });
    tableId = createResult.tableId;
    player1Id = createResult.player?.id;
    console.log(`✅ Table created: ${tableId}`);
    console.log(`✅ Host joined: ${player1Id}\n`);
    
    if (!player1Id) {
      throw new Error('Host should auto-join when creating table');
    }
    
    // Step 2: Fetch game state to verify table exists
    console.log('📊 Step 2: Fetching initial game state...');
    let gameState = await callServerFn('fetchGameState', tableId);
    console.log(`✅ Table found: ${gameState.table.id}`);
    console.log(`✅ Players: ${gameState.table.players.length} (expected 1)`);
    console.log(`✅ Phase: ${gameState.table.phase} (expected 'lobby')\n`);
    
    if (gameState.table.players.length !== 1) {
      throw new Error(`Expected 1 player, got ${gameState.table.players.length}`);
    }
    
    // Step 3: Join as Player 2
    console.log('👥 Step 3: Joining as Player 2 "Bob"...');
    const joinResult = await callServerFn('joinTable', { tableId, playerName: 'Bob' });
    player2Id = joinResult.player.id;
    console.log(`✅ Player 2 joined: ${player2Id}\n`);
    
    // Step 4: Verify 2 players
    console.log('📊 Step 4: Verifying 2 players...');
    gameState = await callServerFn('fetchGameState', tableId);
    console.log(`✅ Players: ${gameState.table.players.length} (expected 2)\n`);
    
    if (gameState.table.players.length !== 2) {
      throw new Error(`Expected 2 players, got ${gameState.table.players.length}`);
    }
    
    // Step 5: Host starts round
    console.log('🎬 Step 5: Host starting round...');
    await callServerFn('performHostAction', {
      tableId,
      playerId: player1Id,
      action: 'start_round',
      payload: { clipId: 'clip1' },
    });
    console.log('✅ Round started\n');
    
    // Wait for state update
    await sleep(500);
    
    // Step 6: Verify phase is 'playing'
    console.log('📊 Step 6: Verifying game phase...');
    gameState = await callServerFn('fetchGameState', tableId);
    console.log(`✅ Phase: ${gameState.table.phase} (expected 'playing')`);
    console.log(`✅ Current clip: ${gameState.table.currentClipId}\n`);
    
    if (gameState.table.phase !== 'playing') {
      throw new Error(`Expected phase 'playing', got '${gameState.table.phase}'`);
    }
    
    // Step 7: Player 1 submits guess
    console.log('💭 Step 7: Player 1 (Alice) submitting guess...');
    await callServerFn('submitGuess', {
      tableId,
      playerId: player1Id,
      text: 'The Matrix',
      locked: false,
    });
    console.log('✅ Guess submitted\n');
    
    // Step 8: Player 2 submits guess
    console.log('💭 Step 8: Player 2 (Bob) submitting guess...');
    await callServerFn('submitGuess', {
      tableId,
      playerId: player2Id,
      text: 'The Matrix Reloaded',
      locked: false,
    });
    console.log('✅ Guess submitted\n');
    
    // Step 9: Verify guesses are recorded
    console.log('📊 Step 9: Verifying guesses...');
    gameState = await callServerFn('fetchGameState', tableId);
    console.log(`✅ Guesses: ${gameState.table.guesses.length} (expected 2)`);
    console.log(`   - ${gameState.table.guesses[0].playerName}: "${gameState.table.guesses[0].text}"`);
    console.log(`   - ${gameState.table.guesses[1].playerName}: "${gameState.table.guesses[1].text}"\n`);
    
    if (gameState.table.guesses.length !== 2) {
      throw new Error(`Expected 2 guesses, got ${gameState.table.guesses.length}`);
    }
    
    // Step 10: Player 1 locks in
    console.log('🔒 Step 10: Player 1 (Alice) locking in guess...');
    await callServerFn('submitGuess', {
      tableId,
      playerId: player1Id,
      text: 'The Matrix',
      locked: true,
    });
    console.log('✅ Player 1 locked in\n');
    
    // Step 11: Player 2 locks in
    console.log('🔒 Step 11: Player 2 (Bob) locking in guess...');
    await callServerFn('submitGuess', {
      tableId,
      playerId: player2Id,
      text: 'The Matrix Reloaded',
      locked: true,
    });
    console.log('✅ Player 2 locked in\n');
    
    // Step 12: Verify lockedIn state
    console.log('📊 Step 12: Verifying locked-in state...');
    gameState = await callServerFn('fetchGameState', tableId);
    const p1 = gameState.table.players.find(p => p.id === player1Id);
    const p2 = gameState.table.players.find(p => p.id === player2Id);
    console.log(`✅ Player 1 lockedIn: ${p1.lockedIn} (expected true)`);
    console.log(`✅ Player 2 lockedIn: ${p2.lockedIn} (expected true)\n`);
    
    if (!p1.lockedIn || !p2.lockedIn) {
      throw new Error('Expected both players to be locked in');
    }
    
    // Step 13: Host locks guesses
    console.log('🔐 Step 13: Host locking all guesses...');
    await callServerFn('performHostAction', {
      tableId,
      playerId: player1Id,
      action: 'lock_guesses',
    });
    console.log('✅ Guesses locked\n');
    
    // Wait for state update
    await sleep(500);
    
    // Step 14: Host reveals title
    console.log('🎭 Step 14: Host revealing title...');
    await callServerFn('performHostAction', {
      tableId,
      playerId: player1Id,
      action: 'reveal_title',
    });
    console.log('✅ Title revealed\n');
    
    // Wait for state update
    await sleep(500);
    
    // Step 15: Verify final state
    console.log('📊 Step 15: Verifying final state...');
    gameState = await callServerFn('fetchGameState', tableId);
    console.log(`✅ Phase: ${gameState.table.phase} (expected 'reveal')`);
    console.log(`✅ Revealed title: ${gameState.table.revealedTitle}`);
    console.log(`✅ Players: ${gameState.table.players.length}`);
    console.log(`✅ Guesses: ${gameState.table.guesses.length}`);
    console.log(`✅ Chat messages: ${gameState.table.chat.length}\n`);
    
    if (gameState.table.phase !== 'reveal') {
      throw new Error(`Expected phase 'reveal', got '${gameState.table.phase}'`);
    }
    
    if (!gameState.table.revealedTitle) {
      throw new Error('Expected revealedTitle to be true');
    }
    
    // Step 16: Test that locked-in player cannot submit new guess
    console.log('🚫 Step 16: Testing locked-in player cannot guess again...');
    try {
      await callServerFn('submitGuess', {
        tableId,
        playerId: player1Id,
        text: 'New guess',
        locked: false,
      });
      throw new Error('Expected submitGuess to reject locked-in player');
    } catch (err) {
      if (err.message.includes('already locked in') || err.message.includes('Cannot guess')) {
        console.log('✅ Correctly rejected guess from locked-in player\n');
      } else {
        throw err;
      }
    }
    
    // Step 17: Test chat message
    console.log('💬 Step 17: Sending chat message...');
    await callServerFn('sendChatMessage', {
      tableId,
      playerId: player2Id,
      text: 'Great round!',
    });
    gameState = await callServerFn('fetchGameState', tableId);
    const lastChat = gameState.table.chat[gameState.table.chat.length - 1];
    console.log(`✅ Chat message sent: "${lastChat.text}" from ${lastChat.playerName}\n`);
    
    // All tests passed!
    console.log('✨ All smoke tests passed! ✨\n');
    console.log('Summary:');
    console.log(`  - Table created: ${tableId}`);
    console.log(`  - Players joined: 2`);
    console.log(`  - Full round completed: lobby → playing → reveal`);
    console.log(`  - Guesses locked: 2`);
    console.log(`  - Server-side validation working: locked-in rejection ✓`);
    console.log(`  - Chat working: ✓\n`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Smoke test failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Server returned non-200');
    }
    return true;
  } catch (err) {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('Please start the dev server with: npm run dev');
    process.exit(1);
  }
}

async function main() {
  await checkServer();
  await runSmokeTest();
}

main();

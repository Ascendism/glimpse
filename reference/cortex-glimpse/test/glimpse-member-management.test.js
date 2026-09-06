'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { createRoomService } = require('../lib/cortexGlimpse/room');

describe('Glimpse member management', () => {
  it('host can kick a player', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join a player
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    
    const before = svc.getLive(roomId);
    assert.strictEqual(before.players.length, 1);
    assert.strictEqual(before.players[0].playerId, 'player1');
    
    // Host kicks the player
    const result = svc.kickPlayer(roomId, 'player1', 'host1');
    
    assert.strictEqual(result.players.length, 0);
    const after = svc.getLive(roomId);
    assert.strictEqual(after.players.length, 0);
    
    svc.close();
  });

  it('non-host cannot kick a player', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join two players
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    svc.joinRoom(created.inviteToken, {
      playerId: 'player2',
      displayName: 'Player Two'
    });
    
    // Player1 tries to kick Player2 (should fail)
    assert.throws(
      () => svc.kickPlayer(roomId, 'player2', 'player1'),
      (err) => {
        assert.strictEqual(err.code, 'not_host');
        return true;
      }
    );
    
    const after = svc.getLive(roomId);
    assert.strictEqual(after.players.length, 2);
    
    svc.close();
  });

  it('host can promote another player to host', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join a player
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    
    const before = svc.getLive(roomId);
    assert.strictEqual(before.hostId, 'host1');
    
    // Original host promotes player1 to host
    svc.promoteToHost(roomId, 'player1', 'host1');
    
    const after = svc.getLive(roomId);
    assert.strictEqual(after.hostId, 'player1');
    const newHost = after.players.find((p) => p.playerId === 'player1');
    assert.strictEqual(newHost.isHost, true);
    
    svc.close();
  });

  it('non-host cannot promote a player', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join two players
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    svc.joinRoom(created.inviteToken, {
      playerId: 'player2',
      displayName: 'Player Two'
    });
    
    // Player1 tries to promote Player2 (should fail)
    assert.throws(
      () => svc.promoteToHost(roomId, 'player2', 'player1'),
      (err) => {
        assert.strictEqual(err.code, 'not_host');
        return true;
      }
    );
    
    const after = svc.getLive(roomId);
    assert.strictEqual(after.hostId, 'host1');
    
    svc.close();
  });

  it('new host can perform host actions', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join a player
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    
    // Promote player1 to host
    svc.promoteToHost(roomId, 'player1', 'host1');
    
    // Join another player
    svc.joinRoom(created.inviteToken, {
      playerId: 'player2',
      displayName: 'Player Two'
    });
    
    // New host (player1) should be able to kick player2
    const result = svc.kickPlayer(roomId, 'player2', 'player1');
    
    assert.strictEqual(result.players.length, 1);
    assert.strictEqual(result.players[0].playerId, 'player1');
    
    svc.close();
  });

  it('kicked player is removed from answers map', async () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join a player
    const joined = svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    
    assert.ok(joined, 'Join should succeed');
    assert.strictEqual(joined.playerId, 'player1');
    
    // Verify player is in room
    const roomBefore = svc.getLive(roomId);
    assert.strictEqual(roomBefore.players.length, 1);
    assert.strictEqual(roomBefore.players[0].playerId, 'player1');
    
    // Start round
    await svc.startRound(roomId, {});
    
    // Submit answer using correct signature: (tokenOrRoomId, playerId, text)
    svc.submitAnswer(roomId, 'player1', 'My guess');
    
    const withAnswer = svc.getLive(roomId);
    assert.ok(withAnswer.answers.has('player1'));
    
    // Kick the player
    svc.kickPlayer(roomId, 'player1', 'host1');
    
    const after = svc.getLive(roomId);
    assert.strictEqual(after.players.length, 0);
    assert.ok(!after.answers.has('player1'));
    
    svc.close();
  });

  it('host cannot kick themselves', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Host tries to kick themselves (should fail)
    assert.throws(
      () => svc.kickPlayer(roomId, 'host1', 'host1'),
      (err) => {
        assert.strictEqual(err.code, 'cannot_kick_host');
        return true;
      }
    );
    
    svc.close();
  });

  it('kick emits player:kicked event', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join a player
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    
    // Set up event listener on the room channel
    let emitted = false;
    let emittedData = null;
    svc.bus.once(`room:${roomId}`, (data) => {
      if (data.type === 'player:kicked') {
        emitted = true;
        emittedData = data;
      }
    });
    
    // Kick the player
    svc.kickPlayer(roomId, 'player1', 'host1');
    
    // Verify event was emitted
    assert.ok(emitted, 'Event should have been emitted');
    assert.strictEqual(emittedData.type, 'player:kicked');
    assert.strictEqual(emittedData.playerId, 'player1');
    
    svc.close();
  });

  it('promote emits host:promoted event', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join a player
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    
    // Set up event listener on the room channel
    let emitted = false;
    let emittedData = null;
    svc.bus.once(`room:${roomId}`, (data) => {
      if (data.type === 'host:promoted') {
        emitted = true;
        emittedData = data;
      }
    });
    
    // Promote the player
    svc.promoteToHost(roomId, 'player1', 'host1');
    
    // Verify event was emitted
    assert.ok(emitted, 'Event should have been emitted');
    assert.strictEqual(emittedData.type, 'host:promoted');
    assert.strictEqual(emittedData.playerId, 'player1');
    
    svc.close();
  });

  it('after promote, original hostId cannot kick but new hostId can', () => {
    const svc = createRoomService({ now: () => 100000 });
    const created = svc.createRoom({
      host: { id: 'host1', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'close_enough'
    });
    const roomId = created.roomId;
    
    // Join two players
    svc.joinRoom(created.inviteToken, {
      playerId: 'player1',
      displayName: 'Player One'
    });
    svc.joinRoom(created.inviteToken, {
      playerId: 'player2',
      displayName: 'Player Two'
    });
    
    // Promote player1 to host
    svc.promoteToHost(roomId, 'player1', 'host1');
    
    // Original host tries to kick player2 (should fail)
    assert.throws(
      () => svc.kickPlayer(roomId, 'player2', 'host1'),
      (err) => {
        assert.strictEqual(err.code, 'not_host');
        return true;
      }
    );
    
    // New host tries to kick player2 (should succeed)
    const result = svc.kickPlayer(roomId, 'player2', 'player1');
    assert.strictEqual(result.players.length, 1);
    assert.strictEqual(result.players[0].playerId, 'player1');
    
    svc.close();
  });
});

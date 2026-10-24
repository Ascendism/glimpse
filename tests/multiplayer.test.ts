import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env["GLIMPSE_STATE_DIR"] = mkdtempSync(join(tmpdir(), "glimpse-test-"));
const game = await import("../src/lib/game-state");
const { userDb, leaderboardDb, getDb } = await import("../src/lib/db");

function setup() {
  const id = game.createTable();
  const host = game.joinTable(id, "Host")!;
  const a = game.joinTable(id, "Alice")!;
  const b = game.joinTable(id, "Bob")!;
  const table = game.getTable(id)!;
  const clip = table.library.clips[0]!;
  return { id, host, a, b, table, clip };
}
function ready(s: ReturnType<typeof setup>) {
  for (const p of s.table.players) game.reportPlayerReady(s.id, p.id);
}

test("seat IDs cannot authorize impersonation; private tokens never leave snapshots", () => {
  const s = setup();
  assert.throws(() => game.authorizeSeat(s.id, s.host.id, s.a.seatToken, true));
  assert.throws(() => game.authorizeSeat(s.id, s.a.id, s.a.seatToken, true));
  assert.equal(game.authorizeSeat(s.id, s.host.id, s.host.seatToken, true).id, s.host.id);
  assert.ok(!JSON.stringify(game.publicState(s.table, s.host)).includes(s.host.seatToken!));
});

test("answers and other guesses stay private until the intended phase; hints reveal only one cell", () => {
  const s = setup();
  game.startRound(s.id, s.clip.id);
  ready(s);
  game.addGuess(s.id, s.a.id, "Alice secret");
  game.addGuess(s.id, s.b.id, "Bob secret");
  const view = game.publicState(s.table, s.a);
  assert.equal(view.library.clips[0]!.title, "");
  assert.equal(view.library.clips.length, 1);
  assert.deepEqual(
    view.guesses.map((g) => g.text),
    ["Alice secret"],
  );
  assert.equal(game.publicState(s.table).guesses.length, 0);
  assert.equal(view.boardRows!.flat().filter((c) => c.kind === "letter" && c.char).length, 0);
  assert.equal(game.revealHint(s.id), true);
  assert.equal(
    game
      .publicState(s.table)
      .boardRows!.flat()
      .filter((c) => c.kind === "letter" && c.char).length,
    1,
  );
  game.lockGuesses(s.id);
  game.revealTitle(s.id);
  assert.equal(game.publicState(s.table).library.clips[0]!.title, s.clip.title);
});

test("guess lifecycle validates phase, readiness, host role, late joins and immutable locks", () => {
  const s = setup();
  assert.equal(game.addGuess(s.id, s.a.id, "too early"), false);
  assert.equal(game.startRound(s.id, "missing"), false);
  game.startRound(s.id, s.clip.id);
  assert.equal(game.addGuess(s.id, s.a.id, "loading"), false);
  ready(s);
  assert.equal(game.addGuess(s.id, s.host.id, "host knows answer"), false);
  const late = game.joinTable(s.id, "Late")!;
  assert.equal(game.addGuess(s.id, late.id, "late"), false);
  assert.equal(game.addGuess(s.id, s.a.id, "first", true), true);
  assert.equal(game.addGuess(s.id, s.a.id, "changed"), false);
  game.lockGuesses(s.id);
  assert.equal(game.addGuess(s.id, s.b.id, "too late"), false);
});

test("routine progresses across repeated clips, admits late joiners and resets readiness", () => {
  const s = setup();
  assert.equal(
    game.configureRoutine(s.id, {
      playlist: [s.clip.id, s.clip.id],
      guessDurationSec: 20,
      judgingDurationSec: 5,
      revealDurationSec: 5,
      autoAdvance: true,
    }),
    true,
  );
  game.startRoutine(s.id);
  ready(s);
  assert.ok(s.table.roundId, "the first routine round must have a request identity");
  const roundId = s.table.roundId;
  const late = game.joinTable(s.id, "Late")!;
  game.addGuess(s.id, s.a.id, "a", true);
  game.addGuess(s.id, s.b.id, "b", true);
  game.tickOrchestration();
  assert.equal(s.table.phase, "judging"); // Host is not required to submit a guess.
  game.skipPhase(s.id);
  game.tickOrchestration();
  assert.equal(s.table.phase, "reveal");
  game.skipPhase(s.id);
  game.tickOrchestration();
  assert.equal(s.table.phase, "playing");
  assert.notEqual(s.table.roundId, roundId);
  assert.equal(late.joinedMidRound, false);
  assert.equal(late.ready, false);
  assert.equal(s.table.waitingForReady, true);
  assert.equal(s.table.guesses.length, 0);
  game.stopRoutine(s.id);
  assert.equal(s.table.currentClipId, null);
  assert.equal(s.table.voteState, null);
});

test("manual next-round mode waits at reveal and advances on host request", () => {
  const s = setup();
  game.configureRoutine(s.id, {
    playlist: [s.clip.id, s.clip.id],
    guessDurationSec: 20,
    judgingDurationSec: 5,
    revealDurationSec: 5,
    autoAdvance: false,
  });
  game.startRoutine(s.id);
  ready(s);
  game.skipPhase(s.id);
  game.skipPhase(s.id);
  s.table.routine!.phaseDeadline = Date.now() - 1;
  game.tickOrchestration();
  assert.equal(s.table.phase, "reveal");
  assert.equal(s.table.routine!.phaseDeadline, null);
  game.skipPhase(s.id);
  assert.equal(s.table.phase, "playing");
  assert.equal(s.table.routine!.currentIndex, 1);
});

test("a disconnected host can be replaced, but an active host cannot", () => {
  const s = setup();
  assert.equal(game.claimHost(s.id, s.a.id), false);
  s.host.lastSeenAt = Date.now() - 46000;
  assert.equal(game.claimHost(s.id, s.a.id), true);
  assert.equal(s.a.isHost, true);
  assert.throws(() => game.authorizeSeat(s.id, s.host.id, s.host.seatToken, true));
});

test("readiness arriving while paused is retained without starting playback", () => {
  const s = setup();
  game.configureRoutine(s.id, {
    playlist: [s.clip.id],
    guessDurationSec: 20,
    judgingDurationSec: 5,
    revealDurationSec: 5,
    autoAdvance: true,
  });
  game.startRoutine(s.id);
  game.pauseRoutine(s.id);
  ready(s);
  assert.equal(s.table.clipPlaying, false);
  game.resumeRoutine(s.id);
  assert.equal(s.table.waitingForReady, false);
  assert.equal(s.table.clipPlaying, true);
});

test("pause freezes ready timeout; resume still waits for readiness", () => {
  const s = setup();
  game.configureRoutine(s.id, {
    playlist: [s.clip.id],
    guessDurationSec: 20,
    judgingDurationSec: 5,
    revealDurationSec: 5,
    autoAdvance: true,
  });
  game.startRoutine(s.id);
  game.pauseRoutine(s.id);
  s.table.readyDeadline = Date.now() - 1;
  game.tickOrchestration();
  assert.equal(s.table.waitingForReady, true);
  assert.equal(s.table.clipPlaying, false);
  assert.equal(game.forceStartAnyway(s.id), false);
  game.resumeRoutine(s.id);
  assert.equal(s.table.clipPlaying, false);
  game.forceStartAnyway(s.id);
  assert.equal(s.table.clipPlaying, true);
});

test("votes require a strict majority of contestants and are rejected outside play", () => {
  const s = setup();
  game.startRound(s.id, s.clip.id);
  ready(s);
  assert.equal(s.table.voteState!.threshold, 2);
  game.castVote(s.id, s.a.id, "advance");
  assert.equal(s.table.segmentLadder!.currentSegmentIndex, 0);
  game.castVote(s.id, s.a.id, "advance");
  assert.equal(s.table.voteState!.advanceVotes.length, 1);
  game.castVote(s.id, s.b.id, "advance");
  assert.equal(s.table.segmentLadder!.currentSegmentIndex, 1);
  game.lockGuesses(s.id);
  assert.equal(game.castVote(s.id, s.a.id, "hint"), false);
});

test("leaving transfers host and clears a round; final departure removes table", () => {
  const s = setup();
  game.startRound(s.id, s.clip.id);
  game.leaveTable(s.id, s.host.id);
  assert.equal(s.a.isHost, true);
  assert.equal(s.table.phase, "lobby");
  game.leaveTable(s.id, s.a.id);
  game.leaveTable(s.id, s.b.id);
  assert.equal(game.getTable(s.id), undefined);
});

test("leaderboard records server scores once, supports ties, excludes host and guests, starts fresh games", () => {
  const s = setup();
  for (const [p, discordId] of [
    [s.host, "host-user"],
    [s.a, "alice-user"],
    [s.b, "bob-user"],
  ] as const) {
    userDb.upsert({ discord_id: discordId, username: p.name, discriminator: "0", avatar: null });
    p.discordId = discordId;
  }
  game.updatePlayerScore(s.id, s.host.id, 100);
  game.updatePlayerScore(s.id, s.a.id, 20);
  game.updatePlayerScore(s.id, s.b.id, 20);
  assert.equal(game.updatePlayerScore(s.id, s.a.id, NaN), false);
  assert.equal(game.finishGame(s.id), true);
  assert.equal(game.finishGame(s.id), true);
  assert.equal(leaderboardDb.getPlayerStats("alice-user")!.games_played, 1);
  assert.equal(leaderboardDb.getPlayerStats("alice-user")!.wins, 1);
  assert.equal(leaderboardDb.getPlayerStats("bob-user")!.wins, 1);
  assert.equal(
    getDb()
      .prepare("SELECT COUNT(*) AS n FROM leaderboard_entries WHERE discord_id = ?")
      .get("host-user").n,
    0,
  );
  assert.equal(game.updatePlayerScore(s.id, s.a.id, 30), false);
  game.restartSession(s.id);
  assert.equal(s.a.score, 0);
  game.updatePlayerScore(s.id, s.a.id, 5);
  game.finishGame(s.id);
  assert.equal(leaderboardDb.getPlayerStats("alice-user")!.total_points, 25);
  assert.equal(leaderboardDb.getPlayerStats("alice-user")!.games_played, 2);
});

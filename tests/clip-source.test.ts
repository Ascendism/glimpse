import { test } from "node:test";
import assert from "node:assert/strict";
import { parseClipSource, validClipRange } from "../src/lib/clip-source";

test("recognizes YouTube share, watch, embed and shorts URLs without trusting lookalike hosts", () => {
  const id = "m8e-FF8MsqU";
  for (const value of [
    id,
    `https://youtu.be/${id}?t=30`,
    `https://www.youtube.com/watch?v=${id}&t=4`,
    `https://m.youtube.com/shorts/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ])
    assert.deepEqual(parseClipSource(value), { type: "youtube", id });
  assert.equal(parseClipSource(`https://youtube.com.evil.example/watch?v=${id}`).type, "url");
  assert.throws(() => parseClipSource("https://youtube.com/playlist?list=bad"));
  for (const value of [
    "javascript:alert(1)",
    "file:///video.mp4",
    "blob:https://example.com/id",
    "https://user:password@example.com/video.mp4",
  ])
    assert.throws(() => parseClipSource(value));
});

test("markers retain subsecond precision and reject empty, backwards, unbounded or out of video ranges", () => {
  assert.ok(validClipRange(1.125, 2.375, 3));
  for (const [start, end, duration] of [
    [0, 0, 3],
    [2, 1, 3],
    [-1, 2, 3],
    [0, 4, 3],
    [0, 2, Infinity],
    [NaN, 2, 3],
  ])
    assert.equal(validClipRange(start!, end!, duration!), false);
});

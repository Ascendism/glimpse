import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutPhrase } from "../src/lib/puzzle";

for (const title of [
  "THE SHAWSHANK REDEMPTION",
  "SUPERCALIFRAGILISTICEXPIALIDOCIOUS",
  "A VERY LONG MOVIE TITLE THAT NEEDS MORE THAN THE ORIGINAL FOUR ROWS TO SHOW EVERY SINGLE LETTER",
  "1917",
  "WALL·E",
  "AMÉLIE",
  "",
  "A   B",
]) {
  test(`board preserves every title character: ${title || "empty"}`, () => {
    const rows = layoutPhrase(title);
    const chars = rows
      .flat()
      .flatMap((c) => (c.kind === "empty" ? [] : [c.char]))
      .join("");
    assert.equal(chars, title.toUpperCase().replace(/\s/g, ""));
    assert.ok(rows.length >= 4);
    assert.ok(rows.every((row) => row.length === 12 || row.length === 14));
  });
}
test("numbers and accented letters stay behind closed letter tiles", () => {
  assert.ok(
    layoutPhrase("1917 É")
      .flat()
      .filter((c) => c.kind !== "empty")
      .every((c) => c.kind === "letter"),
  );
});

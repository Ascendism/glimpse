import { randomUUID } from "node:crypto";
import { getCookie, setCookie, getRequest } from "@tanstack/react-start/server";
import { currentDiscordId } from "./auth-session.server";
import { getDb } from "./db";
import type { LibraryClip } from "./library";

function owner() {
  let guest = getCookie("glimpse_library");
  if (!guest || !/^[a-f0-9-]{36}$/.test(guest)) {
    guest = randomUUID();
    setCookie("glimpse_library", guest, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 86400,
      secure: new URL(getRequest().url).protocol === "https:",
    });
  }
  const db = getDb();
  db.exec(
    "CREATE TABLE IF NOT EXISTS personal_clips (owner TEXT NOT NULL, id TEXT NOT NULL, clip TEXT NOT NULL, PRIMARY KEY(owner,id))",
  );
  const discord = currentDiscordId();
  if (!discord) return `guest:${guest}`;
  const account = `discord:${discord}`;
  // Claim this browser's guest clips on login, without replacing newer account edits.
  db.transaction(() => {
    db.prepare(
      "INSERT OR IGNORE INTO personal_clips SELECT ?, id, clip FROM personal_clips WHERE owner = ?",
    ).run(account, `guest:${guest}`);
    db.prepare("DELETE FROM personal_clips WHERE owner = ?").run(`guest:${guest}`);
  })();
  return account;
}
export function loadPersonalClips(): LibraryClip[] {
  const key = owner();
  return (
    getDb().prepare("SELECT clip FROM personal_clips WHERE owner = ?").all(key) as {
      clip: string;
    }[]
  ).map((row) => JSON.parse(row.clip) as LibraryClip);
}
export function savePersonalClip(clip: LibraryClip) {
  const key = owner();
  getDb()
    .prepare(
      "INSERT INTO personal_clips(owner,id,clip) VALUES (?,?,?) ON CONFLICT(owner,id) DO UPDATE SET clip=excluded.clip",
    )
    .run(key, clip.id, JSON.stringify(clip));
}
export function deletePersonalClip(id: string) {
  const key = owner();
  getDb().prepare("DELETE FROM personal_clips WHERE owner=? AND id=?").run(key, id);
}

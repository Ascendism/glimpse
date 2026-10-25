import { getCookie } from "@tanstack/react-start/server";
import { sessionDb } from "./db";

export function currentDiscordId(): string | null {
  const token = getCookie("glimpse_session");
  return token ? (sessionDb.getBySessionId(token)?.discord_id ?? null) : null;
}

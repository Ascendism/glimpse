import { randomBytes } from "node:crypto";
import { getCookie, setCookie, deleteCookie, getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { userDb, sessionDb } from "./db";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: DiscordUser | null;
  sessionId: string | null;
};

function getDiscordOAuthURL(redirectUri: string, state: string): string {
  const clientId = process.env["DISCORD_CLIENT_ID"];
  if (!clientId) {
    throw new Error("DISCORD_CLIENT_ID not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  const clientId = process.env["DISCORD_CLIENT_ID"];
  const clientSecret = process.env["DISCORD_CLIENT_SECRET"];

  if (!clientId || !clientSecret) {
    throw new Error("Discord OAuth credentials not configured");
  }

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Discord token exchange failed: ${error}`);
  }

  return response.json();
}

async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Discord user");
  }

  return response.json();
}

export const getAuthState = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthState> => {
    const sessionId = getCookie("glimpse_session");
    if (!sessionId) {
      return { isAuthenticated: false, user: null, sessionId: null };
    }

    const session = sessionDb.getBySessionId(sessionId);
    if (!session) {
      return { isAuthenticated: false, user: null, sessionId: null };
    }

    const user = userDb.getById(session.discord_id);
    if (!user) {
      return { isAuthenticated: false, user: null, sessionId: null };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.discord_id,
        username: user.username,
        discriminator: user.discriminator ?? "0",
        avatar: user.avatar,
      },
      sessionId: null,
    };
  },
);

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: new URL(getRequest().url).protocol === "https:",
    path: "/",
  };
}

function callbackUri() {
  return (
    process.env["DISCORD_REDIRECT_URI"] || new URL("/auth/discord/callback", getRequest().url).href
  );
}
export const initiateDiscordLogin = createServerFn({ method: "POST" }).handler(async () => {
  const state = randomBytes(32).toString("hex");
  const authUrl = getDiscordOAuthURL(callbackUri(), state);
  setCookie("glimpse_oauth_state", state, { ...cookieOptions(), maxAge: 600 });
  return { authUrl };
});
export const handleDiscordCallback = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ code: z.string().min(1).max(2048), state: z.string().min(1).max(128) }).parse(data),
  )
  .handler(async ({ data }) => {
    const expected = getCookie("glimpse_oauth_state");
    deleteCookie("glimpse_oauth_state", { path: "/" });
    if (!expected || data.state !== expected)
      throw new Error("Discord login expired or state did not match. Please try again.");
    const tokenData = await exchangeCodeForToken(data.code, callbackUri());
    const discordUser = await fetchDiscordUser(tokenData.access_token);
    const user = userDb.upsert({
      discord_id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
    });
    const session = sessionDb.create(user.discord_id);
    setCookie("glimpse_session", session.session_id, { ...cookieOptions(), maxAge: 7 * 86400 });
    return { success: true };
  });
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("glimpse_session");
  if (token) sessionDb.deleteBySessionId(token);
  deleteCookie("glimpse_session", { path: "/" });
  return { success: true };
});

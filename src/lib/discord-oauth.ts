import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/start-server-core";
import { userDb, sessionDb } from "./db";
import { randomBytes } from "crypto";

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
  const clientId = process.env.DISCORD_CLIENT_ID;
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

async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

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

export const getAuthState = createServerFn({ method: "GET" })
  .handler(async ({ request }): Promise<AuthState> => {
    const sessionId = getSessionIdFromRequest(request);
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
      sessionId,
    };
  });

export const initiateDiscordLogin = createServerFn({ method: "POST" })
  .validator((data: { redirectUri?: string }) => data)
  .handler(async ({ data }) => {
    // Default to port 8080 for playtesting compatibility
    const redirectUri = data.redirectUri || 
      process.env.DISCORD_REDIRECT_URI || 
      "http://localhost:8080/auth/discord/callback";
    
    const state = generateRandomState();
    storeOAuthState(state); // Store for validation on callback
    const authUrl = getDiscordOAuthURL(redirectUri, state);
    return { authUrl, state };
  });

export const handleDiscordCallback = createServerFn({ method: "POST" })
  .validator((data: { code: string; state: string; redirectUri: string }) => data)
  .handler(async ({ data }): Promise<{ user: DiscordUser }> => {
    const { code, state, redirectUri } = data;

    // Validate OAuth state to prevent CSRF attacks
    if (!validateAndConsumeOAuthState(state)) {
      throw new Error("Invalid or expired OAuth state. Please try logging in again.");
    }

    const tokenData = await exchangeCodeForToken(code, redirectUri);
    const discordUser = await fetchDiscordUser(tokenData.access_token);

    const user = userDb.upsert({
      discord_id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
    });

    const session = sessionDb.create(user.discord_id);

    // Set secure session cookie server-side
    const isProduction = process.env.NODE_ENV === "production";
    setCookie("glimpse_session", session.session_id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      user: {
        id: user.discord_id,
        username: user.username,
        discriminator: user.discriminator ?? "0",
        avatar: user.avatar,
      },
    };
  });

export const logout = createServerFn({ method: "POST" })
  .handler(async ({ request }) => {
    const sessionId = getSessionIdFromRequest(request);
    if (sessionId) {
      sessionDb.deleteBySessionId(sessionId);
    }
    
    // Clear session cookie
    setCookie("glimpse_session", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expire immediately
    });
    
    return { success: true };
  });

function getSessionIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("glimpse_session="));
  if (!sessionCookie) return null;

  return sessionCookie.split("=")[1] || null;
}

// OAuth state store (in-memory, expires after 10 minutes)
const oauthStates = new Map<string, number>(); // state -> expiresAt timestamp

function generateRandomState(): string {
  return randomBytes(32).toString("hex");
}

function storeOAuthState(state: string): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  oauthStates.set(state, expiresAt);
  
  // Clean up expired states
  for (const [key, expires] of oauthStates.entries()) {
    if (Date.now() > expires) {
      oauthStates.delete(key);
    }
  }
}

function validateAndConsumeOAuthState(state: string): boolean {
  const expiresAt = oauthStates.get(state);
  if (!expiresAt) {
    return false; // State not found
  }
  
  if (Date.now() > expiresAt) {
    oauthStates.delete(state);
    return false; // State expired
  }
  
  // One-time use: delete after validation
  oauthStates.delete(state);
  return true;
}

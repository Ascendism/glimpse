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
  .validator((data: { redirectUri: string }) => data)
  .handler(async ({ data }) => {
    const state = generateRandomState();
    const authUrl = getDiscordOAuthURL(data.redirectUri, state);
    return { authUrl, state };
  });

export const handleDiscordCallback = createServerFn({ method: "POST" })
  .validator((data: { code: string; redirectUri: string }) => data)
  .handler(async ({ data }): Promise<{ sessionId: string; user: DiscordUser }> => {
    const { code, redirectUri } = data;

    const tokenData = await exchangeCodeForToken(code, redirectUri);
    const discordUser = await fetchDiscordUser(tokenData.access_token);

    const user = userDb.upsert({
      discord_id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
    });

    const session = sessionDb.create(user.discord_id);

    return {
      sessionId: session.session_id,
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

function generateRandomState(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

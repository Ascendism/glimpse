// Test-process-only provider adapter. Production never imports this file.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = String(input);
  if (url === "https://discord.com/api/v10/oauth2/token") {
    const code = new URLSearchParams(options.body).get("code");
    return Response.json({
      access_token: code,
      token_type: "Bearer",
      expires_in: 3600,
      scope: "identify",
    });
  }
  if (url === "https://discord.com/api/v10/users/@me") {
    const token = options.headers.Authorization.replace("Bearer ", "");
    return Response.json({
      id: `discord-${token}`,
      username: token,
      discriminator: "0",
      avatar: null,
    });
  }
  return realFetch(input, options);
};

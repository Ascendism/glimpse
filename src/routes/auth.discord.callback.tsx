import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { handleDiscordCallback } from "@/lib/discord-oauth";

export const Route = createFileRoute("/auth/discord/callback")({
  component: DiscordCallback,
});

function DiscordCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      setError(`Discord authorization failed: ${error}`);
      setProcessing(false);
      setTimeout(() => navigate({ to: "/" }), 3000);
      return;
    }

    if (!code) {
      setError("No authorization code received");
      setProcessing(false);
      setTimeout(() => navigate({ to: "/" }), 3000);
      return;
    }

    handleCallback(code);
  }, [navigate]);

  async function handleCallback(code: string) {
    try {
      const redirectUri = `${window.location.origin}/auth/discord/callback`;
      const { sessionId, user } = await handleDiscordCallback({ data: { code, redirectUri } });

      // Set session cookie
      document.cookie = `glimpse_session=${sessionId}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

      // Redirect back to main page
      navigate({ to: "/" });
    } catch (err) {
      console.error("Discord callback failed:", err);
      setError("Failed to complete Discord login. Please try again.");
      setProcessing(false);
      setTimeout(() => navigate({ to: "/" }), 3000);
    }
  }

  return (
    <main className="stage-bg min-h-screen font-body text-white/90 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-xl border border-white/10 bg-black/25 p-8 text-center space-y-4">
          <div className="marquee-lights mx-auto h-1.5 w-24 rounded-full" />
          
          {processing && !error && (
            <>
              <h1 className="text-gold-gradient font-display text-3xl tracking-[0.12em]">
                LOGGING IN
              </h1>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
              </div>
              <p className="text-white/60 text-sm">
                Completing Discord authentication...
              </p>
            </>
          )}

          {error && (
            <>
              <h1 className="text-red-400 font-display text-2xl tracking-[0.12em]">
                ERROR
              </h1>
              <p className="text-white/70">
                {error}
              </p>
              <p className="text-white/50 text-sm">
                Redirecting back to home...
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

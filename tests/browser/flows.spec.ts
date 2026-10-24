import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, user: string) {
  await page.route("https://discord.com/oauth2/authorize?**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 302,
      headers: {
        location: `${url.searchParams.get("redirect_uri")}?code=${user}&state=${url.searchParams.get("state")}`,
      },
    });
  });
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByText("Logged in with Discord")).toBeVisible();
  const cookie = (await page.context().cookies()).find((c) => c.name === "glimpse_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("glimpse_session");
}

test("Discord login, table invite, refresh, private guesses, scoring, leaderboard and logout", async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const playerContext = await browser.newContext();
  const host = await hostContext.newPage();
  const player = await playerContext.newPage();
  const errors: string[] = [];
  host.on("pageerror", (e) => errors.push(e.message));
  player.on("pageerror", (e) => errors.push(e.message));
  await host.goto("/");
  await host.getByPlaceholder("Your name (Host)...").fill("Host");
  await host.getByRole("button", { name: "Create Table", exact: true }).click();
  await expect(host.getByText("Operator Console")).toBeVisible();
  const invite = host.url();
  await player.goto(invite);
  await login(player, "Alice");
  expect(player.url()).toBe(invite);
  await player.getByPlaceholder("Your name...", { exact: true }).fill("Alice");
  await player.getByRole("button", { name: "Join Table", exact: true }).click();
  await expect(player.getByRole("button", { name: "Leave Table" })).toBeVisible();
  await expect(player.getByText("Operator Console")).toHaveCount(0);
  await player.reload();
  await expect(player.getByRole("button", { name: "Leave Table" })).toBeVisible();
  const originalSeat = await player.evaluate(() => sessionStorage.getItem("glimpse_playerId"));
  const reopened = await playerContext.newPage();
  await reopened.goto(invite);
  await reopened.getByPlaceholder("Your name...", { exact: true }).fill("Alice");
  await reopened.getByRole("button", { name: "Join Table", exact: true }).click();
  await expect(reopened.getByRole("button", { name: "Leave Table" })).toBeVisible();
  expect(await reopened.evaluate(() => sessionStorage.getItem("glimpse_playerId"))).toBe(
    originalSeat,
  );
  await reopened.close();
  await host.getByRole("button", { name: /THE SHAWSHANK REDEMPTION/ }).click();
  await host.getByRole("spinbutton").nth(1).fill("120");
  await host.getByRole("spinbutton").nth(2).fill("60");
  const configureRequest = host.waitForRequest(
    (r) => r.method() === "POST" && !!r.postData()?.includes("configure_routine"),
  );
  await host.getByRole("button", { name: "Configure Routine", exact: true }).click();
  const request = await configureRequest;
  const headers = { ...request.headers() };
  delete headers["cookie"];
  const attack = await playerContext.request.post(request.url(), {
    headers,
    data: request.postData()!,
  });
  expect(await attack.text()).toContain("seat is unavailable");
  await host.getByRole("button", { name: "Start Routine", exact: true }).click();
  await host.getByRole("button", { name: "Start Anyway", exact: true }).click();
  await expect(player.getByPlaceholder("Type your guess...")).toBeEnabled();
  await player.getByPlaceholder("Type your guess...").fill("Shawshank Redemption");
  await player.getByRole("button", { name: /Lock In/i }).click();
  await expect(host.getByText("Guesses — Judge & Award Points")).toBeVisible();
  await host.getByRole("button", { name: "+100", exact: true }).first().click();
  await host.getByRole("button", { name: /Overrides/ }).click();
  await host.getByRole("button", { name: "Skip Phase" }).click();
  await expect(host.getByRole("button", { name: "Finish Game & Save Scores" })).toBeEnabled();
  await host.getByRole("button", { name: "Finish Game & Save Scores" }).click();
  await expect(host.getByRole("button", { name: "New Game" })).toBeVisible();
  await player.goto("/leaderboard");
  await expect(player.getByRole("cell", { name: /Alice/ })).toBeVisible();
  await expect(player.getByRole("row").filter({ hasText: "Alice" })).toContainText("100");
  await player.goto(invite);
  await player.getByRole("button", { name: "Leave Table" }).click();
  await player.getByRole("button", { name: "Logout" }).click();
  await expect(player.getByRole("button", { name: "Login", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  await hostContext.close();
  await playerContext.close();
});

test("invalid invite is recoverable and OAuth rejects mismatched state", async ({ page }) => {
  await page.goto("/?table=NOTREAL");
  await page.getByPlaceholder("Your name...", { exact: true }).fill("Visitor");
  await page.getByRole("button", { name: "Join Table", exact: true }).click();
  await expect(page.getByText("Table not found. Check the code.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("button", { name: "Create Table" })).toBeVisible();
  await page.goto("/auth/discord/callback?code=attacker&state=wrong");
  await expect(page.getByText("Failed to complete Discord login. Please try again.")).toBeVisible();
  expect((await page.context().cookies()).some((c) => c.name === "glimpse_session")).toBe(false);
});

test("host, player and stage play the same bounded hosted clip and pause together", async ({
  browser,
}) => {
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [host, player, stage] = await Promise.all(contexts.map((c) => c.newPage()));
  await host!.goto("/");
  const bytes = await host!.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d")!;
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks));
    });
    recorder.start();
    const timer = setInterval(() => {
      ctx.fillStyle = "#5533aa";
      ctx.fillRect(0, 0, 160, 90);
      ctx.fillStyle = "white";
      ctx.fillText(String(Date.now()), 5, 40);
    }, 80);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    recorder.stop();
    clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    return [...new Uint8Array(await (await done).arrayBuffer())];
  });
  for (const context of contexts)
    await context.route("**/test-video.webm", (route) =>
      route.fulfill({ contentType: "video/webm", body: Buffer.from(bytes) }),
    );
  await host!.getByPlaceholder("Your name (Host)...").fill("Video Host");
  await host!.getByRole("button", { name: "Create Table", exact: true }).click();
  await expect(host!.getByText("Operator Console")).toBeVisible();
  const invite = host!.url();
  await player!.goto(invite);
  await player!.getByPlaceholder("Your name...", { exact: true }).fill("Video Player");
  await player!.getByRole("button", { name: "Join Table", exact: true }).click();
  await expect(player!.getByRole("button", { name: "Leave Table" })).toBeVisible();
  await stage!.goto(invite.replace("/?", "/stage?"));
  await host!.getByRole("button", { name: /Glimpse Management/i }).click();
  await host!
    .getByPlaceholder("https://example.com/clip.mp4")
    .fill("http://localhost:3091/test-video.webm");
  await host!.getByPlaceholder("Title", { exact: true }).fill("TEST VIDEO");
  await host!.getByRole("button", { name: "Add Hosted Video", exact: true }).click();
  await host!.getByRole("button", { name: /TEST VIDEO.*Other/ }).click();
  await host!.getByRole("button", { name: "Configure Routine", exact: true }).click();
  await host!.getByRole("button", { name: "Start Routine", exact: true }).click();
  await expect(player!.getByPlaceholder("Type your guess...")).toBeEnabled({ timeout: 20000 });
  for (const page of [player!, stage!]) {
    await expect(page.getByRole("group", { name: "Puzzle title board" })).toBeVisible();
    await expect(page.locator('.puzzle-board [aria-label="Hidden letter"]')).toHaveCount(9);
    expect(await page.locator(".puzzle-board .tile-back").allTextContents()).not.toContain("T");
  }
  await host!.getByRole("button", { name: "Give Hint", exact: true }).click();
  for (const page of [player!, stage!])
    await expect(page.locator(".puzzle-board .tile-flipped")).toHaveCount(1);
  for (const page of [host!, player!, stage!]) {
    const enable = page.getByRole("button", { name: "Tap to enable video and sound" });
    if (await enable.isVisible()) await enable.click();
    await expect
      .poll(() => page.locator("video").evaluate((v: HTMLVideoElement) => !v.paused))
      .toBe(true);
    await expect
      .poll(() => page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeLessThan(1.3);
  }
  await host!.getByRole("button", { name: "Pause", exact: true }).click();
  for (const page of [host!, player!, stage!])
    await expect
      .poll(() => page.locator("video").evaluate((v: HTMLVideoElement) => v.paused))
      .toBe(true);
  await player!.setViewportSize({ width: 320, height: 800 });
  expect(await player!.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    320,
  );
  await host!.getByRole("button", { name: "Resume", exact: true }).click();
  await host!.getByRole("button", { name: /Overrides/ }).click();
  await host!.getByRole("button", { name: "Skip Phase", exact: true }).click();
  await host!.getByRole("button", { name: "Skip Phase", exact: true }).click();
  for (const page of [player!, stage!]) {
    await expect(page.locator(".puzzle-board .tile-flipped")).toHaveCount(9);
    expect((await page.locator(".puzzle-board .tile-back").allTextContents()).join("")).toBe(
      "TESTVIDEO",
    );
    await expect(page.locator("video")).toHaveCount(0);
  }
  for (const page of [player!, stage!])
    await expect
      .poll(() =>
        page
          .locator(".puzzle-board .tile-flipped")
          .evaluateAll(
            (tiles) =>
              tiles.filter(
                (el) =>
                  getComputedStyle(el).transform !==
                  "matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)",
              ).length,
          ),
      )
      .toBe(0);
  await player!.screenshot({ path: "audit-player.png", fullPage: true });
  await stage!.screenshot({ path: "audit-stage.png", fullPage: true });
  await Promise.all(contexts.map((c) => c.close()));
});

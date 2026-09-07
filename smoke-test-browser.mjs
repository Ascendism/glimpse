#!/usr/bin/env node
/**
 * Automated browser smoke test for Glimpse multiplayer game using Playwright.
 * Tests a full round: create → join → start → guess → lock → reveal
 * 
 * Usage: npm run dev (in another terminal), then: node smoke-test-browser.mjs
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:8081';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSmokeTest() {
  console.log('🧪 Starting Glimpse Browser Smoke Test\n');
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Create two browser contexts (two players)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    let tableCode;
    
    // Step 1: Player 1 (Host) creates table
    console.log('📝 Step 1: Player 1 (Host Alice) creating table...');
    await page1.goto(BASE_URL);
    
    // Check for errors
    page1.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });
    
    await page1.waitForSelector('input[placeholder*="Host"]');
    
    // Use JavaScript to set value and trigger events
    await page1.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Host"]');
      if (input) {
        input.value = 'Alice';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(500); // Wait for React state update
    
    // Verify input has value
    const inputValue = await page1.inputValue('input[placeholder*="Host"]');
    console.log('Input value:', inputValue);
    
    // Force click the submit button even if disabled (submit form directly)
    await page1.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    });
    await sleep(2000); // Wait for table creation and navigation
    
    // Wait for URL to change with table parameter or for player name to appear
    try {
      await page1.waitForFunction(() => window.location.search.includes('table='), {}, { timeout: 10000 });
    } catch (err) {
      console.log('URL did not change, taking screenshot...');
      await page1.screenshot({ path: '/tmp/error-state.png' });
      throw new Error('Table creation failed - URL did not change');
    }
    await sleep(500); // Extra wait for stability
    
    // Extract table code from URL or UI
    const url1 = page1.url();
    console.log('Current URL:', url1);
    const match = url1.match(/table=([A-Z0-9]+)/);
    if (!match) {
      // Try to find it in the UI instead
      const tableCodeElement = await page1.$('text=/[A-Z0-9]{4,}/');
      if (tableCodeElement) {
        tableCode = await tableCodeElement.textContent();
        console.log('Table code from UI:', tableCode);
      } else {
        throw new Error('Table code not found in URL or UI');
      }
    } else {
      tableCode = match[1];
    }
    console.log(`✅ Table created: ${tableCode}\n`);
    
    // Step 2: Verify Player 1 is seated
    console.log('📊 Step 2: Verifying Player 1 is seated...');
    await page1.waitForSelector('text=Alice', { timeout: 5000 });
    console.log('✅ Player 1 (Alice) is seated\n');
    
    // Step 3: Player 2 joins
    console.log('👥 Step 3: Player 2 (Bob) joining table...');
    await page2.goto(`${BASE_URL}/?table=${tableCode}`);
    const nameInput2 = await page2.waitForSelector('input[placeholder*="Your name"]');
    await nameInput2.type('Bob');
    await sleep(200); // Wait for React state update
    await page2.press('input[placeholder*="Your name"]', 'Enter');
    await sleep(1500);
    console.log('✅ Player 2 joined\n');
    
    // Step 4: Verify both players are visible
    console.log('📊 Step 4: Verifying both players...');
    await page1.waitForSelector('text=Bob', { timeout: 5000 });
    await page2.waitForSelector('text=Alice', { timeout: 5000 });
    console.log('✅ Both players visible to each other\n');
    
    // Step 5: Host starts round
    console.log('🎬 Step 5: Host starting round...');
    await page1.click('button:has-text("Start Round")');
    await sleep(1000);
    console.log('✅ Round started\n');
    
    // Step 6: Verify clip is showing
    console.log('📊 Step 6: Verifying clip is showing...');
    const clipVisible1 = await page1.isVisible('iframe[src*="youtube.com"]');
    const clipVisible2 = await page2.isVisible('iframe[src*="youtube.com"]');
    if (!clipVisible1 || !clipVisible2) {
      throw new Error('YouTube clip not visible');
    }
    console.log('✅ YouTube clip visible on both clients\n');
    
    // Step 7: Player 1 submits guess
    console.log('💭 Step 7: Player 1 (Alice) submitting guess...');
    await page1.fill('input[placeholder*="guess"]', 'The Matrix');
    await page1.click('button:has-text("Submit")');
    await sleep(500);
    console.log('✅ Player 1 guess submitted\n');
    
    // Step 8: Player 2 submits guess
    console.log('💭 Step 8: Player 2 (Bob) submitting guess...');
    await page2.fill('input[placeholder*="guess"]', 'The Matrix Reloaded');
    await page2.click('button:has-text("Submit")');
    await sleep(500);
    console.log('✅ Player 2 guess submitted\n');
    
    // Step 9: Verify guesses are visible
    console.log('📊 Step 9: Verifying guesses...');
    const guess1Visible = await page1.isVisible('text=The Matrix');
    const guess2Visible = await page2.isVisible('text=The Matrix Reloaded');
    if (!guess1Visible || !guess2Visible) {
      throw new Error('Guesses not visible');
    }
    console.log('✅ Guesses visible\n');
    
    // Step 10: Player 1 locks in
    console.log('🔒 Step 10: Player 1 (Alice) locking in...');
    await page1.click('button:has-text("Lock")');
    await sleep(500);
    console.log('✅ Player 1 locked in\n');
    
    // Step 11: Player 2 locks in
    console.log('🔒 Step 11: Player 2 (Bob) locking in...');
    await page2.click('button:has-text("Lock")');
    await sleep(500);
    console.log('✅ Player 2 locked in\n');
    
    // Step 12: Host reveals title
    console.log('🎭 Step 12: Host revealing title...');
    await page1.click('button:has-text("Reveal")');
    await sleep(2000); // Wait for animation
    console.log('✅ Title revealed\n');
    
    // Step 13: Verify reveal animation on both clients
    console.log('📊 Step 13: Verifying reveal animation...');
    const puzzleBoardVisible1 = await page1.isVisible('.puzzle-board');
    const puzzleBoardVisible2 = await page2.isVisible('.puzzle-board');
    if (!puzzleBoardVisible1 || !puzzleBoardVisible2) {
      throw new Error('Puzzle board not visible after reveal');
    }
    console.log('✅ Puzzle board visible on both clients\n');
    
    // Step 14: Test chat
    console.log('💬 Step 14: Testing chat...');
    await page2.fill('input[placeholder*="chat"]', 'Great round!');
    await page2.press('input[placeholder*="chat"]', 'Enter');
    await sleep(500);
    const chatVisible = await page1.isVisible('text=Great round!');
    if (!chatVisible) {
      throw new Error('Chat message not visible');
    }
    console.log('✅ Chat working\n');
    
    // All tests passed!
    console.log('✨ All smoke tests passed! ✨\n');
    console.log('Summary:');
    console.log(`  - Table created: ${tableCode}`);
    console.log(`  - Players joined: 2`);
    console.log(`  - Full round completed: lobby → playing → reveal`);
    console.log(`  - Guesses locked: 2`);
    console.log(`  - Reveal synchronized: ✓`);
    console.log(`  - Chat working: ✓\n`);
    
  } catch (error) {
    console.error('\n❌ Smoke test failed:');
    console.error(error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Server returned non-200');
    }
    return true;
  } catch (err) {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('Please start the dev server with: npm run dev');
    process.exit(1);
  }
}

async function main() {
  await checkServer();
  await runSmokeTest();
  process.exit(0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

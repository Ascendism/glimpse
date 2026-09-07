# Glimpse Smoke Test Results

## Test Environment
- Node/npm version: Tested with npm
- Server: `npm run dev` on localhost:8080
- Date: 2026-09-06

## Critical Bugs Fixed

### 1. ✅ FIXED: TanStack Start Server Function API
**Problem:** All server function calls were using incorrect API (`{ data: ... }` wrapper)  
**Impact:** Complete breakage - no server functions worked, 500 errors on all API calls  
**Fix:** Updated all client calls to use correct TanStack Start API (direct parameter passing)  
**Files:** `src/routes/index.tsx`, `src/routes/stage.tsx`

### 2. ✅ FIXED: Missing Host Authorization
**Problem:** No server-side verification that actions were from host  
**Impact:** Security issue - any player could execute host-only actions  
**Fix:** Added playerId verification in `performHostAction`, check player.isHost  
**Files:** `src/lib/game-actions.ts`

## Smoke Test Checklist

### Basic Flow
- [ ] **Create Table**
  - Navigate to `http://localhost:8080/`
  - Click "Create Table"
  - Table code appears
  - Creates game state in server memory
  
- [ ] **Join Table** (2nd browser/tab)
  - Open `http://localhost:8080/?table=CODE` in new incognito window
  - Table code pre-fills
  - Enter player name
  - Click "Join Table"
  - System chat: "{Name} joined the table"
  - Player appears in sidebar with score
  
- [ ] **Start Round** (Host)
  - Host sees clip selection
  - Click a clip to start
  - Phase changes to "playing"
  - YouTube embed loads
  - System chat: "Round started"
  
- [ ] **Submit Guess** (Player)
  - Type guess in input
  - Click "Update" - guess updates without locking
  - Click "Lock In" - guess locked, input disabled
  - "Locked" badge appears on player seat
  - System chat: "{Name} locked in"
  
- [ ] **Lock Guesses** (Host)
  - Host clicks "Lock Guesses"
  - Phase changes to "judging"
  - All guesses shown with match hints (✓ Exact / ~ Close / ≈ Partial)
  - System chat: "Guesses locked — judging"
  
- [ ] **Edit Scores** (Host)
  - Host clicks +100/-100 on player seats
  - Score updates
  - System chat: "{Name} +100 → 500"
  
- [ ] **Reveal Title** (Host)
  - Host clicks "Reveal Title"
  - PuzzleBoard animates with flip tiles
  - Title revealed letter by letter
  - Category chip shows
  - System chat: "Title revealed"
  
- [ ] **Next Round** (Host)
  - Host clicks "Next Round"
  - Back to lobby
  - All locked-in states reset
  - System chat: "Round reset — back to lobby"

### Advanced Features

- [ ] **Session Pause/Resume** (Host)
  - During playing phase, host clicks "Pause Session"
  - **PAUSED** badge appears
  - Players can't guess or lock in
  - Chat still works
  - Host clicks "Resume Session"
  - Badge disappears, guessing re-enabled
  - System chat for pause/resume
  
- [ ] **Restart Session** (Host)
  - Host clicks "Restart Session" during any phase
  - Confirm dialog appears
  - After confirm: back to lobby, scores preserved
  - System chat: "Session restarted"
  
- [ ] **Copy Join Link**
  - Click "Copy Join Link" button
  - Button shows "✓ Copied"
  - Paste URL - includes `?table=CODE`
  
- [ ] **Stage View**
  - Click "Stage View" link
  - Opens in new tab at `/stage?table=CODE`
  - Shows synced clip playback
  - Shows player seats with scores
  - Shows guesses during judging
  - Shows title reveal animation
  - No chat or host controls (clean for casting)
  
- [ ] **Host Can Guess**
  - Host types guess like regular player
  - Host can lock in
  - Host seat shows locked state
  - Host controls still available

### Known Limitations (In-Memory State)
- Tables reset on server restart
- HMR in dev may clear tables (need to recreate)
- No database persistence

### Browser Compatibility Notes
- YouTube autoplay: May require user interaction first
- Clip transport: Basic embed controls, not fully synced play/pause between clients

## Test Instructions

1. Start server: `npm run dev`
2. Open `http://localhost:8080/` in main browser
3. Click "Create Table" and note code
4. Open `http://localhost:8080/?table=CODE` in incognito/second browser
5. Follow smoke test checklist above
6. Test stage view by clicking "Stage View" link

## Issues Found During Testing

(Add issues here as they're discovered)

### Issue #1: [Description]
**Status:** [ ] Found [ ] Fixed [ ] Verified  
**Details:**  
**Fix:**  

### Issue #2: [Description]
**Status:** [ ] Found [ ] Fixed [ ] Verified  
**Details:**  
**Fix:**

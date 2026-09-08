# Known Issues & Future Enhancements

## Minor Issues (Non-Blocking)

### Input Field Text Display
**Severity**: Low  
**Status**: Documented  
**Description**: Text input fields occasionally don't render typed characters immediately. Workaround: click away or triple-click the field to force refresh.  
**Root Cause**: React controlled input rendering edge case  
**Impact**: Minor UX friction in library management forms  
**Fix Priority**: P2 (polish)

### Console Warnings
**Severity**: Low  
**Status**: External library deprecations  
**Description**: 
- Video.js deprecation warnings (createTimeRange)
- YouTube player DOM attachment warnings
- Cropmix/Hls.js HEVC fallback deprecation
- Minor useEffect dependency array warnings

**Impact**: Console noise only, no functional impact  
**Fix Priority**: P3 (when updating Video.js)

## Architectural Limitations (By Design)

### In-Memory State Storage
**Current**: File-backed Map in tmpdir (`/tmp/glimpse-dev-state/tables.json`)  
**Limitation**: State persists only within single server instance  
**Future**: Migrate to Redis/Postgres for production multi-instance deployment  
**Documented in**: `src/lib/game-state.ts` lines 92-140

### Polling-Based State Sync
**Current**: Client polls `/api/table/{id}/state` every 1 second  
**Limitation**: 1-2s latency for state updates  
**Future**: WebSocket/SSE for sub-second real-time sync  
**Documented in**: `src/routes/index.tsx` line 172, `src/routes/stage.tsx` line 106

### Upload Object URLs
**Current**: Browser memory-based blob URLs  
**Limitation**: Won't persist across tabs/reloads  
**Future**: Implement upload-to-CDN flow  
**Warning Added**: Yellow caveat box in UI (Iteration 10)

## Feature Backlog (Post-v1.0)

### "Close Enough" Fuzzy Matching
**Status**: Helper implemented, not integrated in judging UI  
**Current**: `getMatchHint()` provides ✓/~/≈ scoring hints  
**Future**: Add fuzzy string matching library (Levenshtein distance)  
**Impact**: Reduces host judging burden for spelling variants

### Escalating Hint Costs
**Status**: Design idea  
**Proposal**: First hint = 1 letter, second = 2, third = 3  
**Impact**: Adds strategic depth to hint voting

### Performance Optimization
**Status**: Not profiled under load  
**Future**: 
- Load testing with 10+ concurrent tables
- React.memo optimization passes
- Bundle code-splitting for Video.js

### Accessibility
**Status**: Basic semantic HTML, needs audit  
**Future**: 
- ARIA labels for game state
- Keyboard navigation for puzzle board
- Screen reader announcements for phase changes

## Test Coverage Gaps

Based on [computer-use agent smoke test](bc-694cb6da-86b9-5e09-944a-aa0b021ae87b):
- ❌ Segment vote thresholds (advance/hint)
- ❌ Hint letter reveals during gameplay
- ❌ Judging UI with multiple guesses
- ❌ Score editing persistence
- ❌ Multi-player voting coordination
- ❌ Upload clip full flow

**Recommendation**: Integration test suite covering these flows before production.

---

**Document Version**: Iteration 10 (Final)  
**Last Updated**: 2026-09-08  
**Status**: Ready for v1.0 launch with documented caveats

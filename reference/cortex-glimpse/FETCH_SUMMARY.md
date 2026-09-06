# Glimpse Test and Script Files - Fetch Summary

**Date:** 2026-09-06  
**Source:** CarapaceUDE/cortex (main branch)  
**Destination:** /workspace/reference/cortex-glimpse/

## Summary

Successfully fetched and added 20 files (16 test files + 4 script files) from the CarapaceUDE/cortex repository to the reference copy.

## Test Files (16 files)

All files written to: `/workspace/reference/cortex-glimpse/test/`

| File | SHA | Size |
|------|-----|------|
| glimpse-board.test.js | 9f51122c7a389a160dc7ea1763cce34953fbdfa5 | ~2.4 KB |
| glimpse-clip-materialize.test.js | b467572c0ad9f7accd6ac9ce060b75a1d6247173 | ~4.6 KB |
| glimpse-clock.test.js | 33a1b14c9236ea4e7f8730ef504cd1ad281a2ba6 | ~1.7 KB |
| glimpse-dead-clip-filter.test.js | 8529c941b795b3bd7253a96278a43f3d2b8bad7c | ~3.2 KB |
| glimpse-engine.test.js | 7032640eca4f7e0fab59986bfb253fed6d72df24 | ~16.8 KB |
| glimpse-host-ui.test.js | 60c3a40b5ca47396899e9da1630a99fe66dc8c30 | ~2.8 KB |
| glimpse-http.test.js | 593981fd3d7f4c48c1cb5958b994cf19ca877610 | ~5.5 KB |
| glimpse-hunt.test.js | c14b84c6449a42aa47ea634660883e6c8ec22172 | ~5.8 KB |
| glimpse-identity.test.js | a4e3515dfe879f2206b2fe03dcce3baddadfc03e | ~4.8 KB |
| glimpse-join-hosts.test.js | 0636fbc2e834ddcc634173b069bf8477319a644b | ~0.4 KB |
| glimpse-member-management.test.js | 64659864556ca35f6bdb60761ee694242d0f2136 | ~7.0 KB |
| glimpse-onair.test.js | 9ef1fd3cc4ac35242b52aad252fd187c1c813800 | ~0.9 KB |
| glimpse-player-ui.test.js | dee69e75840e2dea53e24cf7a6057921022ba22a | ~0.6 KB |
| glimpse-skill-slash.test.js | 7516524f9178f73659aac6921ab1e66517d50676 | ~1.4 KB |
| glimpse-sync.test.js | d38901a705698359c7a48bf4109cc735ab8c78d5 | ~5.6 KB |
| glimpse-youtube-validation.test.js | cbcb73bba3f4ee10b68c226e62cb762784ec30a2 | ~1.7 KB |

## Script Files (4 files)

All files written to: `/workspace/reference/cortex-glimpse/scripts/`

| File | SHA | Size |
|------|-----|------|
| clean-glimpse-seed.js | c4fb25915ce7eab25b58a0c190fe7694cc70ae06 | ~2.0 KB |
| glimpse-catalog-health.js | 5cfbfb8fa75ae29949bcc03325523bdfbb7bc829 | ~2.8 KB |
| glimpse-dogfood.js | b9cfe7a7efa7e770809c7f88b5328c30a5be7e86 | ~3.5 KB |
| glimpse-live-server.js | 9e8152e7fc4a1f4771582c6fa2915480adc2b8b1 | ~0.7 KB |

## Test Coverage

The test files cover the following Glimpse subsystems:

1. **Board State** - Title layout, reveal mechanics, letter display
2. **Clip Materialization** - Host clip processing, media serving
3. **Round Clock** - Timing, synchronization, playback scheduling
4. **Dead Clip Filtering** - YouTube validation, blacklist management
5. **Engine** (comprehensive) - Normalization, catalog, matching, judging, scoring, clips, knowledge, curator, room service
6. **Host UI** - Control room interactions, queue management
7. **HTTP** - Guest join, API endpoints, routing
8. **Hunt** - Content discovery, YouTube search, live catalog
9. **Identity** - Discord auth, chat, session management
10. **Join Hosts** - Tailscale detection, network reachability
11. **Member Management** - Kick, promote, host transfer
12. **On-Air Copy** - Reveal presentation, agent copy interpretation
13. **Player UI** - Volume control, YouTube masking
14. **Skill Slash** - Skill pack loading, trigger registration
15. **Video Sync** - Playback synchronization, drift correction
16. **YouTube Validation** - ID validation, embeddability checks

## Script Utilities

The scripts provide the following functionality:

1. **clean-glimpse-seed.js** - Deduplicates and validates seed pack data
2. **glimpse-catalog-health.js** - Validates YouTube video embeddability with --validate and --fix modes
3. **glimpse-dogfood.js** - Automated Playwright testing for end-to-end validation
4. **glimpse-live-server.js** - Standalone Glimpse server for development/testing

## Verification

All files have been successfully written to the reference directory and are ready for use. The files maintain their original structure and content from the source repository.

## Next Steps

These files complement the existing Glimpse reference copy and provide:
- Comprehensive test coverage for validation and regression testing
- Utility scripts for catalog maintenance and health checks
- Documentation of expected behavior through test assertions

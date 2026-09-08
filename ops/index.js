/**
 * Glimpse Ops - Centralized agent-driveable operations
 * 
 * This module provides a single implementation path for all Cortex/MCP operations.
 * It wraps the existing game-state.ts module to expose multiplayer game functionality
 * to agents in a structured way.
 * 
 * @module glimpse/ops
 */

/**
 * Create ops context with runtime environment
 * @param {Object} ctx - Runtime context
 * @param {Object} ctx.logger - Logger instance
 * @param {Object} ctx.permissions - Granted permissions
 * @param {string} ctx.workspacePath - Path to workspace (optional)
 * @returns {Object} Ops interface
 */
export function createOps(ctx = {}) {
  const logger = ctx.logger || console;
  
  // Dynamic import of game state module (ESM compatibility)
  let gameState;
  
  async function ensureGameState() {
    if (!gameState) {
      try {
        // Try to import the TypeScript module (works if tsx/ts-node available)
        gameState = await import('../src/lib/game-state.js');
      } catch (err) {
        logger.warn('Could not load game-state module:', err.message);
        throw new Error('Game state module not available. Run npm install and build first.');
      }
    }
    return gameState;
  }

  return {
    /**
     * TABLE OPERATIONS
     */
    'glimpse.table.create': async () => {
      const gs = await ensureGameState();
      const tableId = gs.createTable();
      
      logger.info(`Created table: ${tableId}`);
      
      return {
        tableId,
        status: 'created',
        joinUrl: `Use this code to join: ${tableId}`
      };
    },

    'glimpse.table.inspect': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const table = gs.getTable(tableId);
      
      if (!table) {
        throw new Error(`Table not found: ${tableId}`);
      }
      
      return table;
    },

    'glimpse.table.list': async () => {
      const gs = await ensureGameState();
      
      // Access internal tables map (Note: this requires exposing it or using a getter)
      // For now, return empty array with a note that this requires implementation
      logger.warn('glimpse.table.list: Full table listing requires exposing internal state');
      
      return {
        tables: [],
        note: 'Table listing requires direct access to internal state. Use glimpse.table.inspect with known table IDs.'
      };
    },

    /**
     * LIBRARY OPERATIONS
     */
    'glimpse.library.list': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const table = gs.getTable(tableId);
      
      if (!table) {
        throw new Error(`Table not found: ${tableId}`);
      }
      
      return {
        clips: table.library.clips,
        playlists: table.library.playlists
      };
    },

    'glimpse.library.addYoutubeClip': async ({ 
      tableId, 
      title, 
      youtubeId, 
      category, 
      type,
      duration = 60,
      timeStart = 0,
      timeEnd
    }) => {
      if (!tableId || !title || !youtubeId || !category || !type) {
        throw new Error('tableId, title, youtubeId, category, and type are required');
      }
      
      const gs = await ensureGameState();
      
      // Import library helpers
      const library = await import('../src/lib/library.js');
      
      const clip = library.createYouTubeLibraryClip(
        title.toUpperCase(), // Normalize to uppercase like puzzle board
        youtubeId,
        category,
        type,
        duration,
        timeStart,
        timeEnd
      );
      
      const success = gs.addClipToLibrary(tableId, clip);
      
      if (!success) {
        throw new Error('Failed to add clip (table not found or duplicate ID)');
      }
      
      logger.info(`Added YouTube clip to ${tableId}: ${title} (${youtubeId})`);
      
      return {
        success: true,
        clipId: clip.id,
        clip
      };
    },

    'glimpse.library.inspect': async ({ tableId, clipId }) => {
      if (!tableId || !clipId) {
        throw new Error('tableId and clipId required');
      }
      
      const gs = await ensureGameState();
      const table = gs.getTable(tableId);
      
      if (!table) {
        throw new Error(`Table not found: ${tableId}`);
      }
      
      const clip = table.library.clips.find(c => c.id === clipId);
      
      if (!clip) {
        throw new Error(`Clip not found: ${clipId}`);
      }
      
      return clip;
    },

    /**
     * ROUTINE OPERATIONS
     */
    'glimpse.routine.configure': async ({ tableId, config }) => {
      if (!tableId || !config) {
        throw new Error('tableId and config required');
      }
      
      const gs = await ensureGameState();
      const success = gs.configureRoutine(tableId, config);
      
      if (!success) {
        throw new Error('Failed to configure routine (table not found or routine already running)');
      }
      
      logger.info(`Configured routine for ${tableId}: ${config.playlist.length} clips`);
      
      return {
        success: true,
        message: `Routine configured with ${config.playlist.length} clips`
      };
    },

    'glimpse.routine.start': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const success = gs.startRoutine(tableId);
      
      if (!success) {
        throw new Error('Failed to start routine (not configured or already running)');
      }
      
      logger.info(`Started routine for ${tableId}`);
      
      return {
        success: true,
        message: 'Routine started'
      };
    },

    'glimpse.routine.pause': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const success = gs.pauseRoutine(tableId);
      
      if (!success) {
        throw new Error('Failed to pause routine (not running)');
      }
      
      logger.info(`Paused routine for ${tableId}`);
      
      return {
        success: true
      };
    },

    'glimpse.routine.stop': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const success = gs.stopRoutine(tableId);
      
      if (!success) {
        throw new Error('Failed to stop routine (table not found)');
      }
      
      logger.info(`Stopped routine for ${tableId}`);
      
      return {
        success: true
      };
    },

    'glimpse.routine.inspect': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const table = gs.getTable(tableId);
      
      if (!table) {
        throw new Error(`Table not found: ${tableId}`);
      }
      
      if (!table.routine) {
        return {
          configured: false,
          message: 'No routine configured for this table'
        };
      }
      
      return {
        configured: true,
        routine: table.routine
      };
    },

    /**
     * GAME STATE OPERATIONS
     */
    'glimpse.game.getState': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const table = gs.getTable(tableId);
      
      if (!table) {
        throw new Error(`Table not found: ${tableId}`);
      }
      
      // Compact state for polling
      let currentClip = null;
      if (table.currentClipId) {
        currentClip = table.library.clips.find(c => c.id === table.currentClipId);
      }
      
      return {
        phase: table.phase,
        currentClip: currentClip ? {
          id: currentClip.id,
          title: table.revealedTitle ? currentClip.title : '[Hidden]',
          category: currentClip.category,
          type: currentClip.type
        } : null,
        players: table.players.map(p => ({
          id: p.id,
          name: p.name,
          score: p.score,
          isHost: p.isHost,
          lockedIn: p.lockedIn,
          ready: p.ready
        })),
        guessCount: table.guesses.length,
        clipPlaying: table.clipPlaying,
        waitingForReady: table.waitingForReady
      };
    },

    /**
     * HOST OVERRIDE OPERATIONS
     */
    'glimpse.segment.advance': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const success = gs.advanceToNextSegment(tableId);
      
      if (!success) {
        return {
          success: false,
          message: 'Already at maximum segment or no segment ladder active'
        };
      }
      
      const table = gs.getTable(tableId);
      const newDuration = table?.segmentLadder?.segmentDurations[table.segmentLadder.currentSegmentIndex] || 0;
      
      logger.info(`Advanced segment for ${tableId} to ${newDuration}s`);
      
      return {
        success: true,
        newDuration
      };
    },

    'glimpse.hint.give': async ({ tableId }) => {
      if (!tableId) {
        throw new Error('tableId required');
      }
      
      const gs = await ensureGameState();
      const table = gs.getTable(tableId);
      
      if (!table) {
        throw new Error(`Table not found: ${tableId}`);
      }
      
      const beforeCount = table.hintRevealedPositions.length;
      const success = gs.revealHint(tableId);
      
      if (!success) {
        return {
          success: false,
          message: 'No clip loaded or all letters already revealed'
        };
      }
      
      const afterCount = gs.getTable(tableId)?.hintRevealedPositions.length || 0;
      const revealedCount = afterCount - beforeCount;
      
      logger.info(`Revealed ${revealedCount} hint letter(s) for ${tableId}`);
      
      return {
        success: true,
        revealedCount
      };
    }
  };
}

/**
 * Validation helper
 */
function validateOpsContext(ctx) {
  if (!ctx) {
    throw new Error('Ops context required');
  }
  
  // Future: validate permissions, workspace access, etc.
  return true;
}

export default createOps;

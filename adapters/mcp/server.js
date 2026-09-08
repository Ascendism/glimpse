#!/usr/bin/env node

/**
 * Glimpse MCP Server
 * 
 * Model Context Protocol server that exposes Glimpse ops as MCP tools.
 * This is a stub implementation that wires the SAME createOps from ops/index.js.
 * 
 * MCP Spec: https://modelcontextprotocol.io/
 * 
 * @module glimpse/adapters/mcp
 */

import { createOps } from '../../ops/index.js';

/**
 * MCP Server Implementation
 * 
 * This is a minimal stub that demonstrates how to wire Glimpse ops
 * into an MCP server. A full implementation would:
 * 
 * 1. Import @modelcontextprotocol/sdk
 * 2. Create StdioServerTransport
 * 3. Register tools from ops manifest
 * 4. Handle tool calls by invoking ops
 * 5. Stream responses back to client
 * 
 * For now, this stub validates that ops can be loaded in a Node context.
 */

async function main() {
  const logger = {
    info: (...args) => console.error('[MCP INFO]', ...args),
    warn: (...args) => console.error('[MCP WARN]', ...args),
    error: (...args) => console.error('[MCP ERROR]', ...args),
    debug: (...args) => {
      if (process.env.DEBUG) {
        console.error('[MCP DEBUG]', ...args);
      }
    }
  };

  try {
    // Create ops instance
    const ops = createOps({ logger });
    const opNames = Object.keys(ops);
    
    logger.info(`Glimpse MCP Server stub loaded with ${opNames.length} ops`);
    logger.info('Ops available:', opNames.join(', '));
    
    // Full MCP server implementation would:
    // 1. Set up stdio transport
    // 2. Register each op as an MCP tool with schema from tools.manifest.json
    // 3. Handle incoming tool_call requests
    // 4. Invoke corresponding op and return result
    
    logger.warn('This is a stub MCP server. Full MCP protocol implementation pending.');
    logger.info('To use Glimpse ops, call them directly from ops/index.js or via Cortex adapter.');
    
    // For stub purposes, demonstrate that we can call an op
    if (process.argv.includes('--test')) {
      logger.info('\nTesting glimpse.table.create...');
      const result = await ops['glimpse.table.create']();
      logger.info('Result:', JSON.stringify(result, null, 2));
    } else {
      logger.info('\nTo test ops, run with --test flag');
      logger.info('Example: node adapters/mcp/server.js --test');
    }
    
  } catch (err) {
    logger.error('Failed to initialize MCP server:', err);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { main };

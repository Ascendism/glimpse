#!/usr/bin/env node

/**
 * Glimpse MCP Server
 *
 * Model Context Protocol adapter that exposes Glimpse ops as MCP tools.
 * Host mcpBridge expects createOps() → array of { name, description, inputSchema, handler }.
 *
 * MCP Spec: https://modelcontextprotocol.io/
 *
 * @module glimpse/adapters/mcp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOps as createOpsMap } from '../../ops/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadToolsManifest() {
  const manifestPath = path.join(__dirname, '..', '..', 'tools.manifest.json');
  try {
    if (!fs.existsSync(manifestPath)) return null;
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Convert tools.manifest.json parameter map (with required flags) into JSON Schema.
 */
function parametersToInputSchema(parameters) {
  if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
    return { type: 'object', properties: {}, required: [] };
  }

  const properties = {};
  const required = [];

  for (const [key, raw] of Object.entries(parameters)) {
    if (!raw || typeof raw !== 'object') {
      properties[key] = { type: 'string' };
      continue;
    }
    const { required: isRequired, default: defaultValue, ...rest } = raw;
    const prop = { ...rest };
    if (defaultValue !== undefined) prop.default = defaultValue;
    properties[key] = prop;
    if (isRequired === true) required.push(key);
  }

  return { type: 'object', properties, required };
}

function metaForName(manifest, name) {
  if (!manifest || typeof manifest !== 'object') return null;
  const list = Array.isArray(manifest.tools)
    ? manifest.tools
    : Array.isArray(manifest.ops)
      ? manifest.ops
      : [];
  return list.find((t) => t && t.name === name) || null;
}

/**
 * Host contract: return array of { name, description, inputSchema, handler }.
 * @param {object} [ctx]
 * @returns {Array<{name: string, description: string, inputSchema: object, handler: Function}>}
 */
export function createOps(ctx = {}) {
  const opsMap = createOpsMap(ctx);
  const manifest = loadToolsManifest();

  return Object.keys(opsMap).map((name) => {
    const meta = metaForName(manifest, name) || {};
    const inputSchema =
      meta.inputSchema ||
      parametersToInputSchema(meta.parameters) ||
      { type: 'object', properties: {}, required: [] };

    return {
      name,
      description: meta.description || `${name} from cortex.glimpse`,
      inputSchema,
      handler: async (args) => opsMap[name](args || {})
    };
  });
}

/**
 * MCP Server stub — validates that ops can be loaded in a Node context.
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
    const tools = createOps({ logger });
    const opNames = tools.map((t) => t.name);

    logger.info(`Glimpse MCP Server stub loaded with ${opNames.length} ops`);
    logger.info('Ops available:', opNames.join(', '));
    logger.warn('This is a stub MCP server. Full MCP protocol implementation pending.');
    logger.info('Host mcpBridge uses createOps() export; call ops via Cortex adapter.');

    if (process.argv.includes('--test')) {
      logger.info('\nTesting glimpse.table.create...');
      const createTool = tools.find((t) => t.name === 'glimpse.table.create');
      const result = await createTool.handler({});
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

const isDirect =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isDirect) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { main };
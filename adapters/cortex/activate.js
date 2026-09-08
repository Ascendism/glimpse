/**
 * Glimpse Cortex Adapter
 * 
 * Activates Glimpse package in Cortex environment by registering ops
 * from the centralized ops module.
 * 
 * @module glimpse/adapters/cortex
 */

import { createOps } from '../../ops/index.js';

/**
 * Activate Glimpse package in Cortex
 * @param {Object} cortexContext - Cortex runtime context
 * @param {Object} cortexContext.registerOps - Function to register ops
 * @param {Object} cortexContext.logger - Cortex logger
 * @param {Object} cortexContext.permissions - Granted permissions
 * @param {string} cortexContext.workspacePath - Workspace path
 * @returns {Promise<Object>} Activation result
 */
export async function activate(cortexContext) {
  const { registerOps, logger } = cortexContext;
  
  if (!registerOps) {
    throw new Error('Cortex context must provide registerOps function');
  }
  
  logger.info('Activating Glimpse package...');
  
  // Create ops using centralized implementation
  const ops = createOps({
    logger: logger,
    permissions: cortexContext.permissions,
    workspacePath: cortexContext.workspacePath
  });
  
  // Register all ops with Cortex
  const opNames = Object.keys(ops);
  
  for (const opName of opNames) {
    registerOps(opName, ops[opName]);
    logger.debug(`Registered op: ${opName}`);
  }
  
  logger.info(`Glimpse activated: ${opNames.length} ops registered`);
  
  return {
    success: true,
    opsRegistered: opNames.length,
    ops: opNames
  };
}

/**
 * Deactivate Glimpse package in Cortex
 * @param {Object} cortexContext - Cortex runtime context
 * @returns {Promise<Object>} Deactivation result
 */
export async function deactivate(cortexContext) {
  const { logger } = cortexContext;
  
  logger.info('Deactivating Glimpse package...');
  
  // Cleanup if needed (currently no persistent resources to clean up)
  // In the future: close file handles, disconnect from services, etc.
  
  logger.info('Glimpse deactivated');
  
  return {
    success: true
  };
}

export default { activate, deactivate };

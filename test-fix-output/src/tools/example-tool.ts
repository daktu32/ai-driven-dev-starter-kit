/**
 * Example Tool for test-fix
 * Demonstrates basic MCP tool implementation
 */

import { logger } from '../utils/logger.js';

export interface ExampleToolArgs {
  message: string;
}

export async function exampleTool(args: ExampleToolArgs) {
  logger.info(`Example tool called with message: ${args.message}`);

  // Example processing
  const processedMessage = `Processed: ${args.message.toUpperCase()}`;

  return {
    content: [
      {
        type: 'text',
        text: processedMessage,
      },
    ],
  };
}
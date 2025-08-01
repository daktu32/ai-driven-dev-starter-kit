/**
 * Example Resource for test-fix
 * Demonstrates basic MCP resource implementation
 */

import { logger } from '../utils/logger.js';

export interface ExampleResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export class ExampleResourceProvider {
  private resources: ExampleResource[] = [
    {
      uri: 'example://resource/1',
      name: 'Example Resource 1',
      description: 'First example resource for test-fix',
      mimeType: 'text/plain',
    },
  ];

  async listResources(): Promise<ExampleResource[]> {
    logger.info('Listing available resources');
    return this.resources;
  }

  async getResource(uri: string): Promise<string> {
    logger.info(`Getting resource: ${uri}`);
    
    const resource = this.resources.find(r => r.uri === uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // Return example content
    return `Content of ${resource.name}: This is example data from test-fix`;
  }
}
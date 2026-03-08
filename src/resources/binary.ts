import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Registers resource examples demonstrating handling of non-text data.
 */
export function registerBinaryResources(server: McpServer) {
    // 1. Binary Content (Base64 Image)
    // Demonstrates returning a generated image or binary data using registerResource.
    server.registerResource(
        'sample-image',
        'images://sample',
        {
            title: 'Sample Image',
            description: 'A sample binary resource returning a base64 encoded image.',
            mimeType: 'image/png',
        },
        async (uri) => {
            // A simple 1x1 transparent blue pixel as base64
            const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAEfgF5868vAAAAAElFTkSuQmCC';

            return {
                contents: [
                    {
                        uri: uri.href,
                        blob: base64Data,
                        mimeType: 'image/png',
                    },
                ],
            };
        }
    );
}

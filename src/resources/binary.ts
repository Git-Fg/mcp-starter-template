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
            description: `A sample binary resource returning a base64 encoded image.
When to use:
- Testing binary data transfer between server and client.
- Verifying image rendering or processing capabilities.
- For example, read "images://sample" to retrieve a placeholder image for UI testing.`,
            mimeType: 'image/png',
            annotations: {
                audience: ['user', 'assistant'],
                priority: 0.5,
            },
            icons: [
                {
                    src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+OzwvcmVjdD48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSI+PC9wb2x5bGluZT48L3N2Zz4=',
                    mimeType: 'image/svg+xml',
                }
            ]
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

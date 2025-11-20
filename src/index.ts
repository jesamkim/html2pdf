#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PdfConverter } from './pdf-converter.js';
import { ConvertOptions } from './types.js';

const converter = new PdfConverter();

const CONVERT_HTML_TO_PDF_TOOL: Tool = {
  name: 'convert_html_to_pdf',
  description: 'Convert HTML file or HTML content to PDF with browser rendering. Supports CSS, JavaScript, and external resources.',
  inputSchema: {
    type: 'object',
    properties: {
      htmlPath: {
        type: 'string',
        description: 'Path to HTML file to convert (absolute or relative to current working directory)'
      },
      htmlContent: {
        type: 'string',
        description: 'HTML content string to convert (alternative to htmlPath)'
      },
      outputPath: {
        type: 'string',
        description: 'Output PDF file path (default: auto-generated with timestamp in current directory)'
      },
      format: {
        type: 'string',
        enum: ['A4', 'A3', 'Letter', 'Legal', 'Tabloid'],
        description: 'Paper format (default: A4)'
      },
      landscape: {
        type: 'boolean',
        description: 'Use landscape orientation (default: false)'
      },
      printBackground: {
        type: 'boolean',
        description: 'Print background graphics (default: true)'
      },
      scale: {
        type: 'number',
        description: 'Scale of the webpage rendering (default: 1, range: 0.1 to 2)'
      },
      marginTop: {
        type: 'string',
        description: 'Top margin (default: 10mm, accepts px, cm, in, mm)'
      },
      marginBottom: {
        type: 'string',
        description: 'Bottom margin (default: 10mm)'
      },
      marginLeft: {
        type: 'string',
        description: 'Left margin (default: 10mm)'
      },
      marginRight: {
        type: 'string',
        description: 'Right margin (default: 10mm)'
      },
      displayHeaderFooter: {
        type: 'boolean',
        description: 'Display header and footer (default: false)'
      },
      headerTemplate: {
        type: 'string',
        description: 'HTML template for header'
      },
      footerTemplate: {
        type: 'string',
        description: 'HTML template for footer'
      },
      waitForNetworkIdle: {
        type: 'boolean',
        description: 'Wait for network to be idle before generating PDF (default: false)'
      },
      timeout: {
        type: 'number',
        description: 'Maximum time to wait for page load in milliseconds (default: 30000)'
      }
    }
  }
};

class Html2PdfServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'html2pdf-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await converter.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await converter.cleanup();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [CONVERT_HTML_TO_PDF_TOOL]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'convert_html_to_pdf') {
        try {
          const options = args as ConvertOptions;
          const result = await converter.convertToPdf(options);

          if (result.success) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'PDF generated successfully',
                    outputPath: result.outputPath,
                    processingTime: `${result.details?.processingTime}ms`,
                    fileSize: result.details?.fileSize
                      ? `${(result.details.fileSize / 1024).toFixed(2)} KB`
                      : 'unknown'
                  }, null, 2)
                }
              ]
            };
          } else {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: result.error,
                    processingTime: `${result.details?.processingTime}ms`
                  }, null, 2)
                }
              ],
              isError: true
            };
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : String(error)
                }, null, 2)
              }
            ],
            isError: true
          };
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('HTML to PDF MCP Server running on stdio');
  }
}

const server = new Html2PdfServer();
server.run().catch(console.error);

# HTML to PDF MCP Server

MCP (Model Context Protocol) server for converting HTML files or HTML content to PDF using Puppeteer's browser rendering engine.

## Features

- Convert HTML files to PDF with high-fidelity browser rendering
- Convert HTML content strings to PDF
- Full CSS and JavaScript support
- Configurable page format, margins, orientation
- Header and footer templates
- Background graphics printing
- Wait for network idle option
- Browser instance pooling for performance

## Installation

```bash
npm install
npm run build
```

## Usage

### Quick Start with Claude Code/Desktop

This server is designed to work with **Claude Code** and **Claude Desktop** as an MCP tool.

**📖 For detailed MCP setup and usage instructions, see [MCP_USAGE.md](MCP_USAGE.md)**

### Basic MCP Configuration

Add to your MCP client configuration:

**Claude Code**: `~/.config/claude-code/mcp_config.json`
**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "html2pdf": {
      "command": "node",
      "args": ["/absolute/path/to/html2pdf/dist/index.js"],
      "description": "Convert HTML to PDF with browser rendering"
    }
  }
}
```

After configuration, restart Claude and ask:
```
Claude, convert my-report.html to PDF with 80% scale and A4 format
```

### Available Tool

#### `convert_html_to_pdf`

Convert HTML to PDF with browser rendering.

**Parameters:**

- `htmlPath` (string, optional): Path to HTML file to convert
- `htmlContent` (string, optional): HTML content string to convert (alternative to htmlPath)
- `outputPath` (string, optional): Output PDF file path (default: auto-generated with timestamp)
- `format` (string, optional): Paper format - A4, A3, Letter, Legal, Tabloid (default: A4)
- `landscape` (boolean, optional): Use landscape orientation (default: false)
- `printBackground` (boolean, optional): Print background graphics (default: true)
- `scale` (number, optional): Scale of webpage rendering, 0.1-2 (default: 1)
- `marginTop` (string, optional): Top margin (default: 10mm)
- `marginBottom` (string, optional): Bottom margin (default: 10mm)
- `marginLeft` (string, optional): Left margin (default: 10mm)
- `marginRight` (string, optional): Right margin (default: 10mm)
- `displayHeaderFooter` (boolean, optional): Display header and footer (default: false)
- `headerTemplate` (string, optional): HTML template for header
- `footerTemplate` (string, optional): HTML template for footer
- `waitForNetworkIdle` (boolean, optional): Wait for network to be idle (default: false)
- `timeout` (number, optional): Maximum time to wait in milliseconds (default: 30000)

**Example:**

```json
{
  "htmlPath": "./sample.html",
  "outputPath": "./output.pdf",
  "format": "A4",
  "printBackground": true,
  "marginTop": "10mm",
  "marginBottom": "10mm"
}
```

### Direct Testing

```bash
npx tsx test-conversion.ts
```

## Documentation

- **[MCP_USAGE.md](MCP_USAGE.md)** - Complete guide for using with Claude Code/Desktop
- **[REQUIREMENTS.md](REQUIREMENTS.md)** - System requirements and installation
- **[mcp-config-example.json](mcp-config-example.json)** - Example configuration file

## Architecture

```
html2pdf-mcp-server/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── pdf-converter.ts   # Puppeteer PDF conversion logic
│   └── types.ts           # TypeScript type definitions
├── dist/                  # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Technical Details

### Browser Instance Pooling

The server maintains a reusable browser instance to improve performance for multiple conversion requests. The browser is automatically launched on first use and cleaned up on server shutdown.

### Rendering Process

1. Launch headless Chrome via Puppeteer
2. Load HTML content (from file or string)
3. Wait for page load or network idle
4. Execute any JavaScript on the page
5. Generate PDF with specified options
6. Clean up page resources

### Error Handling

- File access validation
- Timeout handling (default 30s)
- Browser crash recovery
- Graceful resource cleanup

## Performance Considerations

- First PDF generation: ~1.5-2s (includes browser launch)
- Subsequent conversions: ~0.5-1s (reuses browser instance)
- Memory usage: ~100-200MB per browser instance
- Recommended for batch processing with the same server instance

## Sample Output

Sample files included in the repository:

**[sample.html](sample.html)** → **[sample.pdf](sample.pdf)**

Features demonstrated:
- 📊 Chart.js integration with dynamic data visualization
- 🇰🇷 Korean + 🇬🇧 English bilingual content
- ✅ Emoji support (✅ ⚠️ 📈 🎯 💡 etc.)
- 🎨 Modern CSS styling with gradients and shadows
- 📱 Responsive tables and grid layouts
- 💼 Professional business report format

Conversion results:
- Processing time: 2.3s
- Output file size: 896.63 KB
- Format: A4 portrait with 80% scale
- Full CSS styling and fonts preserved

## Requirements

- Node.js 18+
- Chrome/Chromium (automatically downloaded by Puppeteer)
- **Korean/CJK Fonts** (required for Korean text support)

### Installing Korean Fonts

#### Amazon Linux / RHEL / Fedora
```bash
# Korean fonts
sudo yum install -y google-noto-sans-cjk-kr-fonts google-noto-serif-cjk-kr-fonts

# Emoji fonts (optional, recommended)
sudo yum install -y google-noto-emoji-color-fonts google-noto-emoji-fonts

# Update font cache
fc-cache -fv
```

#### Ubuntu / Debian
```bash
sudo apt-get update
sudo apt-get install -y fonts-noto-cjk fonts-noto-cjk-extra fonts-noto-color-emoji
fc-cache -fv
```

See [REQUIREMENTS.md](REQUIREMENTS.md) for complete system requirements and troubleshooting.

## License

MIT

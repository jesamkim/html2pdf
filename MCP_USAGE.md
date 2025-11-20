# Using HTML to PDF MCP Server

This MCP server can be used with any MCP-compatible client, including **Claude Code** and **Claude Desktop**.

## What is MCP?

MCP (Model Context Protocol) is a standardized protocol that allows AI assistants to interact with external tools and services. This HTML to PDF server implements the MCP protocol, making it available as a tool for Claude.

## Setup for Claude Code

### 1. Build the Server

```bash
cd /path/to/html2pdf
npm install
npm run build
```

### 2. Add MCP Server

#### Option A: Using Claude Code CLI (Recommended)

The easiest way to add the server globally:

```bash
cd /path/to/html2pdf
claude mcp add --transport stdio --scope user html2pdf -- node $(pwd)/dist/index.js
```

**Scope options**:
- `--scope user` - Global (all projects) ✅ Recommended
- `--scope local` - Current project only
- `--scope project` - Project-wide (for team)

Verify it's added:
```bash
claude mcp list
```

#### Option B: Manual Configuration (Alternative)

Create or edit your MCP configuration file:

**For Claude Code**: `~/.claude.json` (user/global) or `./.claude.json` (project)
**For Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

Add the following configuration:

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

**Important**: Replace `/absolute/path/to/html2pdf` with the actual absolute path to your project.

### 3. Verify Installation

Check that the server is running:

```bash
claude mcp list
```

You should see:
```
html2pdf: node /path/to/html2pdf/dist/index.js - ✓ Connected
```

If Claude Code is already running, restart it to load the new MCP server.

## Using the Tool

Once configured, you can ask Claude to convert HTML to PDF:

### Example 1: Convert HTML File
```
Claude, please convert the file ./report.html to PDF with the following settings:
- Output: ./report.pdf
- Format: A4
- Scale: 80%
- Print backgrounds: yes
```

### Example 2: Convert HTML Content
```
Claude, create a PDF from this HTML:
<html><body><h1>Hello World</h1></body></html>

Save it as test.pdf
```

### Example 3: With Custom Options
```
Claude, convert ./invoice.html to PDF with:
- Landscape orientation
- Letter paper size
- 15mm margins on all sides
- Include header and footer
```

## Available Tool: convert_html_to_pdf

### Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `htmlPath` | string | No* | Path to HTML file | - |
| `htmlContent` | string | No* | HTML content string | - |
| `outputPath` | string | No | Output PDF path | auto-generated |
| `format` | string | No | Paper format (A4/A3/Letter/Legal/Tabloid) | A4 |
| `landscape` | boolean | No | Landscape orientation | false |
| `printBackground` | boolean | No | Print backgrounds | true |
| `scale` | number | No | Scale (0.1-2.0) | 1.0 |
| `marginTop` | string | No | Top margin | 10mm |
| `marginBottom` | string | No | Bottom margin | 10mm |
| `marginLeft` | string | No | Left margin | 10mm |
| `marginRight` | string | No | Right margin | 10mm |
| `displayHeaderFooter` | boolean | No | Show header/footer | false |
| `headerTemplate` | string | No | Header HTML template | - |
| `footerTemplate` | string | No | Footer HTML template | - |
| `waitForNetworkIdle` | boolean | No | Wait for network idle | false |
| `timeout` | number | No | Timeout (ms) | 30000 |

*Note: Either `htmlPath` or `htmlContent` must be provided.

## Direct API Usage (without Claude)

You can also use the tool directly via JSON-RPC over stdio:

```bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"convert_html_to_pdf","arguments":{"htmlPath":"./test.html","outputPath":"./output.pdf"}},"id":1}' | node dist/index.js
```

## Troubleshooting

### Tool Not Appearing
1. Check MCP configuration file path is correct
2. Ensure absolute path to `dist/index.js` is specified
3. Restart Claude Code/Desktop
4. Check server logs in Claude Code settings

### Korean Text Not Showing
Install Korean fonts:
```bash
# Amazon Linux / RHEL
sudo yum install -y google-noto-sans-cjk-kr-fonts google-noto-serif-cjk-kr-fonts
fc-cache -fv
```

### Emoji Not Showing
Install emoji fonts:
```bash
# Amazon Linux / RHEL
sudo yum install -y google-noto-emoji-color-fonts google-noto-emoji-fonts
fc-cache -fv
```

## Example Workflow in Claude Code

1. Open a project with HTML files
2. Ask Claude: "Convert all HTML files in ./docs to PDF"
3. Claude will:
   - Find the HTML files
   - Use the `convert_html_to_pdf` tool for each file
   - Save PDFs to the specified location
   - Report the results

## Benefits of MCP Integration

- **Natural Language Interface**: Just describe what you want in plain language
- **Context Awareness**: Claude understands your project structure
- **Batch Operations**: Process multiple files easily
- **Smart Defaults**: Claude chooses appropriate settings based on context
- **Error Handling**: Claude helps troubleshoot conversion issues

## See Also

- [README.md](README.md) - General project documentation
- [REQUIREMENTS.md](REQUIREMENTS.md) - System requirements and setup
- [MCP Protocol](https://modelcontextprotocol.io/) - Official MCP documentation

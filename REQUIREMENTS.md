# System Requirements

This document lists all system-level dependencies required to run the HTML to PDF MCP Server.

## Operating System

- Linux (tested on Amazon Linux 2023)
- macOS (should work with Homebrew)
- Windows (with WSL recommended)

## Runtime Requirements

### Node.js
- **Version**: 18.x or higher
- **Check**: `node --version`

### NPM
- **Version**: 9.x or higher (comes with Node.js)
- **Check**: `npm --version`

## System Fonts (Required for Korean/CJK Support)

### Amazon Linux 2023 / RHEL / Fedora
```bash
# Korean fonts
sudo yum install -y google-noto-sans-cjk-kr-fonts google-noto-serif-cjk-kr-fonts

# Emoji fonts (optional, for emoji support)
sudo yum install -y google-noto-emoji-color-fonts google-noto-emoji-fonts
```

### Ubuntu / Debian
```bash
sudo apt-get update
sudo apt-get install -y fonts-noto-cjk fonts-noto-cjk-extra

# Emoji fonts (optional)
sudo apt-get install -y fonts-noto-color-emoji
```

### macOS
```bash
# Usually pre-installed, but if needed:
brew install font-noto-sans-cjk

# Emoji fonts (optional)
brew tap homebrew/cask-fonts
brew install font-noto-color-emoji
```

### After Installation
Update font cache:
```bash
fc-cache -fv
```

Verify installation:
```bash
fc-list :lang=ko | head -5
```

## Node.js Dependencies

All Node.js dependencies are managed via `package.json`:

### Production Dependencies
- `@modelcontextprotocol/sdk`: ^1.0.4 - MCP protocol implementation
- `puppeteer`: ^23.11.1 - Headless Chrome for HTML rendering

### Development Dependencies
- `typescript`: ^5.7.2 - TypeScript compiler
- `@types/node`: ^22.10.1 - Node.js type definitions

## Installation Steps

### 1. Install System Fonts (if supporting Korean/CJK)
```bash
# Amazon Linux / RHEL
sudo yum install -y google-noto-sans-cjk-kr-fonts google-noto-serif-cjk-kr-fonts

# Update font cache
fc-cache -fv
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Build TypeScript
```bash
npm run build
```

### 4. Test Installation
```bash
npx tsx test-conversion.ts
```

## Additional System Requirements

### Memory
- **Minimum**: 512 MB RAM
- **Recommended**: 1 GB RAM or more
- Each browser instance uses ~100-200 MB

### Disk Space
- **Node modules**: ~100 MB
- **Puppeteer Chromium**: ~300 MB (auto-downloaded on first install)
- **Working space**: ~100 MB for temporary files

### Network
- Required during `npm install` for downloading packages
- Required on first run for Puppeteer to download Chromium
- Not required for PDF conversion after setup

## Troubleshooting

### Korean Text Appears as Boxes or Garbled
**Problem**: System fonts not installed
**Solution**: Install Noto CJK fonts as described above

### "Cannot find Chrome" Error
**Problem**: Puppeteer failed to download Chromium
**Solution**: Run `npx puppeteer browsers install chrome`

### Out of Memory Errors
**Problem**: Insufficient RAM for browser instances
**Solution**:
- Increase system memory
- Reduce concurrent conversions
- Add timeout limits

### Font Cache Issues
**Problem**: Fonts installed but not detected
**Solution**:
```bash
fc-cache -fv
fc-list :lang=ko  # Verify fonts are listed
```

## Docker Deployment (Optional)

For containerized deployment, use a Dockerfile with the following base:

```dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    chromium \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] NPM dependencies installed (`npm install`)
- [ ] TypeScript compiled (`npm run build`)
- [ ] Korean/CJK fonts installed (if needed)
- [ ] Font cache updated (`fc-cache -fv`)
- [ ] Test conversion successful (`npx tsx test-conversion.ts`)
- [ ] Generated PDF displays Korean text correctly

## Support

For issues specific to:
- **Fonts**: Check your OS font installation documentation
- **Puppeteer**: https://pptr.dev/troubleshooting
- **MCP**: https://modelcontextprotocol.io/

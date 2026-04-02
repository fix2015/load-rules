# load-rules

> CLI tool to discover, search, and install AI coding rules for Claude Code, Cursor, Copilot, Codex, and more.

[![npm version](https://img.shields.io/npm/v/load-rules.svg)](https://www.npmjs.com/package/load-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**load-rules** aggregates coding rules from multiple sources into a single searchable registry, letting you install any rule with one command. No more cloning repos or manually copying `.cursorrules` files.

## Quick Start

```bash
# Install a rule instantly (no install needed)
npx load-rules install nextjs

# Or install globally
npm install -g load-rules
load-rules install react-expert
```

## Features

- **50+ rules** from curated and community sources, pre-indexed and ready to install
- **Multi-tool support** — install rules for Claude Code, Cursor, Copilot, or Codex
- **Fast search** — find rules by name, description, or tags
- **Auto-updater** — update the registry from GitHub sources with `load-rules update`
- **Programmatic API** — use as a library in your own tools

## Commands

### Install a rule

```bash
load-rules install <name>                # Install for Claude Code (default)
load-rules install <name> --tool cursor  # Install for Cursor
load-rules install <name> --tool copilot # Install for GitHub Copilot
load-rules install <name> --global       # Install globally (~/.claude/rules/)
load-rules install <name> -o ./my-path   # Custom output path
load-rules <name>                        # Shorthand for install
```

### Search & browse

```bash
load-rules list                          # List all rules
load-rules list --source awesome-cursorrules  # Filter by source
load-rules list --tag frontend           # Filter by tag
load-rules list --tool cursor            # Filter by compatible tool

load-rules search react                  # Search by keyword
load-rules search react --tool cursor    # Search with tool filter
load-rules search "api design" --tag backend

load-rules info react-expert             # Detailed info about a rule
load-rules tags                          # Show all tags with counts
load-rules sources                       # Show all rule sources
```

### Update registry

```bash
load-rules update                        # Fetch latest rules from GitHub
GITHUB_TOKEN=ghp_xxx load-rules update   # Use token for higher rate limits
```

### JSON output

```bash
load-rules list --json                   # Machine-readable output
load-rules search react --json
load-rules info react-expert --json
```

## Supported Tools

| Tool | Install Location (local) | Install Location (global) |
|------|-------------------------|--------------------------|
| Claude Code | `.claude/rules/<name>.md` | `~/.claude/rules/<name>.md` |
| Cursor | `.cursor/rules/<name>.md` | `~/.cursor/rules/<name>.md` |
| Copilot | `.github/copilot-instructions.md` | `~/.github/copilot-instructions.md` |
| Codex | `.codex/rules/<name>.md` | `~/.codex/rules/<name>.md` |

## Rule Sources

| Source | Repository | Type |
|--------|-----------|------|
| Awesome CursorRules | [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | Curated |
| Cursor Directory | [pontusab/cursor.directory](https://github.com/pontusab/cursor.directory) | Community |
| Awesome Cursor Rules | [sanjeed5/awesome-cursor-rules](https://github.com/sanjeed5/awesome-cursor-rules) | Community |

## Programmatic API

```javascript
const { findRule, searchRules, installRule } = require('load-rules');

// Search
const results = searchRules('react', { tag: 'frontend' });

// Get rule info
const rule = findRule('react-expert');

// Install programmatically
await installRule(rule, { tool: 'claude-code', global: true });
```

## Rebuild the Registry

The scraper fetches rule metadata from all configured GitHub sources:

```bash
npm run scrape                          # Rebuild from GitHub
GITHUB_TOKEN=ghp_xxx npm run scrape     # With auth for higher rate limits
```

## Contributing

1. Fork the repo
2. Add rules to `data/rules-registry.json` or add a new source in `src/scraper/index.js`
3. Submit a PR

### Adding a new rule source

Add an entry to the `SOURCES` array in `src/scraper/index.js`:

```javascript
{
  id: 'your-source',
  repo: 'owner/repo',
  path: 'rules',
  type: 'community',
  url: 'https://github.com/owner/repo',
  compatible: ['cursor', 'claude-code', 'copilot'],
}
```

## License

MIT

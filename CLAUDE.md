# CLAUDE.md

## Project Overview
load-rules is a CLI tool to discover, search, and install AI coding rules for Claude Code, Cursor, Copilot, Codex, and more.

## Tech Stack
- Node.js (>=16)
- CommonJS modules
- chalk v4, ora v5, commander, node-fetch v2, cli-table3

## Commands
- `npm test` — run all tests
- `npm run scrape` — rebuild registry from GitHub sources
- `npm start` — run the CLI

## Project Structure
- `bin/load-rules.js` — CLI entry point
- `src/commands/` — command handlers (install, list, search, info, tags, sources, update)
- `src/registry.js` — registry loading and querying
- `src/installer.js` — rule fetching and file installation
- `src/scraper/index.js` — GitHub scraper for building the registry
- `data/rules-registry.json` — the rules database
- `test/` — test files using node:test

## Key Patterns
- All source files use `'use strict'` at the top
- Tests use `node:test` and `node:assert` (no external test framework)
- Registry is cached in memory after first load
- Rules are installed as `.md` files in tool-specific directories
- Copilot uses `copilot-instructions.md` as the filename

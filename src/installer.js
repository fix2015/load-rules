'use strict';

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const os = require('os');

const TOOL_PATHS = {
  'claude-code': {
    global: path.join(os.homedir(), '.claude', 'rules'),
    local: '.claude/rules',
  },
  'cursor': {
    global: path.join(os.homedir(), '.cursor', 'rules'),
    local: '.cursor/rules',
  },
  'copilot': {
    global: path.join(os.homedir(), '.github'),
    local: '.github',
  },
  'codex': {
    global: path.join(os.homedir(), '.codex', 'rules'),
    local: '.codex/rules',
  },
};

async function fetchRuleContent(rule) {
  if (!rule.raw_url) {
    throw new Error(`No download URL available for rule "${rule.name}". Visit: ${rule.repo_url}`);
  }

  const response = await fetch(rule.raw_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch rule: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function getInstallPath(rule, { tool = 'claude-code', global: isGlobal = false, output } = {}) {
  if (output) return output;

  const toolConfig = TOOL_PATHS[tool];
  if (!toolConfig) {
    throw new Error(`Unknown tool: ${tool}. Supported: ${Object.keys(TOOL_PATHS).join(', ')}`);
  }

  const base = isGlobal ? toolConfig.global : toolConfig.local;

  if (tool === 'copilot') {
    return path.join(base, 'copilot-instructions.md');
  }

  return path.join(base, `${rule.name}.md`);
}

async function installRule(rule, options = {}) {
  const content = await fetchRuleContent(rule);
  const installPath = getInstallPath(rule, options);
  const dir = path.dirname(installPath);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(installPath, content, 'utf-8');

  return { installPath, size: content.length };
}

module.exports = {
  fetchRuleContent,
  getInstallPath,
  installRule,
  TOOL_PATHS,
};

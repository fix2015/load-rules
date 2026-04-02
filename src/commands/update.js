'use strict';

const chalk = require('chalk');
const ora = require('ora');
const fetch = require('node-fetch');
const fs = require('fs');
const { REGISTRY_PATH, clearCache, loadRegistry } = require('../registry');

const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'awesome-cursorrules',
    repo: 'PatrickJS/awesome-cursorrules',
    path: 'rules',
    type: 'curated',
  },
  {
    id: 'cursor-directory',
    repo: 'pontusab/cursor.directory',
    path: 'src/data/rules',
    type: 'community',
  },
  {
    id: 'awesome-cursor-rules',
    repo: 'sanjeed5/awesome-cursor-rules',
    path: 'rules',
    type: 'community',
  },
];

async function fetchRepoRules(source) {
  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'load-rules-cli',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error for ${source.repo}: ${response.status}`);
  }

  const items = await response.json();
  return items
    .filter(item => item.type === 'dir' || item.name.endsWith('.md') || item.name.endsWith('.cursorrules'))
    .map(item => item.name);
}

module.exports = async function update() {
  const spinner = ora('Checking for registry updates...').start();

  try {
    let newRulesFound = 0;
    const registry = loadRegistry();
    const existingNames = new Set(registry.rules.map(r => r.name));

    for (const source of SOURCES) {
      spinner.text = `Scanning ${chalk.cyan(source.repo)}...`;
      try {
        const ruleNames = await fetchRepoRules(source);
        for (const name of ruleNames) {
          const cleanName = name.replace(/\.cursorrules$/, '').replace(/\.md$/, '');
          if (!existingNames.has(cleanName)) {
            registry.rules.push({
              name: cleanName,
              description: `Rule from ${source.repo} (run "load-rules info ${cleanName}" after next update)`,
              tags: [],
              source: source.id,
              compatible: ['cursor', 'claude-code', 'copilot', 'codex'],
              raw_url: `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${name}`,
              repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
            });
            existingNames.add(cleanName);
            newRulesFound++;
          }
        }
      } catch (err) {
        spinner.warn(chalk.yellow(`Failed to scan ${source.repo}: ${err.message}`));
        spinner.start();
      }
    }

    registry.updated_at = new Date().toISOString().split('T')[0];
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    clearCache();

    if (newRulesFound > 0) {
      spinner.succeed(chalk.green(`Registry updated! Found ${newRulesFound} new rule(s). Total: ${registry.rules.length}`));
    } else {
      spinner.succeed(chalk.green(`Registry is up to date. Total rules: ${registry.rules.length}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Update failed: ${err.message}`));
    process.exit(1);
  }
};

#!/usr/bin/env node

'use strict';

/**
 * Scraper that fetches rules from GitHub repositories and rebuilds
 * the local rules-registry.json. Run with: npm run scrape
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'rules-registry.json');
const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'awesome-cursorrules',
    repo: 'PatrickJS/awesome-cursorrules',
    path: 'rules',
    type: 'curated',
    url: 'https://github.com/PatrickJS/awesome-cursorrules',
    compatible: ['cursor', 'claude-code', 'copilot', 'codex'],
  },
  {
    id: 'cursor-directory',
    repo: 'pontusab/cursor.directory',
    path: 'src/data/rules',
    type: 'community',
    url: 'https://github.com/pontusab/cursor.directory',
    compatible: ['cursor', 'claude-code', 'copilot', 'codex'],
  },
  {
    id: 'awesome-cursor-rules',
    repo: 'sanjeed5/awesome-cursor-rules',
    path: 'rules',
    type: 'community',
    url: 'https://github.com/sanjeed5/awesome-cursor-rules',
    compatible: ['cursor', 'claude-code', 'copilot', 'codex'],
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function githubFetch(url) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'load-rules-scraper',
  };

  // Use GITHUB_TOKEN if available for higher rate limits
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 403) {
    const resetTime = response.headers.get('x-ratelimit-reset');
    if (resetTime) {
      const waitMs = (parseInt(resetTime) * 1000) - Date.now() + 1000;
      console.log(`  Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
      return githubFetch(url);
    }
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchRuleDirs(source) {
  if (!source.path) return [];

  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  try {
    const items = await githubFetch(url);
    return items.filter(item => item.type === 'dir' || item.name.endsWith('.md') || item.name.endsWith('.cursorrules')).map(item => item.name);
  } catch (err) {
    console.error(`  Error fetching ${source.repo}: ${err.message}`);
    return [];
  }
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function inferTags(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const tagMap = {
    'frontend': ['react', 'vue', 'angular', 'svelte', 'css', 'html', 'frontend', 'ui', 'nextjs', 'next-js', 'tailwind'],
    'backend': ['api', 'server', 'backend', 'express', 'fastapi', 'django', 'rails', 'spring', 'nestjs', 'laravel'],
    'testing': ['test', 'playwright', 'jest', 'cypress', 'qa', 'e2e', 'tdd'],
    'devops': ['devops', 'ci', 'cd', 'docker', 'kubernetes', 'deploy', 'terraform', 'ansible'],
    'database': ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'db', 'supabase', 'prisma'],
    'ai': ['ai', 'ml', 'llm', 'rag', 'embedding', 'fine-tun', 'prompt', 'claude', 'gpt', 'agent', 'openai', 'langchain'],
    'security': ['security', 'owasp', 'auth', 'crypto', 'vulnerability'],
    'mobile': ['mobile', 'ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin', 'swiftui'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'vercel', 'netlify'],
    'python': ['python', 'django', 'fastapi', 'flask', 'pandas', 'pytorch'],
    'javascript': ['javascript', 'js', 'node', 'typescript', 'ts', 'react', 'vue', 'angular', 'svelte', 'nextjs', 'next-js', 'nuxt'],
    'go': ['golang', 'go-'],
    'rust': ['rust'],
    'java': ['java', 'spring', 'jvm', 'kotlin'],
    'css': ['css', 'tailwind', 'sass', 'scss', 'styled-component'],
    'workflow': ['workflow', 'agile', 'scrum', 'planning'],
    'architecture': ['architect', 'microservice', 'monolith', 'design-pattern', 'clean-code'],
    'fullstack': ['fullstack', 'full-stack', 't3', 'trpc'],
  };

  const tags = new Set();
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(k => text.includes(k))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

async function scrapeAll() {
  console.log('Scraping rules from GitHub repositories...\n');

  const rules = [];
  const seenNames = new Set();

  for (const source of SOURCES) {
    console.log(`Scanning ${source.repo}...`);

    const dirs = await fetchRuleDirs(source);
    console.log(`   Found ${dirs.length} rule entries`);

    for (const name of dirs) {
      const cleanName = name.replace(/\.cursorrules$/, '').replace(/\.md$/, '');
      if (seenNames.has(cleanName)) {
        console.log(`   Skipping duplicate: ${cleanName}`);
        continue;
      }

      const tags = inferTags(cleanName, '');

      rules.push({
        name: cleanName,
        description: `${cleanName.replace(/-/g, ' ')} coding rules`,
        tags,
        source: source.id,
        compatible: source.compatible,
        raw_url: `https://raw.githubusercontent.com/${source.repo}/main/${source.path}/${name}`,
        repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
      });

      seenNames.add(cleanName);
    }

    console.log('');
  }

  const registry = {
    version: '1.0.0',
    updated_at: new Date().toISOString().split('T')[0],
    sources: SOURCES.map(({ id, repo, path: p, type, url }) => ({ id, repo, path: p, type, url })),
    rules,
  };

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Saved ${rules.length} rules to ${REGISTRY_PATH}`);
}

// Run if executed directly
if (require.main === module) {
  scrapeAll().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  });
}

module.exports = { scrapeAll, inferTags, parseYamlFrontmatter };

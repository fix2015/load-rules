'use strict';

const path = require('path');
const fs = require('fs');

const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'rules-registry.json');

let _cache = null;

function loadRegistry() {
  if (_cache) return _cache;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  _cache = JSON.parse(raw);
  return _cache;
}

function getAllRules() {
  return loadRegistry().rules;
}

function getSources() {
  return loadRegistry().sources;
}

function getVersion() {
  return loadRegistry().version;
}

function getUpdatedAt() {
  return loadRegistry().updated_at;
}

function findRule(name) {
  const rules = getAllRules();
  // Exact match first
  const exact = rules.find(r => r.name === name);
  if (exact) return exact;
  // Case-insensitive
  const lower = name.toLowerCase();
  return rules.find(r => r.name.toLowerCase() === lower);
}

function searchRules(query, { tag, tool } = {}) {
  let rules = getAllRules();

  if (tag) {
    rules = rules.filter(r => r.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    rules = rules.filter(r => r.compatible.includes(tool.toLowerCase()));
  }

  if (!query) return rules;

  const q = query.toLowerCase();
  return rules.filter(r => {
    return (
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.includes(q))
    );
  });
}

function filterRules({ source, tag, tool } = {}) {
  let rules = getAllRules();
  if (source) {
    rules = rules.filter(r => r.source === source);
  }
  if (tag) {
    rules = rules.filter(r => r.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    rules = rules.filter(r => r.compatible.includes(tool.toLowerCase()));
  }
  return rules;
}

function getAllTags() {
  const rules = getAllRules();
  const tagMap = {};
  for (const rule of rules) {
    for (const tag of rule.tags) {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    }
  }
  return Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

function clearCache() {
  _cache = null;
}

module.exports = {
  loadRegistry,
  getAllRules,
  getSources,
  getVersion,
  getUpdatedAt,
  findRule,
  searchRules,
  filterRules,
  getAllTags,
  clearCache,
  REGISTRY_PATH,
};

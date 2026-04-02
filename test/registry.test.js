'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  getAllRules,
  findRule,
  searchRules,
  filterRules,
  getAllTags,
  getSources,
} = require('../src/registry');

describe('Registry', () => {
  it('should load all rules', () => {
    const rules = getAllRules();
    assert.ok(rules.length > 0, 'Should have at least one rule');
  });

  it('should find rule by exact name', () => {
    const rule = findRule('react-expert');
    assert.ok(rule, 'Should find react-expert');
    assert.strictEqual(rule.name, 'react-expert');
  });

  it('should find rule case-insensitively', () => {
    const rule = findRule('React-Expert');
    assert.ok(rule, 'Should find rule regardless of case');
  });

  it('should return undefined for unknown rule', () => {
    const rule = findRule('nonexistent-rule-xyz');
    assert.strictEqual(rule, undefined);
  });

  it('should search by keyword in name', () => {
    const results = searchRules('react');
    assert.ok(results.length > 0, 'Should find react-related rules');
    assert.ok(results.some(r => r.name.includes('react')));
  });

  it('should search by keyword in description', () => {
    const results = searchRules('testing');
    assert.ok(results.length > 0, 'Should find testing-related rules');
  });

  it('should filter by tag', () => {
    const results = searchRules('', { tag: 'frontend' });
    assert.ok(results.length > 0);
    assert.ok(results.every(r => r.tags.includes('frontend')));
  });

  it('should filter by source', () => {
    const results = filterRules({ source: 'awesome-cursorrules' });
    assert.ok(results.length > 0);
    assert.ok(results.every(r => r.source === 'awesome-cursorrules'));
  });

  it('should filter by tool', () => {
    const results = filterRules({ tool: 'cursor' });
    assert.ok(results.length > 0);
    assert.ok(results.every(r => r.compatible.includes('cursor')));
  });

  it('should get all tags with counts', () => {
    const tags = getAllTags();
    assert.ok(tags.length > 0);
    assert.ok(tags[0].tag);
    assert.ok(tags[0].count > 0);
    // Should be sorted by count descending
    for (let i = 1; i < tags.length; i++) {
      assert.ok(tags[i].count <= tags[i - 1].count, 'Tags should be sorted by count desc');
    }
  });

  it('should get sources', () => {
    const sources = getSources();
    assert.ok(sources.length > 0);
    assert.ok(sources[0].id);
    assert.ok(sources[0].repo);
  });

  it('every rule should have required fields', () => {
    const rules = getAllRules();
    for (const rule of rules) {
      assert.ok(rule.name, `Rule missing name`);
      assert.ok(rule.description, `Rule ${rule.name} missing description`);
      assert.ok(Array.isArray(rule.tags), `Rule ${rule.name} tags should be array`);
      assert.ok(rule.source, `Rule ${rule.name} missing source`);
      assert.ok(Array.isArray(rule.compatible), `Rule ${rule.name} compatible should be array`);
    }
  });
});

'use strict';

const { findRule, searchRules, filterRules, getAllRules, getAllTags } = require('./registry');
const { installRule, fetchRuleContent } = require('./installer');

module.exports = {
  findRule,
  searchRules,
  filterRules,
  getAllRules,
  getAllTags,
  installRule,
  fetchRuleContent,
};

'use strict';

const chalk = require('chalk');
const { findRule, searchRules } = require('../registry');

module.exports = function info(name, options = {}) {
  let rule = findRule(name);

  if (!rule) {
    const matches = searchRules(name);
    if (matches.length === 1) {
      rule = matches[0];
    } else if (matches.length > 1) {
      console.log(chalk.yellow(`Multiple matches for "${name}":`));
      matches.slice(0, 5).forEach(r => {
        console.log(`  ${chalk.cyan(r.name)}`);
      });
      return;
    } else {
      console.log(chalk.red(`Rule "${name}" not found.`));
      return;
    }
  }

  if (options.json) {
    console.log(JSON.stringify(rule, null, 2));
    return;
  }

  console.log('');
  console.log(chalk.bold.cyan(`  ${rule.name}`));
  console.log(chalk.gray('  ' + '─'.repeat(50)));
  console.log(`  ${chalk.bold('Description:')}  ${rule.description}`);
  console.log(`  ${chalk.bold('Source:')}       ${rule.source}`);
  console.log(`  ${chalk.bold('Tags:')}         ${rule.tags.join(', ')}`);
  console.log(`  ${chalk.bold('Compatible:')}   ${rule.compatible.join(', ')}`);
  console.log(`  ${chalk.bold('Repo:')}         ${chalk.underline(rule.repo_url)}`);
  if (rule.raw_url) {
    console.log(`  ${chalk.bold('Raw URL:')}      ${chalk.underline(rule.raw_url)}`);
  }
  console.log('');
  console.log(chalk.gray(`  Install: load-rules install ${rule.name}`));
  console.log(chalk.gray(`  Install for Cursor: load-rules install ${rule.name} --tool cursor`));
  console.log('');
};

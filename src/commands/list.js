'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { filterRules } = require('../registry');

module.exports = function list(options = {}) {
  const rules = filterRules({
    source: options.source,
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(rules, null, 2));
    return;
  }

  if (rules.length === 0) {
    console.log(chalk.yellow('No rules found matching your filters.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Source'),
      chalk.cyan('Tags'),
    ],
    colWidths: [25, 50, 18, 25],
    wordWrap: true,
    style: { head: [], border: [] },
  });

  for (const rule of rules) {
    table.push([
      chalk.bold(rule.name),
      rule.description.slice(0, 80),
      chalk.gray(rule.source),
      chalk.gray(rule.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Available Rules (${rules.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-rules install <name>`));
  console.log(chalk.gray(`Details: load-rules info <name>`));
};

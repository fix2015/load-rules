'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { searchRules } = require('../registry');

module.exports = function search(query, options = {}) {
  const results = searchRules(query, {
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log(chalk.yellow(`No rules found for "${query}".`));
    console.log(chalk.gray('Try a broader search term or browse: load-rules list'));
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

  for (const rule of results) {
    // Highlight matching parts in name
    const highlighted = rule.name.replace(
      new RegExp(`(${query})`, 'gi'),
      chalk.yellow('$1')
    );
    table.push([
      chalk.bold(highlighted),
      rule.description.slice(0, 80),
      chalk.gray(rule.source),
      chalk.gray(rule.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Search Results for "${query}" (${results.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-rules install <name>`));
};

'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { getSources, filterRules } = require('../registry');

module.exports = function sources() {
  const sourceList = getSources();

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('Repository'),
      chalk.cyan('Type'),
      chalk.cyan('Rules'),
      chalk.cyan('URL'),
    ],
    colWidths: [20, 36, 12, 8, 50],
    wordWrap: true,
    style: { head: [], border: [] },
  });

  for (const source of sourceList) {
    const count = filterRules({ source: source.id }).length;
    table.push([
      chalk.bold(source.id),
      source.repo,
      chalk.gray(source.type),
      String(count),
      chalk.underline(source.url),
    ]);
  }

  console.log(`\n${chalk.bold('Rule Sources')}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nFilter by source: load-rules list --source <id>`));
};

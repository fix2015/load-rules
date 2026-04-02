'use strict';

const chalk = require('chalk');
const ora = require('ora');
const { findRule, searchRules } = require('../registry');
const { installRule } = require('../installer');

module.exports = async function install(name, options = {}) {
  const spinner = ora(`Searching for rule "${name}"...`).start();

  try {
    let rule = findRule(name);

    if (!rule) {
      // Try fuzzy search
      const matches = searchRules(name);
      if (matches.length === 0) {
        spinner.fail(chalk.red(`Rule "${name}" not found.`));
        console.log(chalk.yellow('\nTry:'));
        console.log(`  load-rules search ${name}`);
        console.log('  load-rules list');
        process.exit(1);
      }
      if (matches.length === 1) {
        rule = matches[0];
        spinner.info(chalk.yellow(`Exact match not found. Using: ${rule.name}`));
      } else {
        spinner.warn(chalk.yellow(`Multiple matches found for "${name}":`));
        console.log('');
        matches.slice(0, 10).forEach(r => {
          console.log(`  ${chalk.cyan(r.name.padEnd(30))} ${chalk.gray(r.description.slice(0, 60))}`);
        });
        if (matches.length > 10) {
          console.log(chalk.gray(`  ... and ${matches.length - 10} more`));
        }
        console.log(chalk.yellow(`\nSpecify the exact name: load-rules install <name>`));
        process.exit(1);
      }
    }

    const tool = options.tool || 'claude-code';
    spinner.text = `Installing ${chalk.cyan(rule.name)} for ${chalk.green(tool)}...`;
    spinner.start();

    const result = await installRule(rule, options);

    spinner.succeed(
      chalk.green(`Installed ${chalk.bold(rule.name)} → ${chalk.underline(result.installPath)}`)
    );
    console.log(chalk.gray(`  Source: ${rule.source} | Size: ${(result.size / 1024).toFixed(1)}KB`));
    console.log(chalk.gray(`  Tags: ${rule.tags.join(', ')}`));
  } catch (err) {
    spinner.fail(chalk.red(`Installation failed: ${err.message}`));
    process.exit(1);
  }
};

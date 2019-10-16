const didYouMean = require('didyoumean')
const { names, nameStrings } = require('../availableTemplates')
const chalk = require('chalk')

module.exports = function checkTemplateNames(template) {
  if (!names.includes(template)) {
    console.log()
    console.log(
      chalk.red(
        `Unavailable template name ${chalk.yellow(template)}. ` +
          `Template must be one of ${chalk.yellow(nameStrings)}`
      )
    )
    const suggestion = didYouMean(template, names)
    if (suggestion) {
      console.log(chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
    }
    process.exit(1)
  }
}

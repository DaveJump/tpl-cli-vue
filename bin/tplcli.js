#!/usr/bin/env node

require('../lib/utils/checkNodeVersion')
// require('../lib/utils/checkForUpdate')

const program = require('commander')
const chalk = require('chalk')
const didYouMean = require('didyoumean')
const inquirer = require('inquirer')

// Setting edit distance to 60% of the input string's length
didYouMean.threshold = 0.6

program.version(require('../package.json').version, '-V, --version').usage('<command> [options]')

program
  .command('init [projectName]')
  .description('Create a new project generating by vue-cli')
  .option('-t, --template <templateName>', 'The template you want to be generated')
  // register some of general vue-cli internal options
  .option('-n, --no-git', 'Skip git initialization')
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  .action(async (name, cmd) => {
    if (!name) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Enter your project name.',
          validate(val) {
            return Boolean(val.trim().length) || new Error('Project name should not be empty!')
          }
        }
      ])
      name = answers.projectName.replace(/\s+/g, '')
    }

    const options = cleanArgs(cmd)
    const loadCommand = require('../lib/utils/loadCommand')

    const init = await loadCommand('init')
    init(name, options)
  })

const { templates, nameStrings } = require('../lib/availableTemplates')

program
  .command('install [templateName]')
  .description(`Install a template from one of ${nameStrings}`)
  .option('-m, --packageManager <command>', 'Specify npm client to install')
  .action(async (name, cmd) => {
    if (!name) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Select the template to be installed.',
          choices: templates.map(tpl => ({
            name: `${tpl.name} (${tpl.description})`,
            value: tpl.name
          })),
          filter(val) {
            return val.toLowerCase()
          }
        }
      ])
      name = answers.template
    }

    const options = cleanArgs(cmd)
    const loadCommand = require('../lib/utils/loadCommand')

    const install = await loadCommand('install')
    install(name, options)
  })

// output help information on unknown commands
program.arguments('<command>').action(cmd => {
  program.outputHelp()
  console.log(chalk.red(`Unknown command ${chalk.yellow(cmd)}.\n\r`))
  suggestCommands(cmd)
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(`Run ${chalk.cyan(`tplcli <command> --help`)} for detailed usage of given command.`)
  console.log()
})

// enhance common error messages
const enhanceErrorMessages = require('../lib/utils/enhanceErrorMessages')

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

program.parse(process.argv)

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {}
  cmd.options.forEach(opt => {
    const key = camelize(opt.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map(cmd => {
    return cmd._name
  })

  const suggestion = didYouMean(unknownCommand, availableCommands)
  if (suggestion) {
    console.log(chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}

const globalDirs = require('global-dirs')
const chalk = require('chalk')
const fs = require('fs')
const inquirer = require('inquirer')
const executeCommand = require('../util/executeCommand')

module.exports = async function init(projectName, options) {
  const { templates } = require('../availableTemplates')
  let template = options.template

  if (!template) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Select the template you want to generate.',
        choices: templates.map(tpl => ({
          name: `${tpl.name} (${tpl.description})`,
          value: tpl.name
        })),
        filter(val) {
          return val.toLowerCase()
        }
      }
    ])
    template = answers.template
  }

  require('../util/checkTemplateNames')(template)

  const tplPath = `/@djp6/tpl-${template}/index.js`
  const tplNpmPath = globalDirs.npm.packages + tplPath
  const tplYarnPath = globalDirs.yarn.packages + tplPath
  let tplRealPath

  // if template has not been installed globally, output a friendly error tip
  if (!fs.existsSync(tplNpmPath) && !fs.existsSync(tplYarnPath)) {
    console.log()
    console.log(
      chalk.red(
        `Template ${chalk.yellow(template)} has not been installed globally. ` +
          `Run "tplcli install ${template}" or "npm install -g @djp6/tpl-${template}" to install it first.`
      )
    )
    return process.exit(1)
  }

  tplRealPath = fs.existsSync(tplNpmPath)
    ? tplNpmPath
    : fs.existsSync(tplYarnPath)
    ? tplYarnPath
    : ''

  const vueCliBin = '/vue'
  const vueCliNpmBin = globalDirs.npm.binaries + vueCliBin
  const vueCliYarnBin = globalDirs.yarn.binaries + vueCliBin

  // if vue-cli 3.x has not been installed globally, use npx instead
  const notExistsVueCli = !fs.existsSync(vueCliNpmBin) && !fs.existsSync(vueCliYarnBin)
  const extraOptions = process.argv
    .slice(2)
    .filter(arg => ![projectName, 'init', '-t', '--template', template].includes(arg))
  const createPattern = [
    'create',
    '--preset',
    tplRealPath.replace(/index.js$/, ''),
    ...extraOptions,
    projectName
  ]

  console.log()
  console.log(`⚙️  Prepare to generate with template ${chalk.yellow(template)}...`)
  if (notExistsVueCli) {
    await executeCommand(`npx`, ['@vue/cli@3.x', ...createPattern])
  } else {
    // check local vue-cli version, warn message and confirm proceed if version >= 4.0.0
    const { stdout: version } = await executeCommand('vue', ['-V'], 'pipe')
    if (/@vue\/cli 4\.\d\.\d/.test(version)) {
      console.log(
        chalk.yellow(
          `WARN: Your vue-cli version is greater or equal to 4.0.0, it may throw any error when constructing, version 3.x is recommended, because the current templates dose not support the plugins and loaders in vue-cli 4.x, but it will be supported sooner or later.`
        )
      )
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Still proceed?'
        }
      ])
      if (proceed) {
        await executeCommand(`vue`, createPattern)
      } else {
        process.exit()
      }
    } else {
      await executeCommand(`vue`, createPattern)
    }
  }
}

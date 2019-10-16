// const { hasPnpm3OrLater } = require('../utils/shareUtils/env')
const chalk = require('chalk')
const executeCommand = require('../utils/executeCommand')
const globalDirs = require('global-dirs')
const fs = require('fs')

module.exports = async function install(templateName, options) {
  require('../utils/checkTemplateNames')(templateName)

  const pkgManager = options.packageManager || 'npm'

  const SUPPORTED_PACKAGE_MANAGER = ['npm', 'yarn' /*, 'pnpm'*/]
  const PACKAGE_MANAGER_NPM_CONFIG_ADD = ['install', '-g']
  const PACKAGE_MANAGER_CONFIG_ADD = {
    npm: PACKAGE_MANAGER_NPM_CONFIG_ADD,
    yarn: ['global', 'add']
  }
  if (!SUPPORTED_PACKAGE_MANAGER.includes(pkgManager)) {
    console.log()
    console.log(
      chalk.red(
        `Unknown package manager ${chalk.yellow(
          pkgManager
        )}, package manager must be one of ${chalk.yellow(SUPPORTED_PACKAGE_MANAGER.join(','))}`
      )
    )
    process.exit(1)
  }
  // if (pkgManager === 'pnpm') {
  //   if (hasPnpm3OrLater()) {
  //     PACKAGE_MANAGER_CONFIG_ADD.pnpm = PACKAGE_MANAGER_NPM_CONFIG_ADD
  //   } else {
  //     process.exit(1)
  //   }
  // }
  const pkgName = `@djp6/tpl-${templateName}`
  const exitCode = await executeCommand(pkgManager, [
    ...PACKAGE_MANAGER_CONFIG_ADD[pkgManager],
    `${pkgName}@1.x`
  ])
  if (exitCode === 0) {
    const pkgPath = globalDirs[pkgManager].packages + '/' + pkgName + '/package.json'

    if (fs.existsSync(pkgPath)) {
      const buffer = fs.readFileSync(pkgPath)
      const version = JSON.parse(buffer.toString()).version

      console.log()
      console.log('🎉  ' + chalk.green(`Template ${templateName}@${version} installed.`))
    }
  }
}

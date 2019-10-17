const pkg = require('../../package.json')
const { name: pkgName, version: local } = pkg
const execSync = require('child_process').execSync
const chalk = require('chalk')
const semver = require('semver')

function checkForUpdate() {
  console.log('Checking for update...')
  const lts = execSync(`npm view ${pkgName} version --registry=https://registry.npmjs.org`) + ''
  if (semver.lt(local, lts)) {
    console.log(
      chalk.yellow(
        `Your cli version is out of date, the latest version is ${lts}. ` +
          `Run "npm install -g ${pkgName}@latest" to upgrade it is recommended`
      )
    )
  }
}

checkForUpdate()

module.exports = checkForUpdate

const semver = require('semver')
const execSync = require('child_process').execSync
const chalk = require('chalk')

let _hasPnpm
let _pnpmVersion

function getPnpmVersion() {
  if (_pnpmVersion) {
    return _pnpmVersion
  }
  try {
    _pnpmVersion = execSync('pnpm --version', {
      stdio: ['pipe', 'pipe', 'ignore']
    }).toString()
    // there's a critical bug in pnpm 2, so pnpm >= 3.0.0 is more stable to support
    // https://github.com/pnpm/pnpm/issues/1678#issuecomment-469981972
    _hasPnpm = true
  } catch (e) {}
  return _pnpmVersion || '0.0.0'
}

function hasPnpmVersionOrLater(version) {
  return semver.gte(getPnpmVersion(), version)
}

function hasPnpm3OrLater() {
  const has3OrLater = hasPnpmVersionOrLater('3.0.0')
  if (!has3OrLater && _pnpmVersion) {
    console.log()
    console.log(
      chalk.red(
        `Your pnpm version ${chalk.yellow(
          _pnpmVersion.replace(/(?:\n|\n\r)+/g, '')
        )} is extremely out of date, pnpm >= 3.0.0 is required.`
      )
    )
  }
  if (!_hasPnpm) {
    console.log()
    console.log(chalk.red(`You must install pnpm >= 3.0.0 first!`))
  }
  return has3OrLater
}

exports.getPnpmVersion = getPnpmVersion
exports.hasPnpmVersionOrLater = hasPnpmVersionOrLater
exports.hasPnpm3OrLater = hasPnpm3OrLater

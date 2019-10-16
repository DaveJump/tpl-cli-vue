const execa = require('execa')

module.exports = async function executeCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = execa(command, args, { cwd, stdio: 'inherit' })

    child.on('close', code => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(' ')}`)
      }
      resolve(code)
    })
  })
}

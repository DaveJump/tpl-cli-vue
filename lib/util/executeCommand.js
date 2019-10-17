const execa = require('execa')

module.exports = async function executeCommand(
  command,
  args,
  stdio = 'inherit',
  cwd = process.cwd()
) {
  return new Promise(async (resolve, reject) => {
    if (stdio === 'inherit') {
      const child = execa(command, args, { cwd, stdio })

      child.on('close', code => {
        if (code !== 0) {
          reject(`command failed: ${command} ${args.join(' ')}`)
        }
        resolve(code)
      })
    } else if (stdio === 'pipe') {
      const { exitCode, stdout, stderr } = await execa(command, args, { cwd, stdio })

      if (exitCode !== 0) {
        reject(`command failed: ${command} ${args.join(' ')}`)
      }
      resolve({ exitCode, stdout, stderr })
    }
  })
}

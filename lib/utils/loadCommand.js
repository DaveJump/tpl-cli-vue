const fs = require('fs')
const path = require('path')

module.exports = function loadCommand(command) {
  return new Promise((resolve, reject) => {
    const commandDirPath = path.resolve(__dirname, '../commands/')
    const commandFilePath = commandDirPath + `/${command}.js`

    if (fs.existsSync(commandFilePath)) {
      resolve(require(commandFilePath))
    } else {
      reject(new Error('Can not find command executing file!'))
    }
  })
}

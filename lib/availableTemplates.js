const templates = [
  {
    name: 'mobile',
    version: '^1.0.0',
    description: 'For mobile application, implemented by Vant'
  },
  {
    name: 'desktop',
    version: '^1.0.0',
    description: 'For desktop(PC) application, implemented by element-ui'
  }
]

exports.templates = templates
exports.names = templates.map(tpl => tpl.name)
exports.nameStrings = exports.names.join(',')

const fs = require('fs')
const path = require('path')

module.exports = args => {
  const buildIndex = args.indexOf('--build')
  const build = buildIndex === -1 ? false : true
  if (build) {
    args.splice(buildIndex, 1)
  }

  const src = args[0] || '.'
  const port = Number(args[1]) || 80

  const basedir = path.resolve(process.cwd(), src)

  const isDir = fs.statSync(basedir).isDirectory()
  if (!isDir)
    return console.log('src is not dir')

  process.env.BASEDIR = basedir
  process.env.PORT = port
  process.env.BUILD = build

  require('./index')
}
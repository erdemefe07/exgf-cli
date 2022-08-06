const { paths } = require('./state')
const fs = require('fs')
const path = require('path')

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const scripts = ['https://unpkg.com/mitt/dist/mitt.umd.js']

if (process.env.BUILD === 'false') {
  scripts.push('~exgf/exgf.js')
  scripts.push('https://cdn.socket.io/4.5.0/socket.io.min.js')
  scripts.push('~exgf/connect.js')
}

function injectScripts(html, extraScripts) {
  if (extraScripts)
    scripts.push(extraScripts)

  const dom = new JSDOM(html);
  const document = dom.window.document

  scripts.forEach(src => {
    const script = document.createElement('script')
    script.src = src
    document.body.appendChild(script)
  })

  return prettify(dom.serialize())
}

function prettify(html) {
  return require('pretty')(html, { ocd: true })
}

function exgf(html, dir) {
  const regex = /<exgf\s+path="[^"]*"\s{0,}\/>/g

  for (const part of html.matchAll(regex)) {
    const line = part[0]
    const bind = line.match(/"[^"]*"/)[0].slice(1, -1)
    const bindPath = path.resolve(dir, bind)
    paths.push(bindPath.replace(process.env.BASEDIR, '').slice(1))
    const bindDir = path.dirname(bindPath)
    const componentIndex = fs.readFileSync(bindPath, { encoding: 'utf-8' })
    const component = exgf(componentIndex, bindDir)
    html = html.replaceAll(line, component)
  }
  return html
}

function render(file) {
  const indexPath = path.resolve(process.env.BASEDIR, file)
  let index = fs.readFileSync(indexPath, { encoding: 'utf-8' })
  const html = exgf(index, process.env.BASEDIR)
  return injectScripts(html, process.env.BUILD === 'true' ? 'js/exgf.js' : undefined)
}

module.exports = {
  render
}
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const fs = require('fs-extra')
const path = require('path')

const { render } = require('./util.js')

app.get('/', (req, res) => {
  const rendered = render('index.html')
  res.send(rendered)
})

app.get('/~exgf/connect.js', (req, res) => {
  res.contentType('application/javascript')
  const scriptPath = path.resolve(__dirname, 'connect.js')
  res.send(fs.readFileSync(scriptPath, { encoding: 'utf-8' }))
})


app.get('/~exgf/exgf.js', (req, res) => {
  res.contentType('application/javascript')
  const scriptPath = path.resolve(__dirname, 'exgf.js')
  res.send(fs.readFileSync(scriptPath, { encoding: 'utf-8' }))
})

app.use(express.static(process.env.BASEDIR))

io.on('connection', (socket) => {
  fs.watch(process.env.BASEDIR, { recursive: true }, () => {
    socket.emit('refresh')
  })
});

if (process.env.BUILD === 'false') {
  server.listen(process.env.PORT, () => {
    console.log('listening on http://localhost:' + process.env.PORT);
  });
}
else {
  const { paths } = require('./state')
  const rendered = render('index.html')
  const buildPath = path.resolve(process.env.BASEDIR, 'dist')
  const jsPath = path.resolve(buildPath, 'js')

  const indexPath = path.resolve(buildPath, 'index.html')
  const exgfJsPath = path.resolve(__dirname, 'exgf.js')
  const exgfJsBuildPath = path.resolve(jsPath, 'exgf.js')
  const exgfJs = fs.readFileSync(exgfJsPath, { encoding: 'utf-8' })

  fs.removeSync(buildPath)
  fs.mkdirpSync(buildPath)

  const dirents = fs.readdirSync(process.env.BASEDIR)
  dirents.forEach(dirent => {
    try {
      const direntPath = path.resolve(process.env.BASEDIR, dirent)
      const toPath = path.resolve(buildPath, dirent)
      fs.copySync(direntPath, toPath)
    } catch (error) {
    }
  })

  fs.mkdirpSync(jsPath)
  fs.writeFileSync(indexPath, rendered)
  fs.writeFileSync(exgfJsBuildPath, exgfJs)

  paths.forEach(file => {
    file = path.resolve(buildPath, file)
    fs.removeSync(file)
  });

  cleanEmptyFoldersRecursively(buildPath)
}

function cleanEmptyFoldersRecursively(folder) {
  var fs = require('fs');
  var path = require('path');

  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function (file) {
      var fullPath = path.join(folder, file);
      cleanEmptyFoldersRecursively(fullPath);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }

  if (files.length == 0) {
    fs.rmdirSync(folder);
    return;
  }
}
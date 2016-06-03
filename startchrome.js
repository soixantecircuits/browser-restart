'use strict'
// var launcher = require('james-browser-launcher')
var express = require('express')
var path = require('path')
var fs = require('fs')
var loki = require('lokijs')
var bodyParser = require('body-parser')
const fkill = require('fkill')
const exec = require('child_process').exec
// Backend Config
var serverConfig = require('./config.js')

// Loki Database
var savedDb = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
var db = new loki(path.join(__dirname, 'data.json'))
db.loadJSON(savedDb)
var config = db.getCollection('config')
// Config from Database
var port
var delayStart = 5000
var checkerDelay
var startURL
var autostart
var browserBucketOptions = {
  browser: 'chrome',
  detached: true,
  options: []
}

var formatBrowserArgs = function () {
  var stringArgs = config.findOne({ name: 'browser args' }).value
  var optArray = stringArgs.split(' ')
  return optArray
}

var updateDatabase = function () {
  port = config.findOne({ name: 'port' }).value
  delayStart = 5000
  checkerDelay = config.findOne({ name: 'checkerDelay' }).value // * 1000
  startURL = config.findOne({ name: 'startURL' }).value
  autostart = config.findOne({ name: 'autostart' }).value
  browserBucketOptions.options = formatBrowserArgs()
}
var saveDatabase = function (updateChrome) {
  db.save(function () {
    updateDatabase()
    // Restart Express server
    stopExpressServer()
    startExpressServer()
    // Restart Socket.io server
    stopSocketIOServer()
    startSocketIOServer()
    if (updateChrome) {
      startChrome()
    }
  })
}

var electron = require('electron')
var electronApp = electron.app
var BrowserWindow = electron.BrowserWindow
// const crashReporter = require('electron').crashReporter
// crashReporter.start()
var mainWindow = null

electronApp.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})
electronApp.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    minWidth: 800,
    title: 'Browser Restart'
  })

  mainWindow.loadURL('http://localhost:' + port)
  if (serverConfig.devMode) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.on('closed', function () {
    mainWindow = null
  })
})

// Express server
var app
var server
var startExpressServer = function () {
  app = express()
  server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
  })

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'jade')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  app.get('/', function (req, res) {
    var socketAdress = (server.address().address !== '::') ? server.address().address : 'localhost'
    socketAdress += ':' + port
    res.render('config', {
      title: 'Config - Browser Restart', socketAdress: socketAdress, config: {
        socketIOServerPort: port,
        startURL: startURL,
        autostart: autostart,
        checkerDelay : config.findOne({ name: 'checkerDelay' }).value, //* 1000,
        'browser args': config.findOne({ name: 'browser args' }).value
      }
    })
  })

  app.get('/restart.js', function (req, res) {
    console.log("Restart.js accessed")
    var socketIOClient = fs.readFileSync(__dirname + '/public/js/socket.io.js', 'utf-8')
    var restartFile = fs.readFileSync(__dirname + '/public/js/restart.js', 'utf-8')
    var address = (server.address().address !== '::') ? server.address().address : 'localhost'
    restartFile = restartFile.replace('[[config.address]]', address)
    restartFile = restartFile.replace('[[config.port]]', port)
    res.send(socketIOClient + restartFile)
  })
  app.post('/update-conf', function (req, res) {
    for (var property in req.body) {
      if (req.body.hasOwnProperty(property)) {
        if (config.findOne({ name: property })) {
          var configItem = config.findOne({ name: property })
          configItem.value = req.body[property]
          config.update(configItem)
        } else {
          config.insert({ name: property, value: req.body[property] })
        }
      }
    }
    saveDatabase(true)
    res.sendStatus(200)
  })
}
var stopExpressServer = function () {
  server.close()
  server = undefined
  app = undefined
}
// Variables for io events and startChrome function
var restartChromeTimeout
var emitInterval
// var launchedInstance

// Socket io Part
var io
var startSocketIOServer = function () {
  io = require('socket.io')(server)
  io.on('connection', function (socket) {
    clearInterval(emitInterval)
    emitInterval = setInterval(function checkStatus () {
      console.log('server - ping')
      socket.emit('ping', { time: new Date() })
      startChrome()
    }.bind(socket), checkerDelay) 

    socket.on('pong', function (data) {
      console.log('pong')
      clearTimeout(restartChromeTimeout)
    })
  })
}
var stopSocketIOServer = function () {
  io = undefined
}
// Start chrome part
var startChrome = function () {
  restartChromeTimeout = setTimeout(function startingChrome () {
    fkill('Google Chrome')
    console.log('Starting chrome')
    startURL = config.findOne({ name: 'startURL' }).value
    var child = exec('batch.bat', //batch.bat (Win) sh chrome.sh on (Linux) linux or osx 
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout)
      console.log('Instance started with PID:', child.pid)
      child.on('stop', function (code) {
        console.log('Instance ' + child.pid + ' stopped with exit code:', code)
      })
      if (stderr !== null) {
        console.log('stderr: ' + stderr)
      }
      if (error !== null) {
        console.log('exec error: ' + error)
        child.kill()
      }
    }
  )

    console.log('Instance started with PID:', child.pid)
    child.on('stop', function (code) {
      console.log('Instance ' + child.pid + ' stopped with exit code:', code)
    })
  }, delayStart)
}

updateDatabase()
startExpressServer()
startSocketIOServer()
if (autostart) {
  startChrome()
}

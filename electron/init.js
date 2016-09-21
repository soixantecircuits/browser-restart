const path = require('path')
const launcher = require('james-browser-launcher')
const fkill = require('fkill')
const myvalue = require('../settings/new_data.json')
const {ipcMain} = require('electron')
const fs = require('fs')
var https = require('https')

var chromeDelay = 3000
var myport = myvalue.port
var startURL = myvalue.startURL
var checkDelay = myvalue.checkDelay
var certPath = myvalue.certPath
var httpsPort = 3434
var restartChromeTimeout
var emitInterval
var launchedInstance
var browserBucketOptions = {
  browser: 'chrome',
  detached: true,
  options: []
}
var express = require('express')
var server
var serverHttps
var ap
var io
var einterval

var startExpressServer = function () {
  ap = express()
  server = ap.listen(myport, function (err) {
    var host = server.address().address
    var port = server.address().port
    console.log('Restart app listening at http://%s:%s', host, port)
    if (err) {
      console.log(err)
    }
  })

  ap.get('/restart.js', function (req, res) {
    var socketIOClient = fs.readFileSync(__dirname + '/../socket.io.js', 'utf-8')
    var restartFile = fs.readFileSync(__dirname + '/../restart.js', 'utf-8')
    var address = (server.address().address !== '::') ? server.address().address : 'localhost'
    restartFile = restartFile.replace('[[config.address]]', address)
    restartFile = restartFile.replace('[[config.port]]', myport)
    res.send(socketIOClient + restartFile)
  })
}
var stopExpressServer = function () {
  server.close()
  server = undefined
  ap = undefined
}

var startSocketIOServer = function () {
  io = require('socket.io')(server)
  io.on('connection', function (socket) {
    clearInterval(einterval)
    einterval = setInterval(function checkStatus () {
      console.log('server - ping')
      socket.emit('go')
      startChrome()
    }.bind(socket), checkDelay)
    socket.on('back', function () {
      console.log('pong')
      clearTimeout(restartChromeTimeout)
    })
  })
}

var stopSocketIOServer = function () {
io = undefined
}

var startChrome = function () {
  restartChromeTimeout = setTimeout(function startingChrome () {
    fkill('Google Chrome')
    console.log('Starting chrome')
    launcher(function (err, launch) {
      if (err) {
        return console.error(err)
      }
      console.log('starting on: ', startURL)
      launch(startURL, browserBucketOptions, function (err, instance) {
        if (err) {
          return console.error(err)
        }
        launchedInstance = instance
        console.log('Instance started with PID:', instance.pid)

        instance.on('stop', function (code) {
          console.log('Instance ' + instance.pid + ' stopped with exit code:', code)
        })
      })
    })
  }, chromeDelay)
}

function initBrowserRestart () {
  ipcMain.on('butpressed', (event, mystartURL, theport, mycheckdelay) => {
    startURL = mystartURL
    myport = theport
    checkDelay = mycheckdelay
    stopExpressServer()
    stopSocketIOServer()
    startExpressServer()
    startSocketIOServer()
    startChrome()
  })
  startExpressServer()
  startSocketIOServer()
  startChrome()
}

exports.init = initBrowserRestart

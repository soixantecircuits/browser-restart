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
var httpsPort = myvalue.httpsPort
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

  var privateKey = fs.readFileSync(__dirname + '/../cert/key.pem', 'utf-8')
  var certificate = fs.readFileSync(__dirname + '/../cert/cert.pem', 'utf-8')
var credentials = {key: privateKey, cert: certificate, passphrase: 'my-passphrase'}

serverHttps = https.createServer(credentials, ap)

serverHttps.listen(httpsPort, function(err){
  var host = serverHttps.address().address
  console.log('Restart *secure* app listening at https://%s:%s', host, httpsPort)
})
ap.get('/', function (req, res) {
  res.send("Back to Electron")
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
  serverHttps.close()
  serverHttps = undefined
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
      //IPC renderer ok Stable
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
        //ipcMAin off status
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

const path = require('path')
const launcher = require('james-browser-launcher')
const fkill = require('fkill')
const fs = require('fs')
var https = require('https')
var elem = require('./browserRestart.js')

var checkDelay = elem.checkDelay
var startURL = elem.startURL
var myport = elem.myport
var chromeDelay = 3000
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
    einterval = setInterval(function checkStatus() {
      console.log('server - ping')
      socket.emit('go')
      //startChrome()
      elem.mystartChrome()
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

exports.startSocketIO = startSocketIOServer
exports.stopSocketIO = stopSocketIOServer
exports.startExpress = startExpressServer
exports.stopExpress = stopExpressServer

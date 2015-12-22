var launcher = require( 'browser-launcher2' )
var express = require('express');
var fs = require('fs')
var loki = require('lokijs')


// Loki Database
var savedDb = fs.readFileSync('data.json', 'utf8')
var db = new loki('data.json')
db.loadJSON(savedDb);
var config = db.getCollection('config')
// Config from Database
var port = config.findOne({name: 'port'}).value
var delayStart = config.findOne({name: 'delayStart'}).value * 1000
var checkerDelay = config.findOne({name: 'checkerDelay'}).value * 1000
var startURL = config.findOne({name: 'startURL'}).value


// Express server
var app = express();
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var restartChromeTimeout
var emitInterval
var launchedInstance

var browserBucketOptions = {
  browser: 'chrome',
  options: ['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']
}

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500)
      return res.end('Error loading index.html')
    }

    res.writeHead(200)
    res.end(data);
  });
}

var io = require('socket.io')(server)
io.on('connection', function (socket) {
    clearInterval(emitInterval)
    emitInterval = setInterval(function checkStatus(){
      console.log('server - ping')
      socket.emit('ping', { time: new Date })
      startChrome();
    }.bind(socket), checkerDelay)

    socket.on('pong', function (data) {
        console.log('pong')
        clearTimeout(restartChromeTimeout)
    });
});

var startChrome = function(){
    restartChromeTimeout = setTimeout(function startChrome(){
      console.log('Starting chrome')

      if(launchedInstance !== undefined){
        launchedInstance.stop();
        launchedInstance = undefined
      }
      launcher( function( err, launch ) {
        if ( err ) {
            return console.error( err )
        }

        launch(startURL, browserBucketOptions, function( err, instance ) {
            if ( err ) {
                return console.error( err )
            }
            launchedInstance = instance;
            console.log( 'Instance started with PID:', instance.pid )

            instance.on( 'stop', function( code ) {
                console.log( 'Instance stopped with exit code:', code )
            } );
        } );
      } );
    }, delayStart)
}

// startChrome();
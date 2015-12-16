var launcher = require( 'browser-launcher2' )
var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var fs = require('fs')

var port = 3000
var delayStart = 1000
var checkerDelay = 10000
var startURL = 'http://codepen.io/gabrielstuff/pen/addjao'

app.listen(port)

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

startChrome();
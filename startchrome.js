var launcher = require( 'browser-launcher2' )
var express = require('express')
var path = require('path')
var fs = require('fs')
var loki = require('lokijs')
var bodyParser = require('body-parser')

// Loki Database
var savedDb = fs.readFileSync('data.json', 'utf8')
var db = new loki('data.json')
db.loadJSON(savedDb);
var config = db.getCollection('config')
// Config from Database
var port
var delayStart
var checkerDelay
var startURL
var autostart
var updateDatabase = function(){
  port = config.findOne({name: 'port'}).value
  delayStart = config.findOne({name: 'delayStart'}).value * 1000
  checkerDelay = config.findOne({name: 'checkerDelay'}).value * 1000
  startURL = config.findOne({name: 'startURL'}).value
  autostart = (config.findOne({name: 'autostart'})) ? config.findOne({name: 'autostart'}).value : false
}
updateDatabase()

// Express server
var app = express();
var server = app.listen(port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  var socketAdress = (server.address().address !== '::') ? server.address().address : 'localhost'
  socketAdress += ':'+port
  res.render('config', { title: 'Config - Browser Restart', socketAdress: socketAdress, config: {
    socketIOServerPort: port,
    startURL: startURL,
    autostart: autostart
  }})
})
app.get('/restart.js', function(req, res){
  var restartFile = fs.readFileSync(__dirname+'/public/js/restart.js', 'utf-8');
  var address = (server.address().address !== '::') ? server.address().address : 'localhost'
  restartFile = restartFile.replace('[[config.address]]', address)
  restartFile = restartFile.replace('[[config.port]]', port)
  res.send(restartFile)
})
app.post('/update-conf', function(req, res){
  for (var property in req.body) {
    if (req.body.hasOwnProperty(property)) {
      if(config.findOne({name: property})){
        var configItem = config.findOne({name: property})
        configItem.value = req.body[property]
        config.update(configItem)
        db.save(updateDatabase)
      }
    }
  }
  res.sendStatus(200);
})

// Start Chrome 
var restartChromeTimeout
var emitInterval
var launchedInstance

var browserBucketOptions = {
  browser: 'chrome',
  options: ['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']
}

// Socket io Part
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
})
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
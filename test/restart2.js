var io
io = require('socket.io')('http://localhost:9966')
io.sockets.on('connection', function (socket) {
socket.on('go', function(){
  console.log('receive go')
  socket.emit('back')
})
})

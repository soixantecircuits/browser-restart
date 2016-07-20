var socket = io('wss://[[config.address]]:[[config.port]]');
socket.on('ping', function(data) {
  console.log(data)
  socket.emit('pong', {
    my: data
  })
})

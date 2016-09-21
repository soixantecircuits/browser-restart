var socket = io('http://[[config.address]]:[[config.port]]');
socket.on('go', function(){
  console.log('receive go')
  socket.emit('back')
})

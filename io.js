module.exports = function(io) {
  
  io.on('connection', function(socket) {
    socket.join(socket.user_id)
    console.log(`Client ${socket.client_id} of User ${socket.user_id} connected`)

    
  })
}
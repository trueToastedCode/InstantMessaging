const messageDb = require('./db/message')
const clientDb = require('./db/client')
const clientSendQueueDb = require('./db/client_send_queue')

module.exports = function(io) {
  
  io.on('connection', function(socket) {
    socket.join(socket.user_id)
    console.log(`Client ${socket.client_id} of User ${socket.user_id} connected`)

    socket.on('sendMsg', async function (_msg) {
      try {
        const msg = await messageDb.createMessage(socket.user_id, _msg.receiver_id, _msg.data)
        const clients = await clientDb.getClientsOfUser(socket.user_id)
        for (client of clients)
          await clientSendQueueDb.createMessage(client.id, msg.id)
        io.to(socket.user_id).emit('msgOnServer', msg.id)
      } catch {}
    })
  })
}
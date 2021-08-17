const messageDb = require('./db/message')
const clientDb = require('./db/client')
const clientSendQueueDb = require('./db/client_send_queue')

module.exports = function(io) {
  
  function emitMsgOnServer(userId, msgId) {
    io.to(userId).emit('msgOnServer', msgId)
  }

  async function emitSendQueue(userId, clientId) {
    const sendQueue = await clientSendQueueDb.getQueue(clientId)
    for (msgId of sendQueue)
      emitMsgOnServer(userId, msgId)
  }

  io.on('connection', function(socket) {
    socket.join(socket.user_id)
    console.log(`Client ${socket.client_id} of User ${socket.user_id} connected`)

    emitSendQueue(socket.user_id, socket.client_id);

    socket.on('sendMsg', async function (_msg) {
      try {
        const msg = await messageDb.createMessage(socket.user_id, _msg.receiver_id, _msg.data)
        const clients = await clientDb.getClientsOfUser(socket.user_id)
        for (client of clients)
          await clientSendQueueDb.createMessage(client.id, msg.id)
        emitMsgOnServer(socket.user_id, msg.id)
      } catch {}
    })

    socket.on('msgSendOnClient', async function (msg_id) {
      await clientSendQueueDb.rmMessage(socket.client_id, msg_id)
    })
  })
}
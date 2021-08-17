const messageDb = require('./db/message')
const clientDb = require('./db/client')
const clientSendQueueDb = require('./db/client_send_queue')

module.exports = function(io) {
  
  /**
   * Notifies all clients of users that a sended message has been stored the server
   * @param {*} userId 
   * @param {*} msgId 
   */
  function emitMsgOnServer(userId, msgId) {
    io.to(userId).emit('msgOnServer', msgId)
  }

  /**
   * Notifies clients that one of the client of a user has send a message.
   * emitMsgOnServerWithData in comparison to emitSendQueue means that the actual message is included
   * for clients that dont have the message in their local storage
   * @param {*} socket 
   * @param {*} msg 
   */
  function emitMsgOnServerWithData(socket, msg) {
    socket.emit('msgOnServerWithData', msg)
  }

  /**
   * Notifies clients that one of the client of a user has send a message.
   * @param {*} userId 
   * @param {*} clientId 
   */
  async function emitSendQueue(userId, clientId) {
    const sendQueue = await clientSendQueueDb.getQueue(clientId)
    for (msgId of sendQueue)
      emitMsgOnServer(userId, msgId)
  }

  io.on('connection', function(socket) {
    socket.join(socket.user_id)
    console.log(`Client ${socket.client_id} of User ${socket.user_id} connected`)

    // send the queue/s so the client can syncronize
    try {
      emitSendQueue(socket.user_id, socket.client_id);
    } catch(err) {
      console.log(err);
    }

    // client sends a message to user
    socket.on('sendMsg', async function (_msg) {
      try {
        const msg = await messageDb.createMessage(socket.user_id, _msg.receiver_id, _msg.data)
        const clients = await clientDb.getClientsOfUser(socket.user_id)
        for (client of clients)
          await clientSendQueueDb.createMessage(client.id, msg.id)
        emitMsgOnServer(socket.user_id, msg.id)
      } catch(err) {
        console.log(err)
      }
    })

    // the client asks the server to resend the info about a sended message of itself or another client of the parent user
    // that a sended message has been stored the server with the actual data of the message
    socket.on('emitMsgOnServerWithData', async function (msg_id) {
      try {
        const msg = await messageDb.getMessageById(msg_id)
        if (msg) emitMsgOnServerWithData(socket, msg);
      } catch(err) {
        console.log(err)
      }
    })
    
    // the client notifes the server that it has syncronized a sended message of itself or another client of the parent user
    socket.on('msgSendOnClient', async function (msg_id) {
      try {
        await clientSendQueueDb.rmMessage(socket.client_id, msg_id)
      } catch(err) {
        console.log(err)
      }
    })
  })
}
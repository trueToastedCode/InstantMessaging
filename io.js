const knex = require('./db/knex')
const messageDb = require('./db/message')
const clientDb = require('./db/client')
const clientSendQueueDb = require('./db/client_send_queue')
const clientReceiveQueueDb = require('./db/client_receive_queue')

module.exports = function(io) {
  
  /**
   * Notifies all clients of users that a sended message has been stored the server
   * @param {*} userId 
   * @param {*} msgId 
   */
  function emitUserMsgOnServer(userId, msgId) {
    io.to(userId).emit('msgOnServer', msgId)
  }

  /**
   * Notifies all clients of users that a sended message has been stored the server
   * @param {*} userId 
   * @param {*} msgId 
   */
   function emitSocketMsgOnServer(socket, msgId) {
    socket.emit('msgOnServer', msgId)
  }

  /**
   * Notifies clients that one of the client of a user has send a message.
   * emitMsgOnServerWithData in comparison to emitSendQueue means that the actual message is included
   * for clients that dont have the message in their local storage
   * @param {*} socket 
   * @param {*} msg 
   */
  function emitSocketMsgOnServerWithData(socket, msg) {
    socket.emit('msgOnServerWithData', msg)
  }

  /**
   * Notifies clients about a message to it
   * @param {*} userId 
   * @param {*} msg 
   */
  function emitUserMsgsReceive(userId, msgs) {
    if (msgs === undefined || msgs.length == 0) return
    io.to(userId).emit('msgsReceive', msgs)
  }

  /**
   * Notifies client about a message to it
   * @param {*} userId 
   * @param {*} msg 
   */
  function emitSocketMsgsReceive(socket, msgs) {
    if (msgs === undefined || msgs.length == 0) return
    socket.emit('msgsReceive', msgs)
  }

  /**
   * Notifies client about send queue
   * @param {*} userId 
   * @param {*} clientId 
   */
  async function emitSendQueue(socket, clientId) {
    const sendQueue = await clientSendQueueDb.getQueue(clientId)
    for (msgId of sendQueue)
      emitSocketMsgOnServer(socket, msgId)
  }

  /**
   * Notifies clients that one of the client of a user has send a message.
   * @param {*} userId 
   * @param {*} clientId 
   */
   async function emitReceiveQueue(socket, clientId) {
      const sendQueue = await clientReceiveQueueDb.getQueue(clientId)
      const msgs = [];
      for (msgId of sendQueue) {
        const msg = await messageDb.getMessageById(msgId)
        if (!msg) throw Exception('Message in send queue unrelated to an actual messaeg')
        msgs.push(msg)
      }
      emitSocketMsgsReceive(socket, msgs)
    }

  io.on('connection', function(socket) {
    socket.join(socket.user_id)
    console.log(`Client ${socket.client_id} of User ${socket.user_id} connected`)

    // send the queue/s so the client can syncronize
    try {
      emitSendQueue(socket, socket.client_id);
    } catch(err) {
      console.log(err);
    }
    try {
      emitReceiveQueue(socket, socket.client_id);
    } catch(err) {
      console.log(err);
    }

    // client sends a message to user
    socket.on('sendMsg', async function (_msg) {
      try {
        const msg = await messageDb.createMessage(socket.user_id, _msg.receiver_id, _msg.data)
        const clients = await knex.transaction(function (trx) {
          return Promise.all([
            clientDb.getClientsOfUserQuery(socket.user_id).transacting(trx),
            clientDb.getClientsOfUserQuery(msg.receiver_id).transacting(trx)
          ])
        })
        await knex.transaction(function (trx) {
          return Promise.all([
            clientSendQueueDb
                .createMessagesQuery(clients[0].map(client => client.id), msg.id)
                .transacting(trx),
            clientReceiveQueueDb
                .createMessagesQuery(clients[1].map(client => client.id), msg.id)
                .transacting(trx),
          ])
        })
        emitUserMsgOnServer(socket.user_id, msg.id)
        emitUserMsgsReceive(msg.receiver_id, [msg])
      } catch(err) {
        console.log(err)
      }
    })

    // the client asks the server to resend the info about a sended message of itself or another client of the parent user
    // that a sended message has been stored the server with the actual data of the message
    socket.on('emitMsgOnServerWithData', async function (msg_id) {
      try {
        const msg = await messageDb.getMessageById(msg_id)
        if (msg) emitSocketMsgOnServerWithData(socket, msg);
      } catch(err) {
        console.log(err)
      }
    })
    
    // the client notifies the server that it has syncronized a sended message of itself or another client of the parent user
    socket.on('msgSendOnClient', async function (msg_id) {
      try {
        await clientSendQueueDb.rmMessage(socket.client_id, msg_id)
      } catch(err) {
        console.log(err)
      }
    })

    // the client notifies the server that it has syncronized a sended message by another user to it
    socket.on('msgsReceived', async function (msg_ids) {
      try {
        await knex.transaction(function (trx) {
          return Promise.all(JSON.parse(msg_ids)
              .map(msg_id => clientReceiveQueueDb
                  .rmMessageQuery(socket.client_id, msg_id)
                  .transacting(trx)))
        })
      } catch(err) {
        console.log(err)
      }
    })
  })
}
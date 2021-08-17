const knex = require('./knex')
const undefinied = require('./../helpers/undefined')

function createMessage(client_id, message_id) {
  const message = {
    client_id: client_id,
    message_id: message_id
  }
  return knex('client_send_queues').insert(message)
}

function rmMessage(client_id, message_id) {
  return knex('client_send_queues')
      .del()
      .where('client_id', client_id)
      .where('message_id', message_id)
}

async function getQueue(client_id) {
  const queue = await knex('client_send_queues').where('client_id', client_id)
  return undefinied(queue) ? [] : queue.map(message => message.message_id)
}

module.exports = {
  createMessage,
  rmMessage,
  getQueue
}
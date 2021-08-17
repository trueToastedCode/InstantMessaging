const knex = require('./knex')
const undefinied = require('./../helpers/undefined')

async function createMessage(client_id, message_id) {
  const message = {
    client_id: client_id,
    message_id: message_id
  }
  await knex.transaction(function (trx) {
    return knex('client_send_queues')
        .insert(message)
        .transacting(trx)
  })
  return message
}

async function rmMessage(client_id, message_id) {
  await knex.transaction(function (trx) {
    return knex('client_send_queues')
        .del()
        .where('client_id', client_id)
        .where('message_id', message_id)
        .transacting(trx)
  })
}

async function getQueue(client_id) {
  const queue = await knex.transaction(function (trx) {
    return knex('client_send_queues')
        .where('client_id', client_id)
        .transacting(trx)
  })
  return undefinied(queue) ? [] : queue.map(message => message.message_id)
}

module.exports = {
  createMessage,
  rmMessage,
  getQueue
}
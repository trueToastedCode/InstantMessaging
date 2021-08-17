const knex = require('./knex')
const undefinied = require('./../helpers/undefined')

function createMessagesQuery(client_ids, message_id) {
  const k = knex('client_send_queues');
  for (client_id of client_ids)
    k.insert({
      client_id: client_id,
      message_id: message_id
    })
  return k
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
  createMessagesQuery,
  rmMessage,
  getQueue
}
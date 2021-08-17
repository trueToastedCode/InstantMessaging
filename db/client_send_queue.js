const knex = require('./knex')
const undefinied = require('./../helpers/undefined')
const tstamp = require('./../helpers/tstamp')
const uuid = require('./../helpers/uuid')
const userDb = require('./user')

function createMessage(client_id, message_id) {
  const message = {
    client_id: client_id,
    message_id: message_id
  }
  return knex('client_send_queues').insert(message)
}

module.exports = {
  createMessage
}
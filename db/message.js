const knex = require('./knex')
const undefinied = require('./../helpers/undefined')
const tstamp = require('./../helpers/tstamp')
const uuid = require('./../helpers/uuid')
const userDb = require('./user')

async function createMessage(sender_id, receiver_id, data) {
  const send = await userDb.getUserById(sender_id)
  if (!send) throw Exception('Unknown sender')
  const receiver = await userDb.getUserById(receiver_id)
  if (!receiver) throw Exception('Unknown receiver')
  const message = {
    id: uuid(),
    sender_id: sender_id,
    receiver_id: receiver_id,
    submit_date: tstamp.tstamp(),
    data: data
  }
  await knex.transaction(function (trx) {
    return knex('messages')
        .insert(message)
        .transacting(trx)
  })
  return message
}

function getMessageByIdQuery(id) {
  return knex('messages')
      .where('id', id)
      .first()
  // const message = await knex.transaction(function (trx) {
  //   return knex('messages')
  //       .where('id', id)
  //       .first()
  //       .transacting(trx)
  // })
  // return undefinied(message) ? null : message
}

module.exports = {
  createMessage,
  getMessageByIdQuery
}
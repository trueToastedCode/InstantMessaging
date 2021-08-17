const knex = require('./knex')
const undefinied = require('./../helpers/undefined')
const tstamp = require('./../helpers/tstamp')
const uuid = require('./../helpers/uuid')
const userDb = require('./user')

async function createClient(userId) {
  const user = await userDb.getUserById(userId)
  if (!user) throw Exception('Cant create client with relation to unknown user')
  const now = tstamp.tstamp()
  const client = {
    id: uuid(),
    user_id: userId,
    submit_date: now,
    last_active: now
  }
  await knex('clients').insert(client)
  return client
}

async function getClientById(id) {
  const client = await knex('clients').where('id', id).first()
  return undefinied(client) ? null : client
}

async function getClientsOfUser(user_id) {
  const clients = await knex('clients').where('user_id', user_id)
  return undefinied(clients) ? [] : clients
}

module.exports = {
  createClient,
  getClientById,
  getClientsOfUser
}
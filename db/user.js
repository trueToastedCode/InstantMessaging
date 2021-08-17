const knex = require('./knex')
const bcrypt = require('bcrypt')
const undefinied = require('./../helpers/undefined')
const tstamp = require('./../helpers/tstamp')
const uuid = require('./../helpers/uuid')

async function createUser(username, password) {
  const now = tstamp.tstamp()
  const user = {
    id: uuid(),
    submit_date: now,
    username: username,
    password: await bcrypt.hash(password, 10),
    last_active: now
  }
  await knex.transaction(function (trx) {
    return knex('users')
        .insert(user)
        .transacting(trx)
  })
  return user
}

async function getUserById(id) {
  const user = await knex.transaction(function (trx) {
    return knex('users')
        .where('id', id)
        .first()
        .transacting(trx)
  })
  return undefinied(user) ? null : user
}

async function getUserByUsername(username) {
  const user = await knex.transaction(function (trx) {
    return knex('users')
        .where('username', username)
        .first()
        .transacting(trx)
  })
  return undefinied(user) ? null : user
}

module.exports = {
  createUser,
  getUserById,
  getUserByUsername
}
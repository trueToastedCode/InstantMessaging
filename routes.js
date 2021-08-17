const jwt = require('jsonwebtoken')
const tstamp = require('./helpers/tstamp')
const userDb = require('./db/user')
const clientDb = require('./db/client')

module.exports = function(app) {

  app.post('/users/create', async (req, res) => {
    try {
      const user = await userDb.createUser(req.body.username, req.body.password)
      res.status(201).send({
        id: user.id,
        submit_date: user.submit_date
      })
    } catch {
      res.sendStatus(500)
    }
  })

  app.post('/users/clients/create', async (req, res) => {
    try {
      const client = await clientDb.createClient(req.body.user_id)
      res.status(201).send({
        id: client.id,
        submit_date: client.submit_date
      })
    } catch {
      res.sendStatus(500)
    }
  })

  app.get('/users/clients/io-token', async (req, res) => {
    try {
      const client = await clientDb.getClientById(req.query.client_id)
      if (!client) return res.sendStatus(400)
      const user = await userDb.getUserById(client.user_id)
      if (!user) throw Exception('Unassociated client to user')
      const token = jwt.sign({
        exp: tstamp.tstamp() + 999999999,
        user_id: user.id,
        client_id: client.id
      }, 'SECRET_KEY')
      res.status(200).send(token)
    } catch {
      res.sendStatus(500)
    }
  })
}
userDb = require('./db/user')

module.exports = function(app) {

  app.post('/users/create', async (req, res) => {
    try {
      const user = await userDb.createUser(req.body.username, req.body.password)
      res.status(201).send({
        id: user.id,
        submit_date: user.submit_date
      })
    } catch(err) {
      console.log(err)
      res.sendStatus(500)
    }
  })
}
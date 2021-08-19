const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const redis = require('socket.io-redis')
const jwt = require('jsonwebtoken')
const tstamp = require('./helpers/tstamp')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
app.disable('x-powered-by')
io.adapter(redis({ host: '127.0.0.1', port: 6379 }));
io.use(function(socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
      if (err) return next(new Error('Authentication error'))
      if (tstamp.tstamp() > decoded.exp) return next(new Error('Authentication error'))
      socket.user_id = decoded.user_id
      socket.client_id = decoded.client_id
      next()
    })
  } else {
    next(new Error('Authentication error'))
  }
})

require('./routes')(app)
require('./io')(io)

const PORT = 3000

server.listen(PORT, () => console.log(`Server now running on port ${PORT}`))

const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const redis = require('socket.io-redis')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
app.disable('x-powered-by')
io.adapter(redis({ host: '192.168.0.10', port: 6379 }));

require('./routes')(app)
require('./io')(io)

const PORT = 3000

server.listen(PORT, () => console.log(`Server now running on port ${PORT}`))

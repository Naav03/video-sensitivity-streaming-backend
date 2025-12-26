
require('dotenv').config()
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cors = require('cors')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

io.on('connection', (socket) => {
  console.log('Client connected')
})

app.set('io', io)

app.use('/api/auth', require('./routes/auth'))
app.use('/api/videos', require('./routes/video'))

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(process.env.PORT || 5000, () => console.log('Server started'))
})

require('dotenv').config()

const express = require('express')
const path = require('path')
const http = require('http')

const app = express()
const server = http.createServer(app)

const socket = require('socket.io')
const io = socket(server, {
    pingInterval: 2000,
    pingTimeout: 4000,
    upgradeTimeout: 5000,
})

const users = {}
const socketToRoom = {}

const roomSize = 22
const PORT = process.env.PORT || 8000

io.on('connection', socket => {
    socket.on('join room', roomID => {
        if (users[roomID]) {
            const length = users[roomID].length
            if (length >= roomSize) {
                socket.emit('room full')
                return
            }
            users[roomID].push(socket.id)
        } else {
            users[roomID] = [socket.id]
        }
        socketToRoom[socket.id] = roomID
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id)
        socket.emit('all users', usersInThisRoom)
    })

    socket.on('sending signal', payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID })
    })

    socket.on('returning signal', payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id })
    })

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id]
        let room = users[roomID]
        if (room) {
            room = room.filter(id => id !== socket.id)
            users[roomID] = room
        }
        socket.broadcast.emit('user left', socket.id)
    })

    socket.on('change', (payload) => {
        socket.broadcast.emit('change', payload)
    })
})

if (process.env.PROD) {
    app.use(express.static(__dirname + '/client/build'))
    app.get('*', (request, response) => {
        response.sendFile(path.join(__dirname, 'client/build/index.html'))
    })
}

server.listen(PORT, () => console.log('server is running...'))



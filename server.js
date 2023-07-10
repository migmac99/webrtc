require('dotenv').config()

const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)

const socket = require('socket.io')
const io = socket(server, {
    pingInterval: process.env.PING_INTERVAL || 2000,
    pingTimeout: process.env.PING_TIMEOUT || 4000,
    upgradeTimeout: process.env.UPGRADE_TIMEOUT || 5000,
})

const rooms = {}

const ROOM_SIZE = process.env.ROOM_SIZE || 22
const PORT = process.env.PORT || 8000
const logs = process.env.LOGS || false

io.on('connection', socket => {
    logs && console.log('Connection from ->', [socket.id])

    socket.on('join room', roomID => {
        if (rooms[roomID]) {
            const length = rooms[roomID].length
            if (length >= ROOM_SIZE) {
                socket.emit('room full')
                return
            }
            rooms[roomID].push(socket.id)
        } else {
            rooms[roomID] = [socket.id]
            logs && console.log('New room ->', roomID)
        }

        const usersInThisRoom = rooms[roomID].filter(id => id !== socket.id)
        socket.emit('all users', usersInThisRoom)
        logs && console.log('Join', roomID, '->', [socket.id])
    })

    socket.on('sending signal', payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID })
    })

    socket.on('returning signal', payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id })
    })

    socket.on('disconnect', () => {
        const roomID = Object.keys(rooms).find(key => rooms[key].includes(socket.id))
        let room = rooms[roomID]
        if (room) {
            room = room.filter(id => id !== socket.id)
            rooms[roomID] = room
        }
        if (rooms[roomID]) {
            if (rooms[roomID].length === 0) {
                delete rooms[roomID]
                logs && console.log('Deleting room ->', roomID)
            }
        }
        socket.broadcast.emit('user left', socket.id)
        logs && console.log('user left', socket.id)
    })

    socket.on('change', (payload) => {
        socket.broadcast.emit('change', payload)
        logs && console.log('change', payload)
    })
})

server.listen(PORT, () => console.log('server is running on port', PORT, '...'))


// For debugging only, not required for production
app.get('/', (req, res) => res.sendFile(__dirname + '/viewRooms.html'))
app.get('/api/rooms', (req, res) => res.send(rooms))
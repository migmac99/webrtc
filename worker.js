const express = require('express')
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

const ROOM_SIZE = 22
const PORT = process.env.PORT || 8000

io.on('connection', socket => {
    socket.on('join room', roomID => {
        if (users[roomID]) {
            const length = users[roomID].length
            if (length >= ROOM_SIZE) {
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

server.listen(PORT, () => console.log('server is running on port', PORT, '...'))


// the code above this line is the same as server.js


// https://WORKER_URL/socket.io/?EIO=3&transport=polling&t=OarKA3K

// convert server.js into a cloudflare worker script (worker.js) that can be deployed to cloudflare workers

// We have access to the following global variables:
// ROOM_SIZE
// KV_STORAGE

// users and socketToRoom are stored in KV_STORAGE

import { Socket } from 'node:socket.io'
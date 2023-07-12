import { useEffect } from 'react'
import Peer from 'simple-peer'

import { c } from '../utils/colors'

export const peerConfig = {
  iceServers: [{
    'urls': [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
    ]
  }]
}

const settings = {
  video: { minFrameRate: 60 },
  audio: false,
}

const logs = process.env.LOGS || true

const prefix = `${c.bright}${c.magenta}[WebRTC]${c.r}`
const p_send = `${prefix} ${c.bright}${c.yellow}[Send]${c.r}`
const p_recv = `${prefix} ${c.bright}${c.cyan}[Recv]${c.r}`

//=============================================================================

export default function StreamConnection({
  roomID,
  userVideo,
  peersRef, socketRef,
  peers, set_peers,
  set_userUpdate,
}) {

  useEffect(() => {
    // console.log(peers.map((peer) => peer.peerID))
    const uniquePeers = []
    peers.forEach((peer) => {
      if (uniquePeers.find((p) => p.peerID === peer.peerID)) {
        console.log(`${prefix} Found duplicate local peer ${c.bright}${c.red}${peer.peerID}${c.r}`)
        // disconnect and reconnect to duplicate peer
      } else uniquePeers.push(peer)
    })

    if (uniquePeers.length === peers.length) return

    console.log(`${prefix} Found and removed duplicate local peer`)
    set_peers(uniquePeers)
  }, [peers, peersRef, set_peers])

  useEffect(() => {
    const oldRef = socketRef.current

    logs && console.log(`${prefix} Creating stream connection`)

    navigator.mediaDevices
      .getUserMedia(settings)
      .then((stream) => {
        userVideo.current.srcObject = stream

        socketRef.current.emit('join room', roomID)
        logs && console.log(`${p_send} Join room ${c.green}${roomID}${c.r}`)

        socketRef.current.on('all users', (users) => {
          // console.log(users)
          const peers = []

          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream, socketRef)
            const peerObj = {
              peerID: userID,
              peer,
            }
            peersRef.current.push(peerObj)
            peers.push(peerObj)
          })

          set_peers(peers)
        })

        socketRef.current.on('user joined', (payload) => {
          logs && console.log(`${p_recv} User Joined`, payload)
          const peer = addPeer(payload.signal, payload.callerID, stream, socketRef)
          const peerObj = {
            peerID: payload.callerID,
            peer,
          }
          peersRef.current.push(peerObj)
          set_peers((users) => [...users, peerObj])
        })

        socketRef.current.on('user left', (id) => {
          logs && console.log(`${p_recv} User Left ${c.red}${id}${c.r}`)
          const peerObj = peersRef.current.find((p) => p.peerID === id)
          if (peerObj) peerObj.peer.destroy()
          const peers = peersRef.current.filter((p) => p.peerID !== id)
          peersRef.current = peers
          set_peers(peers)
        })

        socketRef.current.on('receiving returned signal', (payload) => {
          logs && console.log(`${p_recv} Received returned signal`, payload)
          const item = peersRef.current.find((p) => p.peerID === payload.id)
          item.peer.signal(payload.signal)
        })

        socketRef.current.on('change', (payload) => {
          logs && console.log(`${p_recv} Change`, payload)
          set_userUpdate(payload)
        })
      })


    return () => {
      logs && console.log('close stream')
      oldRef.current.emit('leave room', roomID)
      oldRef.current.off('all users')
      oldRef.current.off('user joined')
      oldRef.current.off('user left')
      oldRef.current.off('receiving returned signal')
      oldRef.current.off('change')
    }
  }, [])

  return null
}

//==================================================================================================

export function createPeer(userToSignal, callerID, stream, socketRef) {
  logs && console.log(`${p_send} Peer Connection Request from ${c.yellow}${callerID}${c.r} to ${c.green}${userToSignal}${c.r}`)

  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: peerConfig,
  })

  peer.on('signal', (signal) => {
    logs && console.log(`${p_recv} Accepted request by ${c.green}${userToSignal}${c.r}`)
    socketRef.current.emit('sending signal', { userToSignal, callerID, signal })
    logs && console.log(`${p_send} Sending signal to ${c.green}${userToSignal}${c.r}`)
  })

  return peer
}

//==================================================================================================

export function addPeer(incomingSignal, callerID, stream, socketRef) {
  logs && console.log(`${prefix} Adding ${c.green}${callerID}${c.r} as peer`)
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
    config: peerConfig,
  })

  peer.on('signal', (signal) => {
    logs && console.log(`${p_recv} Accepted request by ${c.green}${callerID}${c.r}`)
    socketRef.current.emit('returning signal', { signal, callerID })
    logs && console.log(`${p_send} Returning signal to ${c.green}${callerID}${c.r}`)
  })

  peer.signal(incomingSignal)
  return peer
}
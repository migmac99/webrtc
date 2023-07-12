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
    const uniquePeers = []
    const duplicates = []
    peers.forEach((peer) => {
      if (uniquePeers.find((p) => p.peerID === peer.peerID)) {
        duplicates.push(peer)
        logs && console.log(`${prefix} Found duplicate local peer ${c.bright}${c.red}${peer.peerID}${c.r}`)
      } else uniquePeers.push(peer)
    })

    duplicates.forEach((peer) => {
      const index = peers.indexOf(peer)
      if (index > -1) peers.splice(index, 1)
    })

    if (peers.length === uniquePeers.length) return
    set_peers(uniquePeers)

    // console.log(`${prefix} Found and removed duplicate local peer`)
  }, [peers, set_peers])

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
          logs && console.log(`${p_recv} All Users`, users)
          const peers = []

          // if socketRef.current.id is already in users, remove it
          users = users.filter((id) => id !== socketRef.current.id)
          logs && console.log(`${prefix} Filtered Users`, users)

          users.forEach((userID) => {
            const peer = createOrAddPeer({ userToSignal: userID, callerID: socketRef.current.id, stream, socketRef, peersRef })
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
          const peer = createOrAddPeer({ incomingSignal: payload.signal, callerID: payload.callerID, stream, socketRef, peersRef })
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
      logs && console.log(`${p_send} Leaving room ${c.green}${roomID}${c.r}`)
      oldRef.current.emit('leave room', roomID)
      logs && console.log(`${prefix} Destroying stream connection`)
      oldRef.current.off('all users')
      oldRef.current.off('user joined')
      oldRef.current.off('user left')
      oldRef.current.off('receiving returned signal')
      oldRef.current.off('change')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

//==================================================================================================

export function createOrAddPeer({ incomingSignal, userToSignal, callerID, stream, socketRef, peersRef }) {
  const initiator = incomingSignal === undefined

  // check if callerID already exists in socketRef.current
  // show all peersRef.current.peerID
  const ps = peersRef.current.map((p) => p.peerID)
  const exists = ps.includes(userToSignal)
  if (exists) {
    logs && console.log(`${prefix} Peer ${c.bright}${c.cyan}${userToSignal}${c.r} already exists`)
    logs && console.log('=============================================================')
    return
  }


  logs && console.log(initiator ?
    `${p_send} Peer Connection Request from ${c.yellow}${callerID}${c.r} to ${c.green}${userToSignal}${c.r}` :
    `${prefix} Adding ${c.green}${callerID}${c.r} as peer`
  )

  const peer = new Peer({
    initiator,
    trickle: false,
    stream,
    config: peerConfig,
  })

  peer.on('signal', (signal) => {
    logs && console.log(`${p_recv} Accepted request by ${c.green}${userToSignal}${c.r}`)

    if (initiator) {
      socketRef.current.emit('sending signal', { userToSignal, callerID, signal })
      logs && console.log(`${p_send} Sending signal to ${c.green}${userToSignal}${c.r}`)
    } else {
      socketRef.current.emit('returning signal', { signal, callerID })
      logs && console.log(`${p_send} Returning signal to ${c.green}${callerID}${c.r}`)
    }
  })

  if (!initiator) peer.signal(incomingSignal)

  return peer
}
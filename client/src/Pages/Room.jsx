import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import Peer from 'simple-peer'

import { Video } from '../Components/Video'
import Controls from '../Components/Controls'
import PeerVideo from '../Components/PeerVideo'

const peerConfig = {
  iceServers: [{
    'urls': [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
    ]
  }]
}

const Room = (props) => {
  const [peers, setPeers] = useState([])
  const [userUpdate, setUserUpdate] = useState([])

  const socketRef = useRef()
  const userVideo = useRef()
  const peersRef = useRef([])

  const roomID = props.match.params.roomID
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  }

  useEffect(() => {
    socketRef.current = io.connect('/')
    createStream()
  }, [])

  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: false })
      .then((stream) => {
        userVideo.current.srcObject = stream
        socketRef.current.emit('join room', roomID)
        socketRef.current.on('all users', (users) => {
          console.log(users)
          const peers = []
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream)
            peersRef.current.push({ peerID: userID, peer })
            peers.push({ peerID: userID, peer })
          })
          setPeers(peers)
        })

        socketRef.current.on('user joined', (payload) => {
          console.log('==', payload)
          const peer = addPeer(payload.signal, payload.callerID, stream)
          peersRef.current.push({ peerID: payload.callerID, peer })
          const peerObj = { peer, peerID: payload.callerID }
          setPeers((users) => [...users, peerObj])
        })

        socketRef.current.on('user left', (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id)
          if (peerObj) peerObj.peer.destroy()
          const peers = peersRef.current.filter((p) => p.peerID !== id)
          peersRef.current = peers
          setPeers(peers)
        })

        socketRef.current.on('receiving returned signal', (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id)
          item.peer.signal(payload.signal)
        })

        socketRef.current.on('change', (payload) => setUserUpdate(payload))
      })
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream, config: peerConfig })
    peer.on('signal', (signal) => socketRef.current.emit('sending signal', { userToSignal, callerID, signal, }))
    return peer
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream, config: peerConfig })
    peer.on('signal', (signal) => socketRef.current.emit('returning signal', { signal, callerID }))
    peer.signal(incomingSignal)
    return peer
  }

  return (
    <div style={{ height: '100%', width: '10rem' }}>

      <Video ref={userVideo} />
      <Controls {...{ userVideo, socketRef, userUpdate }} />

      {peers.map((peer, index) => <PeerVideo key={index} {...{ peersRef, peer, userUpdate }} />)}
    </div>
  )
}

export default Room
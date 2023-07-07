import Peer from 'simple-peer'

export const peerConfig = {
  iceServers: [{
    'urls': [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
    ]
  }]
}

//==================================================================================================

export function createStream({
  roomID, videoConstraints,
  userVideo,
  peersRef, socketRef,
  set_peers, set_userUpdate,
}) {

  navigator.mediaDevices
    .getUserMedia({ video: videoConstraints, audio: false })
    .then((stream) => {
      userVideo.current.srcObject = stream

      socketRef.current.emit('join room', roomID)

      socketRef.current.on('all users', (users) => {
        console.log(users)
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
        console.log('==', payload)
        const peer = addPeer(payload.signal, payload.callerID, stream, socketRef)
        const peerObj = {
          peerID: payload.callerID,
          peer,
        }
        peersRef.current.push(peerObj)
        set_peers((users) => [...users, peerObj])
      })

      socketRef.current.on('user left', (id) => {
        const peerObj = peersRef.current.find((p) => p.peerID === id)
        if (peerObj) peerObj.peer.destroy()
        const peers = peersRef.current.filter((p) => p.peerID !== id)
        peersRef.current = peers
        set_peers(peers)
      })

      socketRef.current.on('receiving returned signal', (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id)
        item.peer.signal(payload.signal)
      })

      socketRef.current.on('change', (payload) => set_userUpdate(payload))
    })
}

//==================================================================================================

export function createPeer(userToSignal, callerID, stream, socketRef) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: peerConfig,
  })

  peer.on('signal', (signal) => {
    socketRef.current.emit('sending signal', { userToSignal, callerID, signal })
  })

  return peer
}

//==================================================================================================

export function addPeer(incomingSignal, callerID, stream, socketRef) {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
    config: peerConfig,
  })

  peer.on('signal', (signal) => {
    socketRef.current.emit('returning signal', { signal, callerID })
  })

  peer.signal(incomingSignal)
  return peer
}
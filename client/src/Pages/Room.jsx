import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

import Video from '../Components/Video'
import Controls from '../Components/Controls'
import PeerVideo from '../Components/PeerVideo'
import StreamConnection from '../Components/StreamConnection'

export default function Room(props) {
  const [peers, set_peers] = useState([])
  const [userUpdate, set_userUpdate] = useState([])

  const socketRef = useRef()
  const userVideo = useRef()
  const peersRef = useRef([])

  const roomID = props.match.params.roomID
  const socketURL = 'http://localhost:8000'

  useEffect(() => {
    socketRef.current = io.connect(socketURL)
    // console.log('Room.jsx: useEffect: createStream', socketRef.current)
  }, [])

  const w = '16rem'
  const h = '10rem'

  const size = { width: w, height: h }
  return (
    <div style={{ background: 'lightgray', padding: '2rem' }}>

      {roomID && <StreamConnection {...{ roomID, userVideo, peersRef, socketRef, peers, set_peers, set_userUpdate }} />}
      <div>Room ID: <code>{roomID}</code></div>
      <code>{JSON.stringify(peers.map((peer) => peer.peerID), null, 2)}</code>

      <hr style={{ marginBottom: '2rem' }} />



      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'left', alignItems: 'left' }}>

        <div style={{ width: w, height: h, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

          <Video ref={userVideo} {...{ color: 'white', socketRef }} />
          <Controls {...{ userVideo, socketRef, userUpdate }} />

        </div>

        {peers.map((peer, index) => <PeerVideo key={index} {...{ peersRef, peer, userUpdate, size }} />)}
      </div>
    </div>
  )
}
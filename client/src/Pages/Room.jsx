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

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:8000')
    // console.log('Room.jsx: useEffect: createStream', socketRef.current)
  }, [])

  const w = '16rem'
  const h = '10rem'

  return (
    <div>
      <StreamConnection {...{ roomID, userVideo, peersRef, socketRef, peers, set_peers, set_userUpdate }} />

      <code>{JSON.stringify(peers.map((peer) => peer.peerID), null, 2)}</code>

      <div style={{ height: h, width: w }}>
        <Video ref={userVideo} />
        <Controls {...{ userVideo, socketRef, userUpdate }} />
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'left',
        alignItems: 'left',
        height: h,
        width: w,
      }}>
        {peers.map((peer, index) => <PeerVideo key={index} {...{ peersRef, peer, userUpdate }} />)}
      </div>
    </div>
  )
}
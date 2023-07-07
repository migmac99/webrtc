import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

import { createStream } from '../utils/peer'

import { Video } from '../Components/Video'
import Controls from '../Components/Controls'
import PeerVideo from '../Components/PeerVideo'

const Room = (props) => {
  const [peers, set_peers] = useState([])
  const [userUpdate, set_userUpdate] = useState([])

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
    createStream({
      roomID, videoConstraints,
      userVideo,
      peersRef, socketRef,
      set_peers, set_userUpdate,
    })
  }, [])


  return (
    <div style={{ height: '100%', width: '10rem' }}>

      <Video ref={userVideo} />
      <Controls {...{ userVideo, socketRef, userUpdate }} />

      {peers.map((peer, index) => <PeerVideo key={index} {...{ peersRef, peer, userUpdate }} />)}
    </div>
  )
}

export default Room
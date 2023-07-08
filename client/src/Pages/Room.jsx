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
    minFrameRate: 60,
  }

  useEffect(() => {
    socketRef.current = io.connect('/')
    createStream({
      roomID, videoConstraints,
      userVideo,
      peersRef, socketRef,
      set_peers, set_userUpdate,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const w = '16rem'
  const h = '10rem'

  return (
    <div>

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

export default Room
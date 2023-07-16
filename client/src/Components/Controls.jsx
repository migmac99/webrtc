import React, { useState } from 'react'

import micmute from '../assets/micmute.svg'
import micunmute from '../assets/micunmute.svg'
import webcam from '../assets/webcam.svg'
import webcamoff from '../assets/webcamoff.svg'

const outerStyle = {
  display: 'flex',
  zIndex: 1,
  position: 'absolute',
  right: '0.8rem',
  bottom: '0.7rem',
}

export default function Controls({ userVideo, socketRef, userUpdate }) {

  const [audioFlag, setAudioFlag] = useState(true)
  const [videoFlag, setVideoFlag] = useState(true)

  function Toggle(type) {
    if (!userVideo.current.srcObject) return
    const tracks = userVideo.current.srcObject.getTracks()
    const track = tracks.find(t => t.kind === type)
    if (!track) return
    track.enabled = !track.enabled
    const update = {
      id: socketRef.current.id,
      videoFlag: type === 'video' ? !videoFlag : videoFlag,
      audioFlag: type === 'audio' ? !audioFlag : audioFlag,
    }
    socketRef.current.emit('change', [...userUpdate, update])
    type === 'video' ? setVideoFlag(!videoFlag) : setAudioFlag(!audioFlag)
  }

  return (
    <div style={outerStyle}>
      <div style={{ flexGrow: 1 }} />

      <div style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '1rem',
        display: 'flex',
        justifyContent: 'flex-start',
        flexShrink: 1,
        alignItems: 'center',
        zIndex: 2,
      }}>
        <Toggler {...{
          src: videoFlag ? webcam : webcamoff,
          onClick: () => Toggle('video'),
        }} />

        <Toggler {...{
          src: audioFlag ? micunmute : micmute,
          onClick: () => Toggle('audio'),
        }} />
      </div>
    </div>
  )
}

export function ControlSmall({ audio, video }) {
  return (
    <div style={outerStyle}>
      <div style={{ flexGrow: 1 }} />
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '1rem',
        display: 'flex',
        justifyContent: 'flex-start',
        flexShrink: 1,
        alignItems: 'center',
        zIndex: 2,
      }}>
        <Toggler {...{ src: video ? webcam : webcamoff }} />
        <Toggler {...{ src: audio ? micunmute : micmute }} />
      </div>
    </div>
  )
}

function Toggler({ src, onClick }) {
  return (
    <img
      alt='toggle'
      src={src}
      style={{
        height: '1.5rem',
        cursor: 'pointer',
        margin: '0.2rem',
        opacity: onClick ? 1 : 0.5,
      }}
      onClick={onClick}
    />
  )
}
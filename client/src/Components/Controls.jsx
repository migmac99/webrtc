import React, { useState } from 'react'

const outerStyle = {
  display: 'flex',
  zIndex: 1,
  position: 'absolute',
  right: '0.8rem',
  bottom: '0.7rem',
}

const a = 0.4

const controlStyle = {
  backgroundColor: `rgba(255, 255, 255, ${a})`,
  borderRadius: '1rem',
  display: 'flex',
  justifyContent: 'flex-start',
  flexShrink: 1,
  alignItems: 'center',
  padding: '0.1rem 0.4rem',
  zIndex: 2,
}

export default function Controls({ userVideo, socketRef, userUpdate }) {

  const [audioFlag, setAudioFlag] = useState(true)
  const [videoFlag, setVideoFlag] = useState(true)
  const [hover, set_hover] = useState(false)

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

  const _a = hover ? 1 : a

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => set_hover(true)}
      onMouseLeave={() => set_hover(false)}
    >
      <div style={{ flexGrow: 1 }} />

      <div style={{ ...controlStyle, backgroundColor: `rgba(255, 255, 255, ${_a})` }}>
        <Toggler {...{
          icon: 'video',
          enabled: videoFlag,
          onClick: () => Toggle('video'),
        }} />

        <Toggler {...{
          icon: 'audio',
          enabled: audioFlag,
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
      <div style={controlStyle}>
        <Toggler {...{ icon: 'video', enabled: video }} />
        <Toggler {...{ icon: 'audio', enabled: audio }} />
      </div>
    </div>
  )
}

function Toggler({ icon, enabled, onClick }) {

  const [hover, set_hover] = useState(false)

  if (icon === 'video') icon = 'pi-camera'
  if (icon === 'audio') icon = 'pi-microphone'

  return (
    <i
      className={`pi ${icon}`}
      style={{
        fontSize: '1.5rem',
        cursor: onClick && 'pointer',
        margin: '0.2rem',
        color: enabled ? 'forestgreen' : 'maroon',
        opacity: onClick ? 1 : 0.5,
        filter: onClick && hover && 'brightness(1.5)',
      }}
      onMouseEnter={() => set_hover(true)}
      onMouseLeave={() => set_hover(false)}
      onClick={onClick}
    />
  )
}
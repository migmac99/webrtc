import React from 'react'

import micmute from '../assets/micmute.svg'
import micunmute from '../assets/micunmute.svg'
import webcam from '../assets/webcam.svg'
import webcamoff from '../assets/webcamoff.svg'

export default function ControlSmall({
  audio, video,
}) {

  return (
    <div style={{
      margin: '3px',
      padding: '5px',
      height: '16px',
      width: '98%',
      marginTop: '-6vh',
      filter: 'brightness(1)',
      zIndex: 1,
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <ImgSm src={video ? webcam : webcamoff} />
      &nbsp;&nbsp;&nbsp;
      <ImgSm src={audio ? micunmute : micmute} />
    </div>
  )
}

function ImgSm({ src }) {

  return (
    <img
      src={src}
      style={{
        height: '15px',
        textAlign: 'left',
        opacity: 0.5,
      }}
    />
  )
}

import React, { useRef, useEffect } from 'react'


export const Video = React.forwardRef((props, ref) => {
  const { external } = props

  return (
    <video
      ref={ref}
      muted={!external}
      autoPlay
      playsInline
      style={{
        width: '100%',
        position: 'static',
        borderRadius: '10px',
        overflow: 'hidden',
        margin: '1px',
        border: '5px solid gray',
      }}
    />
  )
})
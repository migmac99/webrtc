
import React from 'react'

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
        height: '100%',
        objectFit: 'cover',
        borderRadius: '1rem',
        border: '0.3rem solid gray',
      }}
    />
  )
})
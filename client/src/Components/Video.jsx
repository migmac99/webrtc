
import React from 'react'

const Video = React.forwardRef((props, ref) => {
  const { external } = props

  const borderSize = '0.2rem'

  return (
    <div style={{
      borderRadius: '1rem',
      border: `${borderSize} solid gray`,
      overflow: 'hidden',
      width: `calc(100% - (2 * ${borderSize}) )`,
      height: `calc(100% - (2 * ${borderSize}) )`,
      margin: 0,
      padding: 0,
    }}>
      <video
        ref={ref}
        muted={!external}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
})

export default Video
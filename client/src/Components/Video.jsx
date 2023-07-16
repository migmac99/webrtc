
import React, { useState, useEffect } from 'react'

const Video = React.forwardRef((props, ref) => {
  const { external, color, msid } = props

  const borderSize = '0.3rem'
  const loaderSize = '3rem'

  const [hasStream, set_hasStream] = useState(false)
  const [loading, set_loading] = useState(true)

  if (ref?.current?.srcObject && !hasStream) set_hasStream(true)

  useEffect(() => {
    if (hasStream) set_loading(false)
    if (msid) set_loading(false)
  }, [hasStream, msid])

  return (
    <div
      style={{
        borderRadius: '1rem',
        border: `${borderSize} solid ${color}`,
        overflow: 'hidden',
        width: `calc(100% - (2 * ${borderSize}) )`,
        height: `calc(100% - (2 * ${borderSize}) )`,
        margin: 0,
        padding: 0,
      }}
    >
      {/* <div style={{ position: 'absolute', fontSize: '1rem', color: 'red' }}>{msid || 'X'}</div> */}

      {loading && <i
        className='pi pi-spin pi-spinner'
        style={{
          color,
          fontSize: loaderSize,
          position: 'absolute',
          top: `calc(50% - (${loaderSize} / 2))`,
          left: `calc(50% - (${loaderSize} / 2))`,
        }}
      />}

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
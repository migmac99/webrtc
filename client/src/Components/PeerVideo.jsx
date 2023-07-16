import React, { useState, useEffect, useRef } from 'react'

import Video from './Video'
import { ControlSmall } from './Controls'

export default function PeerVideo({ peersRef, peer, userUpdate, size }) {

  const { width, height } = size

  const [hasStream, set_hasStream] = useState(false)
  const [msid, set_msid] = useState(null)

  const ref = useRef(
    () => {
      const foundPeer = peersRef.current.find((p) => p.peerID === peer.peerID)
      if (foundPeer) return foundPeer.ref
      else return null
    }
  )

  const _peer = peersRef.current.find((p) => p.peerID === peer.peerID).peer

  useEffect(() => {
    // console.log(peersRef.current, _peer, ref)
    _peer.on('stream', (stream) => {
      if (!stream || !ref.current) return
      set_hasStream(true)
      // console.log('peer', _peer)
      console.log('msid', _peer._remoteStreams[0].id)
      set_msid(_peer._remoteStreams[0].id)
      ref.current.srcObject = stream
    })
  }, [_peer, ref])

  let audioFlagTemp = true
  let videoFlagTemp = true

  if (userUpdate) {
    userUpdate.forEach((entry) => {
      if (peer && peer.peerID && peer.peerID === entry.id) {
        audioFlagTemp = entry.audioFlag
        videoFlagTemp = entry.videoFlag
      }
    })
  }
  return (
    <div style={{ width, height, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Video ref={ref} {...{ external: true, color: 'gray', msid }} />
      <ControlSmall {...{ audio: audioFlagTemp, video: videoFlagTemp }} />
    </div>
  )
}

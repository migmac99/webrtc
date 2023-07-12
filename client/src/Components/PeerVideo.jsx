import React, { useEffect, useRef } from 'react'

import Video from './Video'
import { ControlSmall } from './Controls'

export default function PeerVideo({ peersRef, peer, userUpdate }) {

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
    <div>
      <Video ref={ref} external={true} />
      <ControlSmall {...{ audio: audioFlagTemp, video: videoFlagTemp }} />
    </div>
  )
}

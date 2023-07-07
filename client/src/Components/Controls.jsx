import React, { useState } from 'react'

import micmute from '../assets/micmute.svg'
import micunmute from '../assets/micunmute.svg'
import webcam from '../assets/webcam.svg'
import webcamoff from '../assets/webcamoff.svg'

export default function Controls({ userVideo, socketRef, userUpdate }) {

  const [audioFlag, setAudioFlag] = useState(false)
  const [videoFlag, setVideoFlag] = useState(true)

  return (
    <div style={{
      margin: '3px',
      padding: '5px',
      height: '27px',
      width: '98%',
      backgroundColor: 'rgba(255, 226, 104, 0.1)',
      marginTop: '-8.5vh',
      filter: 'brightness(1)',
      zIndex: '1',
      borderRadius: '6px',
    }}>
      <img
        style={{
          height: '25px',
          cursor: 'pointer',
        }}
        src={videoFlag ? webcam : webcamoff}
        onClick={() => {
          if (userVideo.current.srcObject) {
            userVideo.current.srcObject.getTracks().forEach(function (track) {
              if (track.kind === 'video') {
                if (track.enabled) {
                  socketRef.current.emit('change', [...userUpdate, {
                    id: socketRef.current.id,
                    videoFlag: false,
                    audioFlag,
                  }]);
                  track.enabled = false;
                  setVideoFlag(false);
                } else {
                  socketRef.current.emit('change', [...userUpdate, {
                    id: socketRef.current.id,
                    videoFlag: true,
                    audioFlag,
                  }]);
                  track.enabled = true;
                  setVideoFlag(true);
                }
              }
            });
          }
        }}
      />

      <img
        style={{
          height: '25px',
          cursor: 'pointer',
        }}
        src={audioFlag ? micunmute : micmute}
        onClick={() => {
          if (userVideo.current.srcObject) {
            userVideo.current.srcObject.getTracks().forEach(function (track) {
              if (track.kind === 'audio') {
                if (track.enabled) {
                  socketRef.current.emit('change', [...userUpdate, {
                    id: socketRef.current.id,
                    videoFlag,
                    audioFlag: false,
                  }]);
                  track.enabled = false;
                  setAudioFlag(false);
                } else {
                  socketRef.current.emit('change', [...userUpdate, {
                    id: socketRef.current.id,
                    videoFlag,
                    audioFlag: true,
                  }]);
                  track.enabled = true;
                  setAudioFlag(true);
                }
              }
            });
          }
        }}
      />
    </div>
  )
}

const Controls = styled.div`
  margin: 3px;
  padding: 5px;
  height: 27px;
  width: 98%;
  background-color: rgba(255, 226, 104, 0.1);
  margin-top: -8.5vh;
  filter: brightness(1);
  z-index: 1;
  border-radius: 6px;
`

export default function Controls(props) {
  return (
    <Controls>
      <ImgComponent
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

      <ImgComponent
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
    </Controls>
  )
}
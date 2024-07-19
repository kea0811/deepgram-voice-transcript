import { useEffect, useState } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";

import './App.css';

const BUTTON_STATE = {
  LOADING: 'Loading...',
  START: 'Start Recording',
  STOP: 'Stop Recording'
}

function App() {
  const [isCopying, setIsCopying] = useState();
  const { finalTranscript, partialTranscript, initialize, configureStream, sendAudioData, stopStream, isTranscriberReady, updateFinalTranscript } = useSocket();

  useEffect(() => {
    initialize();
  }, []);

  const { startRecording, stopRecording, isRecording } = useAudioRecorder({
    dataCb: (data) => {
      sendAudioData(data);
    },
  });

  const onStartRecordingPress = async () => {
    initialize();
    const sampleRate = await startRecording();
    configureStream(sampleRate);
  };

  const onStopRecordingPress = async () => {
    stopRecording();
    stopStream();
  };

  const onCopyClick = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(finalTranscript);
    setTimeout(() => {
      setIsCopying(false);
    }, 2000)
  }

  const renderButtonState = () => {
    if (isRecording && isTranscriberReady) {
      return BUTTON_STATE.STOP
    }

    if (isRecording && !isTranscriberReady) {
      return BUTTON_STATE.LOADING
    }

    return BUTTON_STATE.START
  }
  
  return (
    <div className="wrapper">
      <div className="container">
        <h1>Voice Notes</h1>
        <p>Record or type something in the textbox.</p>
        <textarea id="transcription-display" disabled={isRecording} onChange={e => {
          updateFinalTranscript(e.target.value)
        }} value={`${finalTranscript}${partialTranscript}`} rows={10}></textarea>
        <div className="button-container">
          <button id="record-button" disabled={renderButtonState() === BUTTON_STATE.LOADING} onClick={() => {
            if (isRecording) {
              return onStopRecordingPress();
            }
            onStartRecordingPress()
          }}>{renderButtonState()}</button>
          <button id="copy-button" onClick={onCopyClick}>{isCopying ? 'Copied' : 'Copy'}</button>
          <button id="reset-button" onClick={() => updateFinalTranscript("")}>Clear</button>
        </div>
      </div>
    </div>
  );
}

export default App;

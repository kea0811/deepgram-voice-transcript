import { useState } from "react";
import { io } from "socket.io-client";

const serverURL = "http://localhost:8080";

const useSocket = () => {
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('')
  const [isTranscriberReady, setIsTranscriberReady] = useState(false);
  let socket;
  const initialize = () => {
    if (!socket) {
      socket = io(serverURL)
      socket.on('connection', (value) => {
        console.log(value)
      })

      socket.on('transcriber-ready', status => {
        setIsTranscriberReady(status);
      })

      socket.on('final', (text) => {
        setFinalTranscript((prevText) => `${prevText} ${text}`);
        setPartialTranscript('');
      })

      socket.on('partial', (text) => {
        setPartialTranscript(text);
      })

      socket.on('error', (error) => {
        console.error('Error: ', error)
      })
    }
  };

  const configureStream = (sampleRate) => {
    if (socket) {
      socket.emit('configure-stream', { sampleRate })
    }
  }

  const stopStream = () => {
    if (socket) {
      socket.emit('stop-stream');
    }
  }
  
  const sendAudioData = (audioData) => {
    debugger;
    if (socket) {
      socket.emit('incoming-audio', audioData);
    }
  }

  const updateFinalTranscript = (text) => {
    setFinalTranscript(text);
  }

  return { configureStream, sendAudioData, initialize, stopStream, isTranscriberReady, finalTranscript, partialTranscript, updateFinalTranscript };
};

export default useSocket;

import Transcriber from "./transcriber.js";

const initializeWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`connection made (${socket.id})`);
    socket.emit("connection", "Connection Initialized");
    
    let transcriber = new Transcriber();

    transcriber.on('transcriber-ready', (val) => {
      socket.emit('transcriber-ready', val);
    })

    transcriber.on('final', (text) => {
      socket.emit('final', text);
    })

    transcriber.on('partial', (text) => {
      socket.emit('partial', text);
    })

    transcriber.on('error', (ex) => {
      socket.emit('error', ex);
    })

    socket.on('configure-stream', ({ sampleRate }) => {
      try {
        transcriber.startTranscriptionStream(sampleRate);
      } catch (ex) {
        console.error("Error configuring stream:", ex);
        socket.emit('error', ex);
      }
    });

    socket.on('incoming-audio', (audioData) => {
      try {
        transcriber.send(audioData);
      } catch (ex) {
        console.error("Error processing audio data:", ex);
        socket.emit('error', ex);
      }
    })

    socket.on('stop-stream', () => {
      transcriber.endTranscriptionStream();
    })
    
    socket.on('disconnect', () => {
      transcriber.endTranscriptionStream();
      console.log('Client disconnected');
    })
  });

  return io;
};

export default initializeWebSocket;

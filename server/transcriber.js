import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import EventEmitter from "events";

class Transcriber extends EventEmitter {
  constructor() {
    super();

    this.sampleRate = null;
    this.deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
    this.connection = null;
  }

  // sampleRate: number
  async startTranscriptionStream(sampleRate) {
    this.sampleRate = sampleRate;

    // example deepgram configuration
    const config = {
      model: "nova-2",
      punctuate: true,
      language: "en",
      interim_results: true,
      diarize: false,
      smart_format: true,
      endpointing: 0,
      encoding: "linear16",
      sample_rate: sampleRate,
    }

    this.connection = await this.deepgramClient.listen.live(config);

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.emit('transcriber-ready', true)
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      data.channel.alternatives.forEach((alternative) => {
        if (alternative.transcript) {
          if (data.is_final) {
            console.log('final', alternative.transcript)
            this.emit('final', alternative.transcript);
          } else {
            console.log('partial', alternative.transcript)
            this.emit('partial', alternative.transcript);
          }
        }
      })
    });
  }

  endTranscriptionStream() {
    // close deepgram connection here
    if (this.connection?.getReadyState() === 1) {
      this.connection.finish();
      this.connection = null;
    }
  }

  // NOTE: deepgram must be ready before sending audio payload or it will close the connection
  send(payload) {
    if (this.connection?.getReadyState() === 1) {
      this.connection.send(payload);
    } else {
      // report errors
    }
  }
}

export default Transcriber;

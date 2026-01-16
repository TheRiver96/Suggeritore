/**
 * Web Audio API Encoder per iOS compatibility
 * Questo encoder cattura audio usando Web Audio API e lo converte in WAV
 */

export interface AudioEncoderConfig {
  sampleRate: number;
  numChannels: number;
}

export class WebAudioEncoder {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private audioBuffers: Float32Array[] = [];
  private isRecording = false;
  private recordingStartTime = 0;
  private sampleRate = 44100;
  private config: AudioEncoderConfig;

  constructor(config: AudioEncoderConfig = { sampleRate: 44100, numChannels: 1 }) {
    this.config = config;
    this.sampleRate = config.sampleRate;
  }

  async start(stream: MediaStream): Promise<void> {
    this.audioBuffers = [];
    this.isRecording = true;
    this.recordingStartTime = Date.now();

    // Crea AudioContext con sample rate specificato
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });

    // Crea source node dallo stream del microfono
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);

    // Crea processor node (4096 è la dimensione del buffer)
    const bufferSize = 4096;
    this.processorNode = this.audioContext.createScriptProcessor(
      bufferSize,
      this.config.numChannels,
      this.config.numChannels
    );

    // Quando arrivano dati audio, li salviamo nei buffer
    this.processorNode.onaudioprocess = (event) => {
      if (!this.isRecording) return;

      // Prendi il primo canale (mono)
      const inputData = event.inputBuffer.getChannelData(0);
      // Copia i dati perché il buffer viene riutilizzato
      const bufferCopy = new Float32Array(inputData);
      this.audioBuffers.push(bufferCopy);
    };

    // Collega i nodi: source -> processor -> destination
    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
  }

  stop(): Blob {
    this.isRecording = false;

    // Disconnetti i nodi
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.processorNode) {
      this.processorNode.disconnect();
    }

    // Chiudi il context
    if (this.audioContext) {
      this.audioContext.close();
    }

    // Converti i buffer in WAV
    const wavBlob = this.exportWAV();

    // Cleanup
    this.audioBuffers = [];
    this.audioContext = null;
    this.sourceNode = null;
    this.processorNode = null;

    return wavBlob;
  }

  getDuration(): number {
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  }

  /**
   * Converte i buffer audio in formato WAV
   */
  private exportWAV(): Blob {
    // Calcola lunghezza totale dei sample
    const totalLength = this.audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);

    // Unisci tutti i buffer in uno solo
    const mergedBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const buffer of this.audioBuffers) {
      mergedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // Converti Float32Array (-1.0 to 1.0) in Int16Array (-32768 to 32767)
    const int16Buffer = this.floatTo16BitPCM(mergedBuffer);

    // Crea header WAV
    const wavBuffer = this.createWAVBuffer(int16Buffer, this.sampleRate, this.config.numChannels);

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Converte Float32 in Int16 PCM
   */
  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      // Clamp tra -1 e 1
      const s = Math.max(-1, Math.min(1, input[i]));
      // Converti in Int16
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }

  /**
   * Crea buffer WAV con header
   */
  private createWAVBuffer(samples: Int16Array, sampleRate: number, numChannels: number): ArrayBuffer {
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // File length minus RIFF identifier length and file description length
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // Format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // Channel count
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate
    view.setUint32(28, byteRate, true);
    // Block align
    view.setUint16(32, blockAlign, true);
    // Bits per sample
    view.setUint16(34, 16, true);
    // Data chunk identifier
    this.writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    const offset = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset + i * 2, samples[i], true);
    }

    return buffer;
  }

  /**
   * Scrive stringa in DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

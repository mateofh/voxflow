import { createClient, LiveTranscriptionEvents, DeepgramClient, LiveClient } from '@deepgram/sdk';
import { STTProvider, STTResult, DEFAULT_STT_CONFIG } from './types';

type ResultCallback = (result: STTResult) => void;
type ErrorCallback = (error: Error) => void;

export class DeepgramProvider implements STTProvider {
  name = 'Deepgram Nova-3';

  private client: DeepgramClient | null = null;
  private connection: LiveClient | null = null;
  private resultCallbacks: ResultCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private connected = false;

  /**
   * Connect to Deepgram streaming API
   */
  async connect(apiKey: string): Promise<void> {
    if (this.connected) {
      await this.disconnect();
    }

    try {
      this.client = createClient(apiKey);

      this.connection = this.client.listen.live({
        model: DEFAULT_STT_CONFIG.model,
        language: DEFAULT_STT_CONFIG.language,
        smart_format: true,
        punctuate: true,
        sample_rate: DEFAULT_STT_CONFIG.sampleRate,
        channels: DEFAULT_STT_CONFIG.channels,
        encoding: DEFAULT_STT_CONFIG.encoding,
        // Enable interim results for real-time feedback
        interim_results: true,
        // Endpointing for detecting end of utterance
        endpointing: 300,
        // Utterance end detection
        utterance_end_ms: 1000,
      });

      this.setupEventHandlers();
      this.connected = true;
      console.log('✓ Deepgram streaming connection established');

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect to Deepgram');
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Set up event handlers for the Deepgram connection
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('✓ Deepgram WebSocket opened');
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const transcript = data.channel?.alternatives?.[0];
      if (!transcript) return;

      const text = transcript.transcript;
      if (!text) return;

      const result: STTResult = {
        text,
        isFinal: data.is_final || false,
        confidence: transcript.confidence || 0,
        duration: data.duration || 0,
      };

      this.notifyResult(result);
    });

    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      console.error('Deepgram error:', error);
      this.notifyError(new Error(error.message || 'Deepgram streaming error'));
    });

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram WebSocket closed');
      this.connected = false;
    });

    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      console.log('Deepgram: Utterance end detected');
    });
  }

  /**
   * Disconnect from Deepgram
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.requestClose();
      this.connection = null;
    }
    this.client = null;
    this.connected = false;
  }

  /**
   * Send audio data to Deepgram for transcription
   */
  sendAudio(audioBuffer: Buffer): void {
    if (!this.connection || !this.connected) {
      return;
    }
    // Convert Buffer to ArrayBuffer for Deepgram SDK compatibility
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    );
    this.connection.send(arrayBuffer as unknown as ArrayBuffer);
  }

  /**
   * Register a callback for transcription results
   */
  onResult(callback: ResultCallback): void {
    this.resultCallbacks.push(callback);
  }

  /**
   * Register a callback for errors
   */
  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  private notifyResult(result: STTResult): void {
    this.resultCallbacks.forEach(cb => cb(result));
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach(cb => cb(error));
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepgramProvider = void 0;
const sdk_1 = require("@deepgram/sdk");
const types_1 = require("./types");
class DeepgramProvider {
    name = 'Deepgram Nova-3';
    client = null;
    connection = null;
    resultCallbacks = [];
    errorCallbacks = [];
    connected = false;
    /**
     * Connect to Deepgram streaming API
     */
    async connect(apiKey) {
        if (this.connected) {
            await this.disconnect();
        }
        try {
            this.client = (0, sdk_1.createClient)(apiKey);
            this.connection = this.client.listen.live({
                model: types_1.DEFAULT_STT_CONFIG.model,
                language: types_1.DEFAULT_STT_CONFIG.language,
                smart_format: true,
                punctuate: true,
                sample_rate: types_1.DEFAULT_STT_CONFIG.sampleRate,
                channels: types_1.DEFAULT_STT_CONFIG.channels,
                encoding: types_1.DEFAULT_STT_CONFIG.encoding,
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
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to connect to Deepgram');
            this.notifyError(err);
            throw err;
        }
    }
    /**
     * Set up event handlers for the Deepgram connection
     */
    setupEventHandlers() {
        if (!this.connection)
            return;
        this.connection.on(sdk_1.LiveTranscriptionEvents.Open, () => {
            console.log('✓ Deepgram WebSocket opened');
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
            const transcript = data.channel?.alternatives?.[0];
            if (!transcript)
                return;
            const text = transcript.transcript;
            if (!text)
                return;
            const result = {
                text,
                isFinal: data.is_final || false,
                confidence: transcript.confidence || 0,
                duration: data.duration || 0,
            };
            this.notifyResult(result);
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Error, (error) => {
            console.error('Deepgram error:', error);
            this.notifyError(new Error(error.message || 'Deepgram streaming error'));
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Close, () => {
            console.log('Deepgram WebSocket closed');
            this.connected = false;
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.UtteranceEnd, () => {
            console.log('Deepgram: Utterance end detected');
        });
    }
    /**
     * Disconnect from Deepgram
     */
    async disconnect() {
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
    sendAudio(audioBuffer) {
        if (!this.connection || !this.connected) {
            return;
        }
        this.connection.send(audioBuffer);
    }
    /**
     * Register a callback for transcription results
     */
    onResult(callback) {
        this.resultCallbacks.push(callback);
    }
    /**
     * Register a callback for errors
     */
    onError(callback) {
        this.errorCallbacks.push(callback);
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }
    notifyResult(result) {
        this.resultCallbacks.forEach(cb => cb(result));
    }
    notifyError(error) {
        this.errorCallbacks.forEach(cb => cb(error));
    }
}
exports.DeepgramProvider = DeepgramProvider;

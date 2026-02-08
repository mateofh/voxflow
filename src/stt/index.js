"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSTTInfo = exports.disconnectSTT = exports.sendAudioToSTT = exports.initSTT = exports.sttEmitter = void 0;
const types_1 = require("./types");
const deepgram_1 = require("./deepgram");
const events_1 = require("events");
exports.sttEmitter = new events_1.EventEmitter();
let currentProvider = null;
let currentProviderType = types_1.DEFAULT_STT_CONFIG.provider;
/**
 * Initialize the STT system with the specified provider
 */
const initSTT = async (apiKey, providerType) => {
    // Disconnect existing provider
    if (currentProvider?.isConnected()) {
        await currentProvider.disconnect();
    }
    currentProviderType = providerType || types_1.DEFAULT_STT_CONFIG.provider;
    switch (currentProviderType) {
        case 'deepgram':
            currentProvider = new deepgram_1.DeepgramProvider();
            break;
        case 'whisper':
            // TODO: Implement whisper.cpp local provider
            console.warn('Whisper provider not yet implemented, falling back to Deepgram');
            currentProvider = new deepgram_1.DeepgramProvider();
            break;
        default:
            throw new Error(`Unknown STT provider: ${currentProviderType}`);
    }
    // Set up event forwarding
    currentProvider.onResult((result) => {
        exports.sttEmitter.emit('result', result);
        if (result.isFinal) {
            exports.sttEmitter.emit('final', result);
        }
        else {
            exports.sttEmitter.emit('partial', result);
        }
    });
    currentProvider.onError((error) => {
        exports.sttEmitter.emit('error', error);
    });
    await currentProvider.connect(apiKey);
    console.log(`✓ STT initialized with ${currentProviderType}`);
};
exports.initSTT = initSTT;
/**
 * Send audio data to the STT provider for transcription
 */
const sendAudioToSTT = (audioBuffer) => {
    if (!currentProvider?.isConnected()) {
        console.warn('STT provider not connected');
        return;
    }
    currentProvider.sendAudio(audioBuffer);
};
exports.sendAudioToSTT = sendAudioToSTT;
/**
 * Disconnect the STT provider
 */
const disconnectSTT = async () => {
    if (currentProvider?.isConnected()) {
        await currentProvider.disconnect();
        console.log('✓ STT disconnected');
    }
};
exports.disconnectSTT = disconnectSTT;
/**
 * Get current STT provider info
 */
const getSTTInfo = () => ({
    provider: currentProviderType,
    connected: currentProvider?.isConnected() || false,
    name: currentProvider?.name || 'none',
});
exports.getSTTInfo = getSTTInfo;

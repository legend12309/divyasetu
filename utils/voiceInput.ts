import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

export class VoiceInputService {
  private onSpeechStart: (() => void) | null = null;
  private onSpeechEnd: (() => void) | null = null;
  private onSpeechResults: ((results: string[]) => void) | null = null;
  private onSpeechError: ((error: any) => void) | null = null;

  constructor() {
    this.setupVoiceHandlers();
  }

  private setupVoiceHandlers = () => {
    Voice.onSpeechStart = () => {
      this.onSpeechStart?.();
    };

    Voice.onSpeechEnd = () => {
      this.onSpeechEnd?.();
    };

    Voice.onSpeechResults = (e: any) => {
      this.onSpeechResults?.(e.value);
    };

    Voice.onSpeechError = (e: any) => {
      this.onSpeechError?.(e);
    };
  };

  async startListening() {
    try {
      await Voice.start('en-IN'); // Indian English
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  }

  async stopListening() {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  async cancel() {
    try {
      await Voice.cancel();
    } catch (error) {
      console.error('Error canceling voice recognition:', error);
    }
  }

  setOnSpeechStart(callback: () => void) {
    this.onSpeechStart = callback;
  }

  setOnSpeechEnd(callback: () => void) {
    this.onSpeechEnd = callback;
  }

  setOnSpeechResults(callback: (results: string[]) => void) {
    this.onSpeechResults = callback;
  }

  setOnSpeechError(callback: (error: any) => void) {
    this.onSpeechError = callback;
  }

  cleanup() {
    Voice.destroy().then(() => Voice.removeAllListeners());
  }
}

export const speak = (text: string, rate: number = 1.0) => {
  Speech.speak(text, {
    language: 'en-IN',
    pitch: 1.0,
    rate: rate,
  });
};

export const stopSpeaking = () => {
  Speech.stop();
};


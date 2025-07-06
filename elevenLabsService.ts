import axios from 'axios';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers: string[];
}

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

class ElevenLabsService {
  private config: ElevenLabsConfig;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.config = {
      apiKey: '', // Will be set by user
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default: Bella (friendly female voice)
      model: 'eleven_multilingual_v2',
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.0,
      useSpeakerBoost: true
    };
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    localStorage.setItem('elevenlabs_api_key', apiKey);
  }

  getApiKey(): string {
    if (!this.config.apiKey) {
      const stored = localStorage.getItem('elevenlabs_api_key');
      if (stored) {
        this.config.apiKey = stored;
      }
    }
    return this.config.apiKey;
  }

  setVoice(voiceId: string): void {
    this.config.voiceId = voiceId;
    localStorage.setItem('elevenlabs_voice_id', voiceId);
  }

  getVoice(): string {
    if (!this.config.voiceId) {
      const stored = localStorage.getItem('elevenlabs_voice_id');
      if (stored) {
        this.config.voiceId = stored;
      }
    }
    return this.config.voiceId;
  }

  updateConfig(updates: Partial<ElevenLabsConfig>): void {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('elevenlabs_config', JSON.stringify(this.config));
  }

  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      return response.data.voices || [];
    } catch (error) {
      console.error('Failed to fetch ElevenLabs voices:', error);
      throw new Error('Failed to fetch available voices');
    }
  }

  async generateSpeech(text: string): Promise<ArrayBuffer> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = this.getVoice();
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    try {
      const response = await axios.post(url, {
        text: text,
        model_id: this.config.model,
        voice_settings: {
          stability: this.config.stability,
          similarity_boost: this.config.similarityBoost,
          style: this.config.style,
          use_speaker_boost: this.config.useSpeakerBoost
        }
      }, {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  async speak(text: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop();

      // Generate speech
      const audioData = await this.generateSpeech(text);
      
      // Create audio blob and URL
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      this.currentAudio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          reject(new Error('Failed to create audio'));
          return;
        }

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(new Error('Audio playback failed'));
        };

        this.currentAudio.play().catch(reject);
      });
    } catch (error) {
      console.error('ElevenLabs speech error:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  // Predefined health-optimized voices
  getHealthVoices(): { id: string; name: string; description: string }[] {
    return [
      {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        description: 'Friendly, warm female voice - perfect for health guidance'
      },
      {
        id: 'ErXwobaYiN019PkySvjV',
        name: 'Antoni',
        description: 'Professional, calm male voice - ideal for medical information'
      },
      {
        id: 'VR6AewLTigWG4xSOukaG',
        name: 'Arnold',
        description: 'Authoritative, clear male voice - great for health instructions'
      },
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        description: 'Gentle, reassuring male voice - excellent for wellness coaching'
      },
      {
        id: 'yoZ06aMxZJJ28mfd3POQ',
        name: 'Sam',
        description: 'Neutral, clear voice - perfect for health data reading'
      }
    ];
  }
}

export const elevenLabsService = new ElevenLabsService();
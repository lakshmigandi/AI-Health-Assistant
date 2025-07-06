import { useState, useCallback } from 'react';
import { elevenLabsService } from '../services/elevenLabsService';

interface EnhancedTextToSpeechHook {
  speak: (text: string, useElevenLabs?: boolean) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isElevenLabsConfigured: boolean;
  isElevenLabsEnabled: boolean;
  setElevenLabsEnabled: (enabled: boolean) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

export const useEnhancedTextToSpeech = (): EnhancedTextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isElevenLabsEnabled, setIsElevenLabsEnabledState] = useState(() => {
    const stored = localStorage.getItem('use_elevenlabs_voice');
    return stored === 'true';
  });

  const isSupported = 'speechSynthesis' in window;
  const isElevenLabsConfigured = elevenLabsService.isConfigured();

  // Load voices for fallback
  useState(() => {
    if (isSupported) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
        
        if (englishVoice) {
          setSelectedVoice(englishVoice);
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  });

  const setElevenLabsEnabled = useCallback((enabled: boolean) => {
    setIsElevenLabsEnabledState(enabled);
    localStorage.setItem('use_elevenlabs_voice', enabled.toString());
  }, []);

  const speakWithElevenLabs = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      await elevenLabsService.speak(text);
    } catch (error) {
      console.error('ElevenLabs speech failed, falling back to browser TTS:', error);
      // Fallback to browser TTS
      await speakWithBrowserTTS(text);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const speakWithBrowserTTS = useCallback(async (text: string) => {
    if (!isSupported) return;

    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice]);

  const speak = useCallback(async (text: string, forceElevenLabs?: boolean) => {
    const useElevenLabs = forceElevenLabs ?? (isElevenLabsEnabled && isElevenLabsConfigured);
    
    if (useElevenLabs) {
      await speakWithElevenLabs(text);
    } else {
      await speakWithBrowserTTS(text);
    }
  }, [isElevenLabsEnabled, isElevenLabsConfigured, speakWithElevenLabs, speakWithBrowserTTS]);

  const stop = useCallback(() => {
    // Stop ElevenLabs
    elevenLabsService.stop();
    
    // Stop browser TTS
    if (isSupported) {
      speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking: isSpeaking || elevenLabsService.isSpeaking(),
    isPaused,
    isElevenLabsConfigured,
    isElevenLabsEnabled,
    setElevenLabsEnabled,
    voices,
    selectedVoice,
    setSelectedVoice
  };
};
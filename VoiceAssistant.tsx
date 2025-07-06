import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useEnhancedTextToSpeech } from '../hooks/useEnhancedTextToSpeech';

interface VoiceAssistantProps {
  onVoiceCommand: (command: string) => void;
  className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  onVoiceCommand, 
  className = '' 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [feedback, setFeedback] = useState('');

  const {
    isListening,
    transcript,
    confidence,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: voiceSupported
  } = useVoiceRecognition();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isElevenLabsConfigured,
    isElevenLabsEnabled,
    setElevenLabsEnabled
  } = useEnhancedTextToSpeech();

  // Process voice commands
  useEffect(() => {
    if (transcript && confidence > 0.7) {
      const command = transcript.toLowerCase().trim();
      
      if (command.length > 3) { // Avoid processing very short utterances
        setLastCommand(command);
        onVoiceCommand(command);
        
        // Provide audio feedback
        const responses = [
          "Got it, processing your request.",
          "I understand, let me help with that.",
          "Understood, working on it now.",
          "Okay, I'll take care of that for you."
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        speak(response);
        
        setFeedback('Command processed successfully');
        setTimeout(() => setFeedback(''), 3000);
        resetTranscript();
      }
    }
  }, [transcript, confidence, onVoiceCommand, speak, resetTranscript]);

  const toggleVoiceAssistant = () => {
    if (isListening) {
      stopListening();
      setIsActive(false);
    } else {
      if (voiceSupported) {
        startListening();
        setIsActive(true);
        speak("I'm listening. How can I help you with your health today?");
      }
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak("Voice assistant is ready. You can ask me about your health metrics, set reminders, or get health recommendations.");
    }
  };

  if (!voiceSupported) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="flex items-center text-gray-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">Voice features not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">Voice Assistant</h3>
            <p className="text-sm text-gray-600">
              Speak naturally to interact
              {isElevenLabsConfigured && (
                <span className="ml-2 text-purple-600 font-medium">• Premium Voice</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* ElevenLabs Toggle */}
          {isElevenLabsConfigured && (
            <button
              onClick={() => setElevenLabsEnabled(!isElevenLabsEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isElevenLabsEnabled 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isElevenLabsEnabled ? 'Using ElevenLabs voice' : 'Using browser voice'}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          
          {/* Text-to-Speech Toggle */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-lg transition-colors ${
              isSpeaking 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Test voice output'}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          {/* Voice Recognition Toggle */}
          <button
            onClick={toggleVoiceAssistant}
            className={`p-3 rounded-lg transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice commands'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="space-y-3">
        {isListening && (
          <div className="flex items-center text-blue-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-sm font-medium">Listening...</span>
          </div>
        )}

        {transcript && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start">
              <Mic className="w-4 h-4 text-blue-600 mt-0.5 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">You said:</p>
                <p className="text-sm text-blue-700">"{transcript}"</p>
                {confidence > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{feedback}</span>
          </div>
        )}

        {voiceError && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{voiceError}</span>
          </div>
        )}

        {lastCommand && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Last command:</p>
            <p className="text-sm text-gray-900">"{lastCommand}"</p>
          </div>
        )}

        {/* Voice Quality Indicator */}
        {isElevenLabsConfigured && (
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm text-purple-900 font-medium">
                  {isElevenLabsEnabled ? 'Premium AI Voice Active' : 'Browser Voice Active'}
                </span>
              </div>
              <button
                onClick={() => setElevenLabsEnabled(!isElevenLabsEnabled)}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Commands Help */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-2">Try saying:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-500">
          <div>"Show my health dashboard"</div>
          <div>"Add a reminder"</div>
          <div>"What's my blood pressure?"</div>
          <div>"Set a fitness goal"</div>
          <div>"Read my recommendations"</div>
          <div>"Schedule an appointment"</div>
        </div>
      </div>
    </div>
  );
};
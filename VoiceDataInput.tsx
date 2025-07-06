import React, { useState, useEffect } from 'react';
import { Mic, Save, X, Volume2 } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface VoiceDataInputProps {
  label: string;
  placeholder: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  dataType?: 'number' | 'text' | 'date';
  unit?: string;
}

export const VoiceDataInput: React.FC<VoiceDataInputProps> = ({
  label,
  placeholder,
  onSave,
  onCancel,
  dataType = 'text',
  unit = ''
}) => {
  const [value, setValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  } = useVoiceRecognition();

  const { speak } = useTextToSpeech();

  useEffect(() => {
    if (transcript && confidence > 0.6) {
      setIsProcessing(true);
      
      let processedValue = transcript.trim();
      
      // Process based on data type
      if (dataType === 'number') {
        // Extract numbers from speech
        const numbers = processedValue.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          processedValue = numbers[0];
        }
      } else if (dataType === 'date') {
        // Basic date processing - could be enhanced
        processedValue = processedValue.toLowerCase()
          .replace(/today/g, new Date().toISOString().split('T')[0])
          .replace(/tomorrow/g, new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      }
      
      setValue(processedValue);
      setIsProcessing(false);
      stopListening();
      
      // Provide audio confirmation
      speak(`I heard ${processedValue}${unit ? ` ${unit}` : ''}. Is this correct?`);
    }
  }, [transcript, confidence, dataType, unit, speak, stopListening]);

  const handleStartListening = () => {
    resetTranscript();
    setValue('');
    startListening();
    speak(`Please say your ${label.toLowerCase()}`);
  };

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
      speak('Data saved successfully');
    }
  };

  const handleCancel = () => {
    stopListening();
    onCancel();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Voice Input: {label}</h3>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Voice Input Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={isListening ? stopListening : handleStartListening}
            disabled={!isSupported || isProcessing}
            className={`p-6 rounded-full transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            } ${(!isSupported || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Mic className="w-8 h-8" />
          </button>
        </div>

        {/* Status */}
        <div className="text-center">
          {isListening && (
            <p className="text-blue-600 font-medium">Listening for {label.toLowerCase()}...</p>
          )}
          {isProcessing && (
            <p className="text-yellow-600 font-medium">Processing your input...</p>
          )}
          {!isListening && !isProcessing && (
            <p className="text-gray-600">Tap the microphone to start</p>
          )}
        </div>

        {/* Input Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {unit && `(${unit})`}
          </label>
          <input
            type={dataType === 'number' ? 'number' : dataType === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start">
              <Volume2 className="w-4 h-4 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Voice input:</p>
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

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={!value.trim()}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save {label}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center">
          You can speak naturally or type manually. 
          {dataType === 'number' && ' For numbers, just say the value clearly.'}
          {dataType === 'date' && ' For dates, you can say "today", "tomorrow", or specific dates.'}
        </div>
      </div>
    </div>
  );
};
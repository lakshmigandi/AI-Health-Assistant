import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Key, 
  User, 
  Play, 
  Save, 
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { elevenLabsService, ElevenLabsVoice } from '../services/elevenLabsService';

interface ElevenLabsSetupProps {
  onClose: () => void;
  onConfigured: () => void;
}

export const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose, onConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [config, setConfig] = useState({
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.0,
    useSpeakerBoost: true
  });

  useEffect(() => {
    // Load existing configuration
    const existingKey = elevenLabsService.getApiKey();
    const existingVoice = elevenLabsService.getVoice();
    
    if (existingKey) {
      setApiKey(existingKey);
      setSelectedVoice(existingVoice);
      loadVoices(existingKey);
    }
  }, []);

  const loadVoices = async (key: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      elevenLabsService.setApiKey(key);
      const availableVoices = await elevenLabsService.getAvailableVoices();
      setVoices(availableVoices);
      
      if (!selectedVoice && availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].voice_id);
      }
    } catch (err) {
      setError('Failed to load voices. Please check your API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testVoice = async () => {
    if (!selectedVoice && !demoMode) return;
    
    setIsTesting(true);
    setError('');
    
    try {
      if (demoMode) {
        // Use browser TTS for demo
        const utterance = new SpeechSynthesisUtterance(
          "Hello! This is a demo of how the premium AI voice would sound. The actual ElevenLabs voice is much more natural and expressive for health guidance."
        );
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
        setSuccess('Demo voice test completed! Get an API key for the premium experience.');
      } else {
        elevenLabsService.setVoice(selectedVoice);
        elevenLabsService.updateConfig(config);
        
        await elevenLabsService.speak(
          "Hello! I'm your AI health assistant. This is how I'll sound when providing you with personalized health insights and recommendations."
        );
        
        setSuccess('Voice test completed successfully!');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to test voice. Please try again.');
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    setApiKey('demo_mode');
    setSelectedVoice('demo_voice');
    setSuccess('Demo mode enabled! You can test voice features with browser TTS.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveConfiguration = () => {
    if (demoMode) {
      // Save demo configuration
      localStorage.setItem('elevenlabs_demo_mode', 'true');
      setSuccess('Demo mode configured successfully!');
      setTimeout(() => {
        onConfigured();
        onClose();
      }, 1000);
      return;
    }

    if (!apiKey || !selectedVoice) {
      setError('Please provide API key and select a voice.');
      return;
    }

    elevenLabsService.setApiKey(apiKey);
    elevenLabsService.setVoice(selectedVoice);
    elevenLabsService.updateConfig(config);
    
    setSuccess('Configuration saved successfully!');
    setTimeout(() => {
      onConfigured();
      onClose();
    }, 1000);
  };

  const healthVoices = elevenLabsService.getHealthVoices();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Premium Voice Setup</h2>
                <p className="text-gray-600">Configure AI voice for your health assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Demo Mode Option */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Try Demo Mode First</h3>
                <p className="text-sm text-blue-700">Experience voice features with browser TTS while you get your API key</p>
              </div>
              <button
                onClick={enableDemoMode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Enable Demo
              </button>
            </div>
          </div>

          {!demoMode && (
            <>
              {/* API Key Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-2" />
                    ElevenLabs API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your ElevenLabs API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Get your FREE API key:</strong>
                    </p>
                    <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
                      <li>Visit <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">ElevenLabs.io</a></li>
                      <li>Sign up for a free account (10,000 characters/month free)</li>
                      <li>Go to Profile → API Keys</li>
                      <li>Copy your API key and paste it above</li>
                    </ol>
                  </div>
                  
                  {apiKey && (
                    <button
                      onClick={() => loadVoices(apiKey)}
                      disabled={isLoading}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading Voices...
                        </>
                      ) : (
                        'Load Available Voices'
                      )}
                    </button>
                  )}
                </div>

                {/* Voice Selection */}
                {voices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <User className="w-4 h-4 inline mr-2" />
                      Select Voice
                    </label>
                    
                    {/* Recommended Health Voices */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Recommended for Health Assistant:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {healthVoices.map((voice) => (
                          <label key={voice.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name="voice"
                              value={voice.id}
                              checked={selectedVoice === voice.id}
                              onChange={(e) => setSelectedVoice(e.target.value)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{voice.name}</div>
                              <div className="text-sm text-gray-600">{voice.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* All Available Voices */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">All Available Voices:</h4>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select a voice...</option>
                        {voices.map((voice) => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name} ({voice.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Voice Settings */}
                {selectedVoice && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Voice Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Stability: {config.stability}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={config.stability}
                          onChange={(e) => setConfig(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">Higher = more consistent, Lower = more expressive</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Similarity Boost: {config.similarityBoost}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={config.similarityBoost}
                          onChange={(e) => setConfig(prev => ({ ...prev, similarityBoost: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">Higher = more similar to original voice</p>
                      </div>
                    </div>
                    
                    <label className="flex items-center mt-3">
                      <input
                        type="checkbox"
                        checked={config.useSpeakerBoost}
                        onChange={(e) => setConfig(prev => ({ ...prev, useSpeakerBoost: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Use Speaker Boost (recommended for health content)</span>
                    </label>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Test Voice */}
          {(selectedVoice || demoMode) && (
            <div className="flex space-x-3 mt-6">
              <button
                onClick={testVoice}
                disabled={isTesting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test Voice
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  elevenLabsService.stop();
                  speechSynthesis.cancel();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <VolumeX className="w-4 h-4 mr-2" />
                Stop
              </button>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mt-4">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 mt-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={saveConfiguration}
              disabled={!demoMode && (!apiKey || !selectedVoice)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {demoMode ? 'Save Demo Mode' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { 
  TestTube, 
  Play, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Brain,
  TrendingUp
} from 'lucide-react';
import { userService } from '../services/userService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface DataTestingPanelProps {
  onInsightsGenerated: () => void;
}

export const DataTestingPanel: React.FC<DataTestingPanelProps> = ({ onInsightsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const { speak } = useTextToSpeech();

  const runHealthScenario = async (scenario: 'healthy' | 'at-risk' | 'chronic-condition') => {
    setIsGenerating(true);
    setLastAction(`Simulating ${scenario} scenario...`);
    
    try {
      // Clear existing data first
      userService.clearAllData();
      
      // Create a test profile if none exists
      const profile = userService.getUserProfile();
      if (!profile) {
        const testProfile = {
          id: `test_user_${Date.now()}`,
          email: 'test@healthassist.ai',
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: '1985-06-15',
          gender: 'female' as const,
          height: 165,
          weight: scenario === 'healthy' ? 65 : scenario === 'at-risk' ? 75 : 85,
          bloodType: 'O+',
          allergies: [],
          medications: scenario === 'chronic-condition' ? ['Metformin', 'Lisinopril'] : [],
          medicalConditions: scenario === 'chronic-condition' ? ['Type 2 Diabetes', 'Hypertension'] : [],
          emergencyContact: {
            name: 'John Johnson',
            phone: '+1-555-0123',
            relationship: 'Spouse'
          },
          lifestyle: {
            activityLevel: scenario === 'healthy' ? 'moderately-active' : 'sedentary' as const,
            smokingStatus: 'never' as const,
            alcoholConsumption: 'occasional' as const,
            sleepHours: scenario === 'healthy' ? 8 : scenario === 'at-risk' ? 5.5 : 6,
            stressLevel: scenario === 'healthy' ? 2 : scenario === 'at-risk' ? 4 : 3 as const,
            dietType: 'omnivore' as const
          },
          preferences: {
            units: 'metric' as const,
            language: 'en',
            notifications: {
              reminders: true,
              insights: true,
              goals: true
            },
            voiceSettings: {
              enabled: true,
              autoSpeak: false,
              voiceSpeed: 1,
              voicePitch: 1
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        userService.saveUserProfile(testProfile);
        userService.startSession(testProfile.id);
      }
      
      // Simulate health data
      userService.simulateHealthScenario(scenario);
      
      // Generate insights
      const currentProfile = userService.getUserProfile()!;
      const recentMetrics = userService.getHealthMetricHistory(undefined, 10);
      const insights = userService.generatePersonalizedInsights(currentProfile, recentMetrics);
      
      // Save insights
      insights.forEach(insight => {
        userService.saveHealthInsight(insight);
      });
      
      setLastAction(`Generated ${insights.length} insights for ${scenario} scenario`);
      speak(`Successfully generated ${insights.length} personalized health insights for the ${scenario} scenario`);
      
      onInsightsGenerated();
      
    } catch (error) {
      console.error('Error running scenario:', error);
      setLastAction('Error generating scenario data');
      speak('Error occurred while generating scenario data');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllData = () => {
    userService.clearAllData();
    setLastAction('All data cleared');
    speak('All health data has been cleared');
    onInsightsGenerated();
  };

  const exportData = () => {
    try {
      const data = userService.exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healthassist-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastAction('Data exported successfully');
      speak('Health data exported successfully');
    } catch (error) {
      setLastAction('Export failed');
      speak('Failed to export data');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = userService.importUserData(data);
        
        if (success) {
          setLastAction('Data imported successfully');
          speak('Health data imported successfully');
          onInsightsGenerated();
        } else {
          setLastAction('Import failed');
          speak('Failed to import data');
        }
      } catch (error) {
        setLastAction('Import failed - invalid file');
        speak('Import failed due to invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3">
          <TestTube className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Testing & Data Management</h3>
          <p className="text-sm text-gray-600">Test different health scenarios and manage data</p>
        </div>
      </div>

      {/* Scenario Testing */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">Test Health Scenarios</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => runHealthScenario('healthy')}
            disabled={isGenerating}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Healthy Profile</span>
            </div>
            <p className="text-sm text-green-700">
              Good sleep, regular exercise, balanced nutrition
            </p>
          </button>

          <button
            onClick={() => runHealthScenario('at-risk')}
            disabled={isGenerating}
            className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-900">At-Risk Profile</span>
            </div>
            <p className="text-sm text-yellow-700">
              Poor sleep, high stress, minimal exercise
            </p>
          </button>

          <button
            onClick={() => runHealthScenario('chronic-condition')}
            disabled={isGenerating}
            className="p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium text-red-900">Chronic Condition</span>
            </div>
            <p className="text-sm text-red-700">
              Diabetes management, medication tracking
            </p>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">Data Management</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>

          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Status */}
      {(isGenerating || lastAction) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-sm text-gray-700">Generating AI insights...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm text-gray-700">{lastAction}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">How to Test AI Recommendations:</h5>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Click a scenario button to generate test data</li>
          <li>2. Navigate to the Insights tab to see AI recommendations</li>
          <li>3. Compare how recommendations differ between scenarios</li>
          <li>4. Use voice commands to interact with the generated data</li>
        </ol>
      </div>
    </div>
  );
};
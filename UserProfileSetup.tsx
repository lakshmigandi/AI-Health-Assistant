import React, { useState } from 'react';
import { User, Heart, Activity, Calendar, Save, X } from 'lucide-react';
import { UserProfile } from '../types/user';
import { userService } from '../services/userService';

interface UserProfileSetupProps {
  existingProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  existingProfile,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    id: existingProfile?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: existingProfile?.email || '',
    firstName: existingProfile?.firstName || '',
    lastName: existingProfile?.lastName || '',
    dateOfBirth: existingProfile?.dateOfBirth || '',
    gender: existingProfile?.gender || 'prefer-not-to-say',
    height: existingProfile?.height || 170,
    weight: existingProfile?.weight || 70,
    bloodType: existingProfile?.bloodType || '',
    allergies: existingProfile?.allergies || [],
    medications: existingProfile?.medications || [],
    medicalConditions: existingProfile?.medicalConditions || [],
    emergencyContact: existingProfile?.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    },
    lifestyle: existingProfile?.lifestyle || {
      activityLevel: 'moderately-active',
      smokingStatus: 'never',
      alcoholConsumption: 'occasional',
      sleepHours: 8,
      stressLevel: 3,
      dietType: 'omnivore'
    },
    preferences: existingProfile?.preferences || {
      units: 'metric',
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
    createdAt: existingProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const totalSteps = 4;

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedProfile = (section: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const completeProfile = profile as UserProfile;
    userService.saveUserProfile(completeProfile);
    onComplete(completeProfile);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => updateProfile('firstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => updateProfile('lastName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={profile.gender}
            onChange={(e) => updateProfile('gender', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type (Optional)</label>
          <select
            value={profile.bloodType}
            onChange={(e) => updateProfile('bloodType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
          <Heart className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Physical Information</h2>
        <p className="text-gray-600">Help us understand your physical health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={profile.height}
            onChange={(e) => updateProfile('height', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="170"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => updateProfile('weight', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="70"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (Optional)</label>
        <textarea
          value={profile.allergies?.join(', ')}
          onChange={(e) => updateProfile('allergies', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="List any allergies, separated by commas"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications (Optional)</label>
        <textarea
          value={profile.medications?.join(', ')}
          onChange={(e) => updateProfile('medications', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="List current medications, separated by commas"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions (Optional)</label>
        <textarea
          value={profile.medicalConditions?.join(', ')}
          onChange={(e) => updateProfile('medicalConditions', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="List any medical conditions, separated by commas"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
          <Activity className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Lifestyle Information</h2>
        <p className="text-gray-600">Tell us about your daily habits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
          <select
            value={profile.lifestyle?.activityLevel}
            onChange={(e) => updateNestedProfile('lifestyle', 'activityLevel', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="sedentary">Sedentary (little to no exercise)</option>
            <option value="lightly-active">Lightly Active (light exercise 1-3 days/week)</option>
            <option value="moderately-active">Moderately Active (moderate exercise 3-5 days/week)</option>
            <option value="very-active">Very Active (hard exercise 6-7 days/week)</option>
            <option value="extremely-active">Extremely Active (very hard exercise, physical job)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Hours per Night</label>
          <input
            type="number"
            min="4"
            max="12"
            step="0.5"
            value={profile.lifestyle?.sleepHours}
            onChange={(e) => updateNestedProfile('lifestyle', 'sleepHours', parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
          <select
            value={profile.lifestyle?.smokingStatus}
            onChange={(e) => updateNestedProfile('lifestyle', 'smokingStatus', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="never">Never smoked</option>
            <option value="former">Former smoker</option>
            <option value="current">Current smoker</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol Consumption</label>
          <select
            value={profile.lifestyle?.alcoholConsumption}
            onChange={(e) => updateNestedProfile('lifestyle', 'alcoholConsumption', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="none">None</option>
            <option value="occasional">Occasional (1-2 drinks/week)</option>
            <option value="moderate">Moderate (3-7 drinks/week)</option>
            <option value="heavy">Heavy (8+ drinks/week)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={profile.lifestyle?.stressLevel}
            onChange={(e) => updateNestedProfile('lifestyle', 'stressLevel', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
          <select
            value={profile.lifestyle?.dietType}
            onChange={(e) => updateNestedProfile('lifestyle', 'dietType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Ketogenic</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
          <Calendar className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Emergency Contact & Preferences</h2>
        <p className="text-gray-600">Final details to personalize your experience</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={profile.emergencyContact?.name}
              onChange={(e) => updateNestedProfile('emergencyContact', 'name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.emergencyContact?.phone}
              onChange={(e) => updateNestedProfile('emergencyContact', 'phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <input
              type="text"
              value={profile.emergencyContact?.relationship}
              onChange={(e) => updateNestedProfile('emergencyContact', 'relationship', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Spouse, Parent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
          <select
            value={profile.preferences?.units}
            onChange={(e) => updateNestedProfile('preferences', 'units', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lbs, ft/in)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={profile.preferences?.language}
            onChange={(e) => updateNestedProfile('preferences', 'language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profile.preferences?.notifications?.reminders}
              onChange={(e) => updateNestedProfile('preferences', 'notifications', {
                ...profile.preferences?.notifications,
                reminders: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Health reminders</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profile.preferences?.notifications?.insights}
              onChange={(e) => updateNestedProfile('preferences', 'notifications', {
                ...profile.preferences?.notifications,
                insights: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">AI insights and recommendations</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profile.preferences?.notifications?.goals}
              onChange={(e) => updateNestedProfile('preferences', 'notifications', {
                ...profile.preferences?.notifications,
                goals: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Goal progress updates</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {existingProfile ? 'Update Profile' : 'Complete Your Health Profile'}
            </h1>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {currentStep === totalSteps ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Complete Profile
                </>
              ) : (
                'Next Step'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
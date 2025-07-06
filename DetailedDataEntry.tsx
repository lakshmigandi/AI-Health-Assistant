import React, { useState } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Minus, 
  Clock, 
  Utensils, 
  Activity, 
  Moon, 
  Heart, 
  Pill,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { DetailedHealthData, NutritionData, ExerciseData, SleepData, SymptomData, MedicationData, VitalData } from '../types/user';
import { userService } from '../services/userService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface DetailedDataEntryProps {
  type: 'nutrition' | 'exercise' | 'sleep' | 'symptoms' | 'medication' | 'vitals';
  onSave: (data: DetailedHealthData) => void;
  onCancel: () => void;
  existingData?: DetailedHealthData;
}

export const DetailedDataEntry: React.FC<DetailedDataEntryProps> = ({
  type,
  onSave,
  onCancel,
  existingData
}) => {
  const [formData, setFormData] = useState(() => {
    if (existingData) return existingData.data;
    
    switch (type) {
      case 'nutrition':
        return {
          meals: [{ type: 'breakfast', foods: [{ name: '', quantity: 0, unit: '' }], time: '' }],
          waterIntake: 0,
          supplements: []
        } as NutritionData;
      case 'exercise':
        return {
          activities: [{ type: '', duration: 0, intensity: 'moderate', caloriesBurned: 0 }],
          steps: 0,
          activeMinutes: 0
        } as ExerciseData;
      case 'sleep':
        return {
          bedtime: '',
          wakeTime: '',
          totalSleep: 0,
          sleepQuality: 3,
          sleepDisturbances: []
        } as SleepData;
      case 'symptoms':
        return {
          symptoms: [{ name: '', severity: 3, duration: '' }],
          mood: 3,
          energyLevel: 3,
          stressLevel: 3
        } as SymptomData;
      case 'medication':
        return {
          medications: [{ name: '', dosage: '', timeTaken: '', adherence: true }]
        } as MedicationData;
      case 'vitals':
        return {
          bloodPressure: { systolic: 0, diastolic: 0 },
          heartRate: 0,
          temperature: 0,
          weight: 0
        } as VitalData;
      default:
        return {};
    }
  });

  const [notes, setNotes] = useState(existingData?.notes || '');
  const { speak } = useTextToSpeech();

  const handleSave = () => {
    const profile = userService.getUserProfile();
    if (!profile) return;

    const dataEntry: DetailedHealthData = {
      id: existingData?.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: profile.id,
      type,
      timestamp: existingData?.timestamp || new Date().toISOString(),
      data: formData,
      notes: notes.trim() || undefined,
      source: 'manual'
    };

    onSave(dataEntry);
    speak(`${type} data saved successfully`);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'nutrition': return <Utensils className="w-6 h-6" />;
      case 'exercise': return <Activity className="w-6 h-6" />;
      case 'sleep': return <Moon className="w-6 h-6" />;
      case 'symptoms': return <AlertCircle className="w-6 h-6" />;
      case 'medication': return <Pill className="w-6 h-6" />;
      case 'vitals': return <Heart className="w-6 h-6" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'nutrition': return 'from-green-500 to-emerald-500';
      case 'exercise': return 'from-blue-500 to-cyan-500';
      case 'sleep': return 'from-purple-500 to-indigo-500';
      case 'symptoms': return 'from-yellow-500 to-orange-500';
      case 'medication': return 'from-red-500 to-pink-500';
      case 'vitals': return 'from-teal-500 to-green-500';
    }
  };

  const renderNutritionForm = () => {
    const data = formData as NutritionData;
    
    return (
      <div className="space-y-6">
        {/* Meals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Meals</label>
          {data.meals.map((meal, mealIndex) => (
            <div key={mealIndex} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={meal.type}
                  onChange={(e) => {
                    const newMeals = [...data.meals];
                    newMeals[mealIndex].type = e.target.value as any;
                    setFormData({ ...data, meals: newMeals });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
                <input
                  type="time"
                  value={meal.time}
                  onChange={(e) => {
                    const newMeals = [...data.meals];
                    newMeals[mealIndex].time = e.target.value;
                    setFormData({ ...data, meals: newMeals });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newMeals = data.meals.filter((_, i) => i !== mealIndex);
                    setFormData({ ...data, meals: newMeals });
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Foods */}
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                  <input
                    type="text"
                    placeholder="Food name"
                    value={food.name}
                    onChange={(e) => {
                      const newMeals = [...data.meals];
                      newMeals[mealIndex].foods[foodIndex].name = e.target.value;
                      setFormData({ ...data, meals: newMeals });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={food.quantity}
                    onChange={(e) => {
                      const newMeals = [...data.meals];
                      newMeals[mealIndex].foods[foodIndex].quantity = parseFloat(e.target.value) || 0;
                      setFormData({ ...data, meals: newMeals });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={food.unit}
                    onChange={(e) => {
                      const newMeals = [...data.meals];
                      newMeals[mealIndex].foods[foodIndex].unit = e.target.value;
                      setFormData({ ...data, meals: newMeals });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newMeals = [...data.meals];
                      newMeals[mealIndex].foods = meal.foods.filter((_, i) => i !== foodIndex);
                      setFormData({ ...data, meals: newMeals });
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newMeals = [...data.meals];
                  newMeals[mealIndex].foods.push({ name: '', quantity: 0, unit: '' });
                  setFormData({ ...data, meals: newMeals });
                }}
                className="mt-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Food
              </button>
            </div>
          ))}
          
          <button
            onClick={() => {
              setFormData({
                ...data,
                meals: [...data.meals, { type: 'snack', foods: [{ name: '', quantity: 0, unit: '' }], time: '' }]
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Meal
          </button>
        </div>

        {/* Water Intake */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Water Intake (ml)</label>
          <input
            type="number"
            value={data.waterIntake}
            onChange={(e) => setFormData({ ...data, waterIntake: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="2000"
          />
        </div>

        {/* Supplements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplements</label>
          <textarea
            value={data.supplements.join(', ')}
            onChange={(e) => setFormData({ 
              ...data, 
              supplements: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Vitamin D, Omega-3, etc."
            rows={2}
          />
        </div>
      </div>
    );
  };

  const renderExerciseForm = () => {
    const data = formData as ExerciseData;
    
    return (
      <div className="space-y-6">
        {/* Activities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Activities</label>
          {data.activities.map((activity, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Exercise type"
                  value={activity.type}
                  onChange={(e) => {
                    const newActivities = [...data.activities];
                    newActivities[index].type = e.target.value;
                    setFormData({ ...data, activities: newActivities });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={activity.duration}
                  onChange={(e) => {
                    const newActivities = [...data.activities];
                    newActivities[index].duration = parseInt(e.target.value) || 0;
                    setFormData({ ...data, activities: newActivities });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={activity.intensity}
                  onChange={(e) => {
                    const newActivities = [...data.activities];
                    newActivities[index].intensity = e.target.value as any;
                    setFormData({ ...data, activities: newActivities });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
                <button
                  onClick={() => {
                    const newActivities = data.activities.filter((_, i) => i !== index);
                    setFormData({ ...data, activities: newActivities });
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => {
              setFormData({
                ...data,
                activities: [...data.activities, { type: '', duration: 0, intensity: 'moderate', caloriesBurned: 0 }]
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Activity
          </button>
        </div>

        {/* Steps and Active Minutes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
            <input
              type="number"
              value={data.steps}
              onChange={(e) => setFormData({ ...data, steps: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Minutes</label>
            <input
              type="number"
              value={data.activeMinutes}
              onChange={(e) => setFormData({ ...data, activeMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSleepForm = () => {
    const data = formData as SleepData;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bedtime</label>
            <input
              type="time"
              value={data.bedtime}
              onChange={(e) => setFormData({ ...data, bedtime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wake Time</label>
            <input
              type="time"
              value={data.wakeTime}
              onChange={(e) => setFormData({ ...data, wakeTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Sleep (hours)</label>
            <input
              type="number"
              step="0.5"
              value={data.totalSleep}
              onChange={(e) => setFormData({ ...data, totalSleep: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Quality (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={data.sleepQuality}
              onChange={(e) => setFormData({ ...data, sleepQuality: parseInt(e.target.value) as any })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Disturbances</label>
          <textarea
            value={data.sleepDisturbances.join(', ')}
            onChange={(e) => setFormData({ 
              ...data, 
              sleepDisturbances: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Noise, stress, temperature, etc."
            rows={2}
          />
        </div>
      </div>
    );
  };

  const renderSymptomsForm = () => {
    const data = formData as SymptomData;
    
    return (
      <div className="space-y-6">
        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Symptoms</label>
          {data.symptoms.map((symptom, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Symptom name"
                  value={symptom.name}
                  onChange={(e) => {
                    const newSymptoms = [...data.symptoms];
                    newSymptoms[index].name = e.target.value;
                    setFormData({ ...data, symptoms: newSymptoms });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Severity (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={symptom.severity}
                    onChange={(e) => {
                      const newSymptoms = [...data.symptoms];
                      newSymptoms[index].severity = parseInt(e.target.value) as any;
                      setFormData({ ...data, symptoms: newSymptoms });
                    }}
                    className="w-full"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Duration"
                  value={symptom.duration}
                  onChange={(e) => {
                    const newSymptoms = [...data.symptoms];
                    newSymptoms[index].duration = e.target.value;
                    setFormData({ ...data, symptoms: newSymptoms });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  const newSymptoms = data.symptoms.filter((_, i) => i !== index);
                  setFormData({ ...data, symptoms: newSymptoms });
                }}
                className="mt-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            onClick={() => {
              setFormData({
                ...data,
                symptoms: [...data.symptoms, { name: '', severity: 3, duration: '' }]
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Symptom
          </button>
        </div>

        {/* Mood, Energy, Stress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={data.mood}
              onChange={(e) => setFormData({ ...data, mood: parseInt(e.target.value) as any })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={data.energyLevel}
              onChange={(e) => setFormData({ ...data, energyLevel: parseInt(e.target.value) as any })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={data.stressLevel}
              onChange={(e) => setFormData({ ...data, stressLevel: parseInt(e.target.value) as any })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (type) {
      case 'nutrition': return renderNutritionForm();
      case 'exercise': return renderExerciseForm();
      case 'sleep': return renderSleepForm();
      case 'symptoms': return renderSymptomsForm();
      default: return <div>Form not implemented for {type}</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`bg-gradient-to-r ${getTypeColor()} rounded-lg p-3`}>
                {getTypeIcon()}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {existingData ? 'Edit' : 'Add'} {type} Data
                </h2>
                <p className="text-gray-600">Track your {type} information</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => speak(`${type} data entry form is ready for input`)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Read form description"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {renderForm()}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes or observations..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save {type.charAt(0).toUpperCase() + type.slice(1)} Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height: number; // in cm
  weight: number; // in kg
  bloodType?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  lifestyle: {
    activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
    sleepHours: number;
    stressLevel: 1 | 2 | 3 | 4 | 5;
    dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean' | 'other';
  };
  preferences: {
    units: 'metric' | 'imperial';
    language: string;
    notifications: {
      reminders: boolean;
      insights: boolean;
      goals: boolean;
    };
    voiceSettings: {
      enabled: boolean;
      autoSpeak: boolean;
      voiceSpeed: number;
      voicePitch: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'trend' | 'educational';
  title: string;
  content: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'mental-health' | 'preventive-care' | 'medication' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  dataPoints: string[]; // IDs of health metrics that influenced this insight
  actionItems: string[];
  isRead: boolean;
  isFavorited: boolean;
  createdAt: string;
  expiresAt?: string;
  tags: string[];
  relatedInsights: string[];
}

export interface HealthMetricHistory {
  id: string;
  userId: string;
  metricType: string;
  value: number;
  unit: string;
  notes?: string;
  timestamp: string;
  source: 'manual' | 'voice' | 'device' | 'imported';
  context?: {
    beforeMeal?: boolean;
    afterExercise?: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    mood?: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface DetailedHealthData {
  id: string;
  userId: string;
  type: 'nutrition' | 'exercise' | 'sleep' | 'symptoms' | 'medication' | 'vitals';
  timestamp: string;
  data: NutritionData | ExerciseData | SleepData | SymptomData | MedicationData | VitalData;
  notes?: string;
  source: 'manual' | 'voice' | 'device' | 'imported';
}

export interface NutritionData {
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: {
      name: string;
      quantity: number;
      unit: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
      };
    }[];
    time: string;
  }[];
  waterIntake: number; // in ml
  supplements: string[];
}

export interface ExerciseData {
  activities: {
    type: string;
    duration: number; // in minutes
    intensity: 'low' | 'moderate' | 'high' | 'very-high';
    caloriesBurned?: number;
    heartRateAvg?: number;
    heartRateMax?: number;
    notes?: string;
  }[];
  steps: number;
  activeMinutes: number;
}

export interface SleepData {
  bedtime: string;
  wakeTime: string;
  totalSleep: number; // in hours
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  sleepStages?: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  sleepDisturbances: string[];
}

export interface SymptomData {
  symptoms: {
    name: string;
    severity: 1 | 2 | 3 | 4 | 5;
    duration: string;
    triggers?: string[];
    location?: string;
  }[];
  mood: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
}

export interface MedicationData {
  medications: {
    name: string;
    dosage: string;
    timeTaken: string;
    adherence: boolean;
    sideEffects?: string[];
  }[];
}

export interface VitalData {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  bloodSugar?: number;
  oxygenSaturation?: number;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  actionsPerformed: string[];
  voiceCommandsUsed: number;
  insightsViewed: string[];
  dataEntriesAdded: number;
  featuresUsed: string[];
}

export interface HealthTrend {
  id: string;
  userId: string;
  metricType: string;
  trend: 'improving' | 'declining' | 'stable' | 'fluctuating';
  changePercent: number;
  timeframe: string;
  significance: 'low' | 'medium' | 'high';
  createdAt: string;
}
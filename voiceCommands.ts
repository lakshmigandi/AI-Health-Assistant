export interface VoiceCommand {
  patterns: string[];
  action: string;
  description: string;
  category: 'navigation' | 'data' | 'reminder' | 'goal' | 'health' | 'general';
}

export const voiceCommands: VoiceCommand[] = [
  // Navigation Commands
  {
    patterns: ['show dashboard', 'go to dashboard', 'dashboard', 'home'],
    action: 'navigate_dashboard',
    description: 'Navigate to the main dashboard',
    category: 'navigation'
  },
  {
    patterns: ['show reminders', 'go to reminders', 'reminders', 'my reminders'],
    action: 'navigate_reminders',
    description: 'Navigate to reminders page',
    category: 'navigation'
  },
  {
    patterns: ['show goals', 'go to goals', 'goals', 'my goals', 'health goals'],
    action: 'navigate_goals',
    description: 'Navigate to health goals page',
    category: 'navigation'
  },
  {
    patterns: ['show insights', 'go to insights', 'insights', 'my insights', 'health insights', 'insights history'],
    action: 'navigate_insights',
    description: 'Navigate to health insights history',
    category: 'navigation'
  },

  // Health Data Commands
  {
    patterns: ['what is my blood pressure', 'show blood pressure', 'blood pressure', 'bp'],
    action: 'show_blood_pressure',
    description: 'Show current blood pressure reading',
    category: 'health'
  },
  {
    patterns: ['what is my heart rate', 'show heart rate', 'heart rate', 'pulse'],
    action: 'show_heart_rate',
    description: 'Show current heart rate',
    category: 'health'
  },
  {
    patterns: ['what is my bmi', 'show bmi', 'body mass index', 'weight status'],
    action: 'show_bmi',
    description: 'Show current BMI',
    category: 'health'
  },
  {
    patterns: ['how did i sleep', 'sleep quality', 'show sleep', 'sleep score'],
    action: 'show_sleep',
    description: 'Show sleep quality metrics',
    category: 'health'
  },

  // Data Input Commands
  {
    patterns: ['add blood pressure', 'record blood pressure', 'log bp', 'enter blood pressure'],
    action: 'add_blood_pressure',
    description: 'Add new blood pressure reading',
    category: 'data'
  },
  {
    patterns: ['add weight', 'record weight', 'log weight', 'enter weight'],
    action: 'add_weight',
    description: 'Add new weight measurement',
    category: 'data'
  },
  {
    patterns: ['add exercise', 'record workout', 'log exercise', 'enter activity'],
    action: 'add_exercise',
    description: 'Add exercise or activity',
    category: 'data'
  },

  // Reminder Commands
  {
    patterns: ['add reminder', 'create reminder', 'new reminder', 'set reminder'],
    action: 'add_reminder',
    description: 'Create a new health reminder',
    category: 'reminder'
  },
  {
    patterns: ['show next appointment', 'next appointment', 'upcoming appointment'],
    action: 'show_next_appointment',
    description: 'Show next scheduled appointment',
    category: 'reminder'
  },
  {
    patterns: ['medication reminder', 'medicine reminder', 'pill reminder'],
    action: 'medication_reminder',
    description: 'Set medication reminder',
    category: 'reminder'
  },

  // Goal Commands
  {
    patterns: ['set goal', 'create goal', 'new goal', 'add goal'],
    action: 'set_goal',
    description: 'Set a new health goal',
    category: 'goal'
  },
  {
    patterns: ['show progress', 'my progress', 'goal progress', 'how am i doing'],
    action: 'show_progress',
    description: 'Show progress on health goals',
    category: 'goal'
  },

  // General Commands
  {
    patterns: ['help', 'what can you do', 'commands', 'voice commands'],
    action: 'show_help',
    description: 'Show available voice commands',
    category: 'general'
  },
  {
    patterns: ['read recommendations', 'health recommendations', 'suggestions', 'advice', 'read insights'],
    action: 'read_recommendations',
    description: 'Read AI health recommendations aloud',
    category: 'general'
  }
];

export const parseVoiceCommand = (transcript: string): VoiceCommand | null => {
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  for (const command of voiceCommands) {
    for (const pattern of command.patterns) {
      if (normalizedTranscript.includes(pattern)) {
        return command;
      }
    }
  }
  
  return null;
};

export const getCommandsByCategory = (category: string): VoiceCommand[] => {
  return voiceCommands.filter(command => command.category === category);
};

export const getAllCommands = (): VoiceCommand[] => {
  return voiceCommands;
};
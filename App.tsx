import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Calendar, 
  Shield, 
  Brain, 
  TrendingUp, 
  Bell, 
  User, 
  Settings, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Smartphone,
  Mic,
  Volume2,
  History,
  UserCheck,
  Plus,
  TestTube,
  Utensils,
  Moon,
  Pill,
  BarChart3,
  LineChart,
  Layers
} from 'lucide-react';
import { VoiceAssistant } from './components/VoiceAssistant';
import { VoiceDataInput } from './components/VoiceDataInput';
import { UserProfileSetup } from './components/UserProfileSetup';
import { InsightsHistory } from './components/InsightsHistory';
import { DetailedDataEntry } from './components/DetailedDataEntry';
import { DataTestingPanel } from './components/DataTestingPanel';
import { ElevenLabsSetup } from './components/ElevenLabsSetup';
import { HealthStoryboard } from './components/HealthStoryboard';
import { InteractiveHealthDashboard } from './components/InteractiveHealthDashboard';
import { HealthInsightCards } from './components/HealthInsightCards';
import { parseVoiceCommand } from './utils/voiceCommands';
import { useEnhancedTextToSpeech } from './hooks/useEnhancedTextToSpeech';
import { userService } from './services/userService';
import { UserProfile, HealthInsight, HealthMetricHistory, DetailedHealthData } from './types/user';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target: number;
}

interface Reminder {
  id: string;
  title: string;
  type: 'appointment' | 'medication' | 'screening' | 'exercise';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface HealthGoal {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
  category: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showDetailedDataEntry, setShowDetailedDataEntry] = useState(false);
  const [showDataTesting, setShowDataTesting] = useState(false);
  const [showElevenLabsSetup, setShowElevenLabsSetup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dataEntryType, setDataEntryType] = useState<'nutrition' | 'exercise' | 'sleep' | 'symptoms' | 'medication' | 'vitals'>('nutrition');
  const [voiceInputConfig, setVoiceInputConfig] = useState<{
    label: string;
    placeholder: string;
    dataType: 'number' | 'text' | 'date';
    unit?: string;
  } | null>(null);

  const { 
    speak, 
    stop: stopSpeaking,
    isSpeaking,
    isElevenLabsConfigured,
    isElevenLabsEnabled,
    setElevenLabsEnabled
  } = useEnhancedTextToSpeech();

  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      id: '1',
      name: 'Blood Pressure',
      value: 118,
      unit: 'mmHg',
      status: 'good',
      trend: 'stable',
      target: 120
    },
    {
      id: '2',
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'good',
      trend: 'down',
      target: 70
    },
    {
      id: '3',
      name: 'BMI',
      value: 23.5,
      unit: '',
      status: 'good',
      trend: 'stable',
      target: 22
    },
    {
      id: '4',
      name: 'Sleep Quality',
      value: 85,
      unit: '%',
      status: 'good',
      trend: 'up',
      target: 90
    }
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Annual Physical Exam',
      type: 'appointment',
      dueDate: '2025-02-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Flu Vaccination',
      type: 'screening',
      dueDate: '2025-01-20',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Daily Vitamin D',
      type: 'medication',
      dueDate: 'Today',
      priority: 'low'
    }
  ]);

  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([
    {
      id: '1',
      title: 'Daily Steps',
      progress: 8500,
      target: 10000,
      unit: 'steps',
      category: 'fitness'
    },
    {
      id: '2',
      title: 'Water Intake',
      progress: 6,
      target: 8,
      unit: 'glasses',
      category: 'nutrition'
    },
    {
      id: '3',
      title: 'Sleep Duration',
      progress: 7.5,
      target: 8,
      unit: 'hours',
      category: 'wellness'
    }
  ]);

  // Initialize app and load user profile
  useEffect(() => {
    const profile = userService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
      // Start a new session
      userService.startSession(profile.id);
      
      // Generate personalized insights based on profile
      generatePersonalizedInsights(profile);
    } else {
      setShowProfileSetup(true);
    }

    // Cleanup session on unmount
    return () => {
      userService.endSession();
    };
  }, []);

  const generatePersonalizedInsights = (profile: UserProfile) => {
    const recentMetrics = userService.getHealthMetricHistory(undefined, 10);
    const insights = userService.generatePersonalizedInsights(profile, recentMetrics);
    
    // Save new insights
    insights.forEach(insight => {
      userService.saveHealthInsight(insight);
    });
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowProfileSetup(false);
    
    // Start session for new user
    userService.startSession(profile.id);
    
    // Generate initial insights
    generatePersonalizedInsights(profile);
    
    // Welcome message with enhanced voice
    const welcomeMessage = `Welcome to HealthAssist AI, ${profile.firstName}! Your personalized health assistant is ready to help you achieve your wellness goals. ${isElevenLabsConfigured ? 'I\'m speaking with premium AI voice technology for the best experience.' : 'You can enable premium voice in settings for an enhanced experience.'}`;
    speak(welcomeMessage);
  };

  const handleVoiceCommand = (transcript: string) => {
    const command = parseVoiceCommand(transcript);
    
    // Update session with voice command usage
    userService.updateCurrentSession({
      voiceCommandsUsed: (userService.getCurrentSession()?.voiceCommandsUsed || 0) + 1,
      actionsPerformed: [...(userService.getCurrentSession()?.actionsPerformed || []), `voice_command: ${transcript}`]
    });
    
    if (!command) {
      speak("I didn't understand that command. Try saying 'help' to see what I can do.");
      return;
    }

    switch (command.action) {
      case 'navigate_dashboard':
        setActiveTab('dashboard');
        speak('Showing your health dashboard');
        break;
      
      case 'navigate_reminders':
        setActiveTab('reminders');
        speak('Showing your health reminders');
        break;
      
      case 'navigate_goals':
        setActiveTab('goals');
        speak('Showing your health goals');
        break;

      case 'navigate_insights':
        setActiveTab('insights');
        speak('Showing your health insights history');
        break;
      
      case 'show_blood_pressure':
        const bp = healthMetrics.find(m => m.name === 'Blood Pressure');
        if (bp) {
          speak(`Your current blood pressure is ${bp.value} ${bp.unit}. This is ${bp.status}.`);
        }
        break;
      
      case 'show_heart_rate':
        const hr = healthMetrics.find(m => m.name === 'Heart Rate');
        if (hr) {
          speak(`Your current heart rate is ${hr.value} ${hr.unit}. This is ${hr.status}.`);
        }
        break;
      
      case 'show_bmi':
        const bmi = healthMetrics.find(m => m.name === 'BMI');
        if (bmi) {
          speak(`Your current BMI is ${bmi.value}. This is ${bmi.status}.`);
        }
        break;
      
      case 'show_sleep':
        const sleep = healthMetrics.find(m => m.name === 'Sleep Quality');
        if (sleep) {
          speak(`Your sleep quality score is ${sleep.value}${sleep.unit}. This is ${sleep.status}.`);
        }
        break;
      
      case 'add_blood_pressure':
        setVoiceInputConfig({
          label: 'Blood Pressure',
          placeholder: 'Enter systolic pressure (e.g., 120)',
          dataType: 'number',
          unit: 'mmHg'
        });
        setShowVoiceInput(true);
        break;
      
      case 'add_weight':
        setVoiceInputConfig({
          label: 'Weight',
          placeholder: 'Enter your weight',
          dataType: 'number',
          unit: userProfile?.preferences.units === 'imperial' ? 'lbs' : 'kg'
        });
        setShowVoiceInput(true);
        break;
      
      case 'add_reminder':
        speak('Opening reminder creation. Please specify what you want to be reminded about.');
        setActiveTab('reminders');
        break;
      
      case 'set_goal':
        speak('Opening goal setting. What health goal would you like to set?');
        setActiveTab('goals');
        break;
      
      case 'show_progress':
        setActiveTab('goals');
        const totalGoals = healthGoals.length;
        const completedGoals = healthGoals.filter(g => g.progress >= g.target).length;
        speak(`You have ${completedGoals} out of ${totalGoals} goals completed. Great progress!`);
        break;
      
      case 'read_recommendations':
        const insights = userService.getHealthInsights({ isRead: false }).slice(0, 3);
        if (insights.length > 0) {
          const insightText = insights.map(i => i.title).join('. ');
          speak(`Here are your latest health insights: ${insightText}. Check your insights tab for more details.`);
        } else {
          speak('You have no new health insights at the moment. Keep tracking your health data for personalized recommendations.');
        }
        break;
      
      case 'show_help':
        speak('I can help you navigate your health dashboard, check your vital signs, add health data, set reminders, manage your health goals, and view your personalized insights. Try saying things like "show my blood pressure" or "add a reminder".');
        break;
      
      default:
        speak("I understand your request, but I'm not sure how to help with that yet.");
    }
  };

  const handleVoiceDataSave = (value: string) => {
    if (voiceInputConfig && userProfile) {
      // Save to health metrics history
      const metric: HealthMetricHistory = {
        id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userProfile.id,
        metricType: voiceInputConfig.label.toLowerCase().replace(' ', '_'),
        value: parseFloat(value),
        unit: voiceInputConfig.unit || '',
        timestamp: new Date().toISOString(),
        source: 'voice'
      };
      
      userService.saveHealthMetric(metric);
      
      // Update current health metrics display
      if (voiceInputConfig.label === 'Blood Pressure') {
        setHealthMetrics(prev => prev.map(m => 
          m.name === 'Blood Pressure' 
            ? { ...m, value: parseFloat(value) }
            : m
        ));
      } else if (voiceInputConfig.label === 'Weight' && userProfile) {
        // Update user profile weight
        const updatedProfile = userService.updateUserProfile({ weight: parseFloat(value) });
        if (updatedProfile) {
          setUserProfile(updatedProfile);
        }
      }
      
      speak(`${voiceInputConfig.label} of ${value} ${voiceInputConfig.unit || ''} has been saved successfully.`);
      
      // Update session
      userService.updateCurrentSession({
        actionsPerformed: [...(userService.getCurrentSession()?.actionsPerformed || []), `data_entry: ${voiceInputConfig.label}`]
      });
    }
    
    setShowVoiceInput(false);
    setVoiceInputConfig(null);
  };

  const handleVoiceDataCancel = () => {
    setShowVoiceInput(false);
    setVoiceInputConfig(null);
  };

  const handleDetailedDataSave = (data: DetailedHealthData) => {
    userService.saveDetailedHealthData(data);
    setShowDetailedDataEntry(false);
    
    // Update session
    userService.updateCurrentSession({
      dataEntriesAdded: (userService.getCurrentSession()?.dataEntriesAdded || 0) + 1,
      actionsPerformed: [...(userService.getCurrentSession()?.actionsPerformed || []), `detailed_data_entry: ${data.type}`]
    });

    // Regenerate insights with new data
    if (userProfile) {
      generatePersonalizedInsights(userProfile);
    }
  };

  const handleDetailedDataCancel = () => {
    setShowDetailedDataEntry(false);
  };

  const openDetailedDataEntry = (type: typeof dataEntryType) => {
    setDataEntryType(type);
    setShowDetailedDataEntry(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Voice Assistant */}
      <VoiceAssistant onVoiceCommand={handleVoiceCommand} />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-8 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {userProfile?.firstName || 'User'}!
            </h2>
            <p className="text-blue-100 text-lg">Your health is looking great today. Here's your personalized health summary.</p>
            {isElevenLabsConfigured && (
              <div className="mt-2 flex items-center text-blue-100">
                <Volume2 className="w-4 h-4 mr-2" />
                <span className="text-sm">Premium AI voice enabled</span>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Health Storytelling Section */}
      {userProfile && (
        <HealthStoryboard userProfile={userProfile} />
      )}

      {/* Interactive Health Dashboard */}
      {userProfile && (
        <InteractiveHealthDashboard userProfile={userProfile} />
      )}

      {/* Health Insights Cards */}
      <HealthInsightCards limit={6} />

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <button
                  onClick={() => speak(`Your ${metric.name.toLowerCase()} is ${metric.value} ${metric.unit}. This is ${metric.status}.`)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
              </div>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Data Entry Options */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Track Your Health Data</h3>
            <p className="text-sm text-gray-600">Add detailed health information for better AI insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => openDetailedDataEntry('nutrition')}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-center group"
          >
            <div className="bg-green-100 rounded-lg p-3 mx-auto mb-2 w-fit group-hover:bg-green-200">
              <Utensils className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Nutrition</span>
          </button>

          <button
            onClick={() => openDetailedDataEntry('exercise')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
          >
            <div className="bg-blue-100 rounded-lg p-3 mx-auto mb-2 w-fit group-hover:bg-blue-200">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Exercise</span>
          </button>

          <button
            onClick={() => openDetailedDataEntry('sleep')}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-center group"
          >
            <div className="bg-purple-100 rounded-lg p-3 mx-auto mb-2 w-fit group-hover:bg-purple-200">
              <Moon className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Sleep</span>
          </button>

          <button
            onClick={() => openDetailedDataEntry('symptoms')}
            className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="bg-yellow-100 rounded-lg p-3 mx-auto mb-2 w-fit group-hover:bg-yellow-200">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Symptoms</span>
          </button>

          <button
            onClick={() => openDetailedDataEntry('medication')}
            className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-center group"
          >
            <div className="bg-red-100 rounded-lg p-3 mx-auto mb-2 w-fit group-hover:bg-red-200">
              <Pill className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Medication</span>
          </button>

          <button
            onClick={() => openDetailedDataEntry('vitals')}
            className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all text-center group"
          >
            <div className="bg-teal-100 rounded-lg p-3 mx-auto mb-2 w-fit group-hover:bg-teal-200">
              <Heart className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Vitals</span>
          </button>
        </div>
      </div>

      {/* AI Testing Panel */}
      {showDataTesting && (
        <DataTestingPanel 
          onInsightsGenerated={() => {
            // Refresh insights display
            setActiveTab('insights');
          }}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setShowDataTesting(!showDataTesting)}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <TestTube className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">AI Testing</h4>
                <p className="text-sm text-gray-600">Test AI recommendations</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('insights')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Insights History</h4>
                <p className="text-sm text-gray-600">View past recommendations</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </button>

        <button 
          onClick={() => setShowElevenLabsSetup(true)}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`rounded-lg p-3 ${isElevenLabsConfigured ? 'bg-green-100' : 'bg-purple-100'}`}>
                <Volume2 className={`w-6 h-6 ${isElevenLabsConfigured ? 'text-green-600' : 'text-purple-600'}`} />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">
                  {isElevenLabsConfigured ? 'Voice Settings' : 'Premium Voice'}
                </h4>
                <p className="text-sm text-gray-600">
                  {isElevenLabsConfigured ? 'Configure ElevenLabs voice' : 'Setup premium AI voice'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Health Reminders</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => speak(`You have ${reminders.length} health reminders. ${reminders.map(r => `${r.title} due ${r.dueDate}`).join('. ')}`)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Read reminders aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Reminder
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`bg-white rounded-xl p-6 border-2 ${getPriorityColor(reminder.priority)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4">
                  {reminder.type === 'appointment' && <Calendar className="w-8 h-8 text-blue-600" />}
                  {reminder.type === 'medication' && <Clock className="w-8 h-8 text-green-600" />}
                  {reminder.type === 'screening' && <Shield className="w-8 h-8 text-purple-600" />}
                  {reminder.type === 'exercise' && <Activity className="w-8 h-8 text-orange-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                  <p className="text-sm text-gray-600">Due: {reminder.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => speak(`${reminder.title} is due ${reminder.dueDate}. Priority: ${reminder.priority}.`)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Read reminder aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                  {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Health Goals</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const totalGoals = healthGoals.length;
              const completedGoals = healthGoals.filter(g => g.progress >= g.target).length;
              speak(`You have ${completedGoals} out of ${totalGoals} goals completed. ${healthGoals.map(g => `${g.title}: ${Math.round((g.progress / g.target) * 100)}% complete`).join('. ')}`);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Read goals progress aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Set New Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthGoals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <button
                  onClick={() => speak(`${goal.title}: ${goal.progress} out of ${goal.target} ${goal.unit}. ${Math.round((goal.progress / goal.target) * 100)}% complete.`)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Read goal progress aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">{goal.progress}</span>
                <span className="text-sm text-gray-500">/ {goal.target} {goal.unit}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{goal.category}</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round((goal.progress / goal.target) * 100)}% Complete
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <UserProfileSetup
          existingProfile={userProfile}
          onComplete={handleProfileComplete}
        />
      )}

      {/* ElevenLabs Setup Modal */}
      {showElevenLabsSetup && (
        <ElevenLabsSetup
          onClose={() => setShowElevenLabsSetup(false)}
          onConfigured={() => {
            speak("Premium AI voice has been configured successfully! You'll now hear enhanced, natural-sounding speech for all health insights and interactions.");
          }}
        />
      )}

      {/* Voice Data Input Modal */}
      {showVoiceInput && voiceInputConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <VoiceDataInput
              label={voiceInputConfig.label}
              placeholder={voiceInputConfig.placeholder}
              dataType={voiceInputConfig.dataType}
              unit={voiceInputConfig.unit}
              onSave={handleVoiceDataSave}
              onCancel={handleVoiceDataCancel}
            />
          </div>
        </div>
      )}

      {/* Detailed Data Entry Modal */}
      {showDetailedDataEntry && (
        <DetailedDataEntry
          type={dataEntryType}
          onSave={handleDetailedDataSave}
          onCancel={handleDetailedDataCancel}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-2">
                <Heart className="w-8 h-8 text-white" />
              </div>
             AI<h1 className="ml-3 text-2xl font-bold text-gray-800">AI-Powered Personalized Preventive Health Assistant</h1>
              {isElevenLabsConfigured && (
                <div className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Premium Voice
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {userService.getHealthInsights({ isRead: false }).length}
                </span>
              </button>
              <button 
                onClick={() => setShowElevenLabsSetup(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Voice Settings"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setShowProfileSetup(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit Profile"
              >
                <UserCheck className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reminders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reminders
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Insights
              {userService.getHealthInsights({ isRead: false }).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {userService.getHealthInsights({ isRead: false }).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'reminders' && renderReminders()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'insights' && <InsightsHistory />}
      </main>
    </div>
  );
}

export default App;
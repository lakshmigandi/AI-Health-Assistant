import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  Moon, 
  Utensils, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Volume2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { userService } from '../services/userService';
import { UserProfile, HealthMetricHistory, DetailedHealthData } from '../types/user';
import { useEnhancedTextToSpeech } from '../hooks/useEnhancedTextToSpeech';

interface InteractiveHealthDashboardProps {
  userProfile: UserProfile;
  className?: string;
}

interface MetricCard {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: string;
  data: number[];
  target?: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  narrative: string;
}

export const InteractiveHealthDashboard: React.FC<InteractiveHealthDashboardProps> = ({ 
  userProfile, 
  className = '' 
}) => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricCard | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isNarrating, setIsNarrating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentNarrationIndex, setCurrentNarrationIndex] = useState(0);

  const { speak, stop, isSpeaking } = useEnhancedTextToSpeech();

  useEffect(() => {
    generateMetricCards();
  }, [userProfile, timeRange]);

  useEffect(() => {
    if (autoPlay && !isSpeaking && metrics.length > 0) {
      const timer = setTimeout(() => {
        if (currentNarrationIndex < metrics.length) {
          narrateMetric(metrics[currentNarrationIndex]);
          setCurrentNarrationIndex(prev => prev + 1);
        } else {
          setAutoPlay(false);
          setCurrentNarrationIndex(0);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [autoPlay, isSpeaking, currentNarrationIndex, metrics]);

  const generateMetricCards = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const recentMetrics = userService.getHealthMetricHistory(undefined, days);
    const detailedData = userService.getDetailedHealthData(undefined, days);

    const cards: MetricCard[] = [];

    // Sleep Quality Card
    const sleepData = detailedData.filter(d => d.type === 'sleep').slice(0, days);
    if (sleepData.length > 0) {
      const sleepScores = sleepData.map(d => (d.data as any).sleepQuality);
      const avgSleep = sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length;
      const trend = sleepScores.length > 1 ? 
        (sleepScores[0] > sleepScores[sleepScores.length - 1] ? 'up' : 
         sleepScores[0] < sleepScores[sleepScores.length - 1] ? 'down' : 'stable') : 'stable';

      cards.push({
        id: 'sleep-quality',
        title: 'Sleep Quality',
        value: avgSleep,
        unit: '/5',
        trend,
        trendValue: sleepScores.length > 1 ? Math.abs(sleepScores[0] - sleepScores[sleepScores.length - 1]) : 0,
        category: 'sleep',
        data: sleepScores.reverse(),
        target: 4,
        status: avgSleep >= 4 ? 'excellent' : avgSleep >= 3 ? 'good' : avgSleep >= 2 ? 'fair' : 'poor',
        narrative: `Your sleep quality has been ${avgSleep >= 4 ? 'excellent' : avgSleep >= 3 ? 'good' : 'challenging'} over the past ${timeRange}. ${trend === 'up' ? 'You\'re improving!' : trend === 'down' ? 'Consider focusing on sleep hygiene.' : 'You\'re maintaining consistency.'}`
      });
    }

    // Exercise Consistency Card
    const exerciseData = detailedData.filter(d => d.type === 'exercise').slice(0, days);
    if (exerciseData.length > 0) {
      const exerciseMinutes = exerciseData.map(d => 
        (d.data as any).activities.reduce((sum: number, act: any) => sum + act.duration, 0)
      );
      const totalMinutes = exerciseMinutes.reduce((a, b) => a + b, 0);
      const weeklyAvg = (totalMinutes / exerciseData.length) * 7;

      cards.push({
        id: 'exercise-consistency',
        title: 'Weekly Exercise',
        value: weeklyAvg,
        unit: 'min',
        trend: weeklyAvg >= 150 ? 'up' : weeklyAvg >= 75 ? 'stable' : 'down',
        trendValue: Math.abs(weeklyAvg - 150),
        category: 'exercise',
        data: exerciseMinutes.reverse(),
        target: 150,
        status: weeklyAvg >= 150 ? 'excellent' : weeklyAvg >= 75 ? 'good' : weeklyAvg >= 30 ? 'fair' : 'poor',
        narrative: `You're averaging ${Math.round(weeklyAvg)} minutes of exercise per week. ${weeklyAvg >= 150 ? 'Outstanding! You\'re exceeding health guidelines.' : weeklyAvg >= 75 ? 'Good progress toward the 150-minute weekly goal.' : 'Consider gradually increasing your activity level.'}`
      });
    }

    // Hydration Card
    const nutritionData = detailedData.filter(d => d.type === 'nutrition').slice(0, days);
    if (nutritionData.length > 0) {
      const waterIntakes = nutritionData.map(d => (d.data as any).waterIntake);
      const avgWater = waterIntakes.reduce((a, b) => a + b, 0) / waterIntakes.length;
      const targetWater = userProfile.weight * 35; // ml per kg

      cards.push({
        id: 'hydration',
        title: 'Daily Hydration',
        value: avgWater / 1000,
        unit: 'L',
        trend: avgWater >= targetWater ? 'up' : avgWater >= targetWater * 0.8 ? 'stable' : 'down',
        trendValue: Math.abs(avgWater - targetWater) / 1000,
        category: 'nutrition',
        data: waterIntakes.map(w => w / 1000).reverse(),
        target: targetWater / 1000,
        status: avgWater >= targetWater ? 'excellent' : avgWater >= targetWater * 0.8 ? 'good' : avgWater >= targetWater * 0.6 ? 'fair' : 'poor',
        narrative: `Your hydration averages ${(avgWater/1000).toFixed(1)}L daily. ${avgWater >= targetWater ? 'Perfect! You\'re meeting your hydration needs.' : 'Consider increasing water intake to reach your optimal level of ' + (targetWater/1000).toFixed(1) + 'L daily.'}`
      });
    }

    // Weight Trend Card
    const weightMetrics = recentMetrics.filter(m => m.metricType === 'weight').slice(0, days);
    if (weightMetrics.length >= 3) {
      const weights = weightMetrics.map(m => m.value);
      const currentWeight = weights[0];
      const oldestWeight = weights[weights.length - 1];
      const weightChange = currentWeight - oldestWeight;

      cards.push({
        id: 'weight-trend',
        title: 'Weight Trend',
        value: currentWeight,
        unit: 'kg',
        trend: weightChange > 0.5 ? 'up' : weightChange < -0.5 ? 'down' : 'stable',
        trendValue: Math.abs(weightChange),
        category: 'vitals',
        data: weights.reverse(),
        status: Math.abs(weightChange) <= 1 ? 'excellent' : Math.abs(weightChange) <= 2 ? 'good' : 'fair',
        narrative: `Your weight has ${Math.abs(weightChange) <= 0.5 ? 'remained stable' : weightChange > 0 ? 'increased by ' + weightChange.toFixed(1) + 'kg' : 'decreased by ' + Math.abs(weightChange).toFixed(1) + 'kg'} over the past ${timeRange}. ${Math.abs(weightChange) <= 1 ? 'This shows healthy stability.' : 'Monitor this trend and discuss with your healthcare provider if needed.'}`
      });
    }

    setMetrics(cards);
    if (cards.length > 0 && !selectedMetric) {
      setSelectedMetric(cards[0]);
    }
  };

  const narrateMetric = (metric: MetricCard) => {
    const fullNarration = `${metric.title}: ${metric.value.toFixed(1)} ${metric.unit}. ${metric.narrative}`;
    speak(fullNarration);
  };

  const startAutoNarration = () => {
    setAutoPlay(true);
    setCurrentNarrationIndex(0);
    setIsNarrating(true);
  };

  const stopAutoNarration = () => {
    setAutoPlay(false);
    setIsNarrating(false);
    stop();
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'sleep': return <Moon className="w-6 h-6" />;
      case 'exercise': return <Activity className="w-6 h-6" />;
      case 'nutrition': return <Utensils className="w-6 h-6" />;
      case 'vitals': return <Heart className="w-6 h-6" />;
      default: return <BarChart3 className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-green-500 to-emerald-500';
      case 'good': return 'from-blue-500 to-cyan-500';
      case 'fair': return 'from-yellow-500 to-orange-500';
      case 'poor': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const renderSparkline = (data: number[], color: string) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="h-12 flex items-end space-x-1">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 bg-gradient-to-t ${color} rounded-t opacity-70`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-3">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">Interactive Health Dashboard</h2>
            <p className="text-gray-600">Your health metrics with intelligent narration</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Auto Narration Controls */}
          <div className="flex items-center space-x-2">
            {!isNarrating ? (
              <button
                onClick={startAutoNarration}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Auto Narrate
              </button>
            ) : (
              <button
                onClick={stopAutoNarration}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.id}
            onClick={() => setSelectedMetric(metric)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMetric?.id === metric.id
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } ${isNarrating && currentNarrationIndex === index ? 'ring-4 ring-green-200' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-r ${getStatusColor(metric.status)} rounded-lg p-3`}>
                {getMetricIcon(metric.category)}
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    narrateMetric(metric);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{metric.value.toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
              </div>
              {metric.target && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${getStatusColor(metric.status)} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mini Sparkline */}
            {renderSparkline(metric.data, getStatusColor(metric.status))}

            <div className="mt-3 text-xs text-gray-600">
              <span className="capitalize">{metric.status}</span>
              {metric.trend !== 'stable' && (
                <span className="ml-2">
                  {metric.trend === 'up' ? '↗' : '↘'} {metric.trendValue.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Metric Detail */}
      {selectedMetric && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`bg-gradient-to-r ${getStatusColor(selectedMetric.status)} rounded-lg p-3`}>
                {getMetricIcon(selectedMetric.category)}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedMetric.title}</h3>
                <p className="text-gray-600">Detailed analysis and insights</p>
              </div>
            </div>
            <button
              onClick={() => narrateMetric(selectedMetric)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Narrate
            </button>
          </div>

          {/* Detailed Visualization */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Trend Over Time</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-32 flex items-end space-x-2">
                {selectedMetric.data.map((value, index) => {
                  const max = Math.max(...selectedMetric.data);
                  const min = Math.min(...selectedMetric.data);
                  const range = max - min || 1;
                  const height = ((value - min) / range) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full bg-gradient-to-t ${getStatusColor(selectedMetric.status)} rounded-t transition-all hover:opacity-80`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`Day ${index + 1}: ${value.toFixed(1)} ${selectedMetric.unit}`}
                      />
                      <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Narrative and Insights */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">AI Analysis</h4>
            <p className="text-blue-800">{selectedMetric.narrative}</p>
          </div>
        </div>
      )}
    </div>
  );
};
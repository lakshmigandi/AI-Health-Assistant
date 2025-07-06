import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award, 
  AlertTriangle,
  Heart,
  Activity,
  Moon,
  Utensils,
  Brain,
  ChevronRight,
  Play,
  Volume2,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { userService } from '../services/userService';
import { UserProfile, HealthMetricHistory, DetailedHealthData } from '../types/user';
import { useEnhancedTextToSpeech } from '../hooks/useEnhancedTextToSpeech';

interface HealthStoryboardProps {
  userProfile: UserProfile;
  className?: string;
}

interface HealthStory {
  id: string;
  title: string;
  narrative: string;
  dataPoints: any[];
  visualType: 'trend' | 'comparison' | 'achievement' | 'warning';
  category: string;
  timeframe: string;
  keyInsight: string;
  actionable: string;
  confidence: number;
}

export const HealthStoryboard: React.FC<HealthStoryboardProps> = ({ userProfile, className = '' }) => {
  const [stories, setStories] = useState<HealthStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<HealthStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { speak } = useEnhancedTextToSpeech();

  useEffect(() => {
    generateHealthStories();
  }, [userProfile]);

  const generateHealthStories = async () => {
    setIsGenerating(true);
    
    try {
      const recentMetrics = userService.getHealthMetricHistory(undefined, 30);
      const detailedData = userService.getDetailedHealthData(undefined, 14);
      
      const generatedStories = await createDataStories(recentMetrics, detailedData);
      setStories(generatedStories);
      
      if (generatedStories.length > 0) {
        setSelectedStory(generatedStories[0]);
      }
    } catch (error) {
      console.error('Failed to generate health stories:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createDataStories = async (metrics: HealthMetricHistory[], detailedData: DetailedHealthData[]): Promise<HealthStory[]> => {
    const stories: HealthStory[] = [];

    // Sleep Quality Journey Story
    const sleepData = detailedData.filter(d => d.type === 'sleep').slice(0, 7);
    if (sleepData.length >= 3) {
      const sleepQualityTrend = sleepData.map(d => ({
        date: new Date(d.timestamp).toLocaleDateString(),
        quality: (d.data as any).sleepQuality,
        duration: (d.data as any).totalSleep
      }));

      const avgQuality = sleepQualityTrend.reduce((sum, d) => sum + d.quality, 0) / sleepQualityTrend.length;
      const trend = sleepQualityTrend[0].quality > sleepQualityTrend[sleepQualityTrend.length - 1].quality ? 'improving' : 'declining';

      stories.push({
        id: 'sleep-journey',
        title: 'Your Sleep Quality Journey',
        narrative: `Over the past week, your sleep tells a compelling story. ${trend === 'improving' ? 'You\'ve been making positive changes that are paying off!' : 'There are opportunities to enhance your rest quality.'} Your average sleep quality score of ${avgQuality.toFixed(1)}/5 ${trend === 'improving' ? 'shows steady improvement' : 'suggests room for optimization'}.`,
        dataPoints: sleepQualityTrend,
        visualType: trend === 'improving' ? 'achievement' : 'warning',
        category: 'sleep',
        timeframe: 'Past 7 days',
        keyInsight: `Sleep quality ${trend === 'improving' ? 'improved by' : 'declined by'} ${Math.abs(sleepQualityTrend[0].quality - sleepQualityTrend[sleepQualityTrend.length - 1].quality).toFixed(1)} points`,
        actionable: trend === 'improving' ? 'Continue your current sleep routine and consider tracking what\'s working well.' : 'Focus on consistent bedtime routines and sleep environment optimization.',
        confidence: 0.85
      });
    }

    // Exercise Consistency Story
    const exerciseData = detailedData.filter(d => d.type === 'exercise').slice(0, 14);
    if (exerciseData.length >= 5) {
      const exercisePattern = exerciseData.map(d => ({
        date: new Date(d.timestamp).toLocaleDateString(),
        duration: (d.data as any).activities.reduce((sum: number, act: any) => sum + act.duration, 0),
        steps: (d.data as any).steps || 0
      }));

      const totalMinutes = exercisePattern.reduce((sum, d) => sum + d.duration, 0);
      const avgSteps = exercisePattern.reduce((sum, d) => sum + d.steps, 0) / exercisePattern.length;

      stories.push({
        id: 'exercise-consistency',
        title: 'Your Fitness Momentum',
        narrative: `Your exercise data reveals ${totalMinutes > 150 ? 'excellent' : totalMinutes > 75 ? 'good' : 'developing'} fitness momentum. With ${totalMinutes} total minutes of activity and an average of ${Math.round(avgSteps)} daily steps, you're ${totalMinutes > 150 ? 'exceeding' : totalMinutes > 75 ? 'approaching' : 'building toward'} recommended activity levels.`,
        dataPoints: exercisePattern,
        visualType: totalMinutes > 150 ? 'achievement' : totalMinutes > 75 ? 'trend' : 'warning',
        category: 'exercise',
        timeframe: 'Past 2 weeks',
        keyInsight: `${totalMinutes} minutes of exercise logged`,
        actionable: totalMinutes > 150 ? 'Maintain this excellent routine and consider adding variety.' : 'Gradually increase activity duration and frequency.',
        confidence: 0.9
      });
    }

    // Nutrition Balance Story
    const nutritionData = detailedData.filter(d => d.type === 'nutrition').slice(0, 7);
    if (nutritionData.length >= 3) {
      const nutritionPattern = nutritionData.map(d => ({
        date: new Date(d.timestamp).toLocaleDateString(),
        meals: (d.data as any).meals.length,
        water: (d.data as any).waterIntake,
        supplements: (d.data as any).supplements.length
      }));

      const avgWater = nutritionPattern.reduce((sum, d) => sum + d.water, 0) / nutritionPattern.length;
      const avgMeals = nutritionPattern.reduce((sum, d) => sum + d.meals, 0) / nutritionPattern.length;

      stories.push({
        id: 'nutrition-balance',
        title: 'Your Nutrition Story',
        narrative: `Your eating patterns show ${avgMeals >= 3 ? 'consistent' : 'irregular'} meal timing with an average of ${avgMeals.toFixed(1)} meals per day. Your hydration averages ${(avgWater/1000).toFixed(1)}L daily, which is ${avgWater >= 2000 ? 'excellent' : avgWater >= 1500 ? 'adequate' : 'below optimal'} for your health goals.`,
        dataPoints: nutritionPattern,
        visualType: avgWater >= 2000 && avgMeals >= 3 ? 'achievement' : 'trend',
        category: 'nutrition',
        timeframe: 'Past week',
        keyInsight: `${(avgWater/1000).toFixed(1)}L average daily hydration`,
        actionable: avgWater < 2000 ? 'Focus on increasing water intake throughout the day.' : 'Maintain current hydration and consider meal timing optimization.',
        confidence: 0.8
      });
    }

    // Health Metrics Trend Story
    const weightMetrics = metrics.filter(m => m.metricType === 'weight').slice(0, 10);
    const bpMetrics = metrics.filter(m => m.metricType === 'blood_pressure').slice(0, 10);
    
    if (weightMetrics.length >= 3 || bpMetrics.length >= 3) {
      const hasWeightTrend = weightMetrics.length >= 3;
      const hasBPTrend = bpMetrics.length >= 3;
      
      let trendData = [];
      let narrative = '';
      let insight = '';
      
      if (hasWeightTrend) {
        const weightChange = weightMetrics[0].value - weightMetrics[weightMetrics.length - 1].value;
        trendData = weightMetrics.map(m => ({
          date: new Date(m.timestamp).toLocaleDateString(),
          value: m.value,
          type: 'weight'
        }));
        
        narrative = `Your weight trend shows ${Math.abs(weightChange) > 1 ? 'significant' : 'stable'} changes over time. ${weightChange > 0 ? 'You\'ve gained' : weightChange < 0 ? 'You\'ve lost' : 'You\'ve maintained'} ${Math.abs(weightChange).toFixed(1)}kg, indicating ${Math.abs(weightChange) > 2 ? 'notable progress' : 'steady management'} in your health journey.`;
        insight = `${Math.abs(weightChange).toFixed(1)}kg ${weightChange > 0 ? 'gained' : weightChange < 0 ? 'lost' : 'maintained'}`;
      }

      stories.push({
        id: 'health-metrics-trend',
        title: 'Your Health Metrics Journey',
        narrative,
        dataPoints: trendData,
        visualType: 'trend',
        category: 'vitals',
        timeframe: 'Recent measurements',
        keyInsight: insight,
        actionable: 'Continue monitoring key metrics and discuss trends with your healthcare provider.',
        confidence: 0.75
      });
    }

    return stories.filter(story => story.confidence > 0.7);
  };

  const playStoryNarration = (story: HealthStory) => {
    const fullNarration = `${story.title}. ${story.narrative} Key insight: ${story.keyInsight}. Recommendation: ${story.actionable}`;
    speak(fullNarration);
  };

  const getStoryIcon = (category: string) => {
    switch (category) {
      case 'sleep': return <Moon className="w-6 h-6" />;
      case 'exercise': return <Activity className="w-6 h-6" />;
      case 'nutrition': return <Utensils className="w-6 h-6" />;
      case 'vitals': return <Heart className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

  const getStoryColor = (visualType: string) => {
    switch (visualType) {
      case 'achievement': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'trend': return 'from-blue-500 to-cyan-500';
      case 'comparison': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const renderMiniVisualization = (story: HealthStory) => {
    if (!story.dataPoints || story.dataPoints.length === 0) return null;

    const maxValue = Math.max(...story.dataPoints.map(d => d.value || d.quality || d.duration || 0));
    const minValue = Math.min(...story.dataPoints.map(d => d.value || d.quality || d.duration || 0));

    return (
      <div className="mt-4 h-16 flex items-end space-x-1">
        {story.dataPoints.slice(0, 7).map((point, index) => {
          const value = point.value || point.quality || point.duration || 0;
          const height = ((value - minValue) / (maxValue - minValue)) * 100;
          
          return (
            <div
              key={index}
              className={`flex-1 bg-gradient-to-t ${getStoryColor(story.visualType)} rounded-t opacity-70`}
              style={{ height: `${Math.max(height, 10)}%` }}
              title={`${point.date}: ${value}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-3">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Health Story</h2>
            <p className="text-gray-600">Data-driven insights that tell your wellness journey</p>
          </div>
        </div>
        <button
          onClick={generateHealthStories}
          disabled={isGenerating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Refresh Stories'}
        </button>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story List */}
        <div className="lg:col-span-1 space-y-4">
          {stories.map((story, index) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedStory?.id === story.id
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`bg-gradient-to-r ${getStoryColor(story.visualType)} rounded-lg p-2`}>
                    {getStoryIcon(story.category)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{story.title}</h3>
                    <p className="text-xs text-gray-600">{story.timeframe}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playStoryNarration(story);
                  }}
                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{story.narrative}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-600 font-medium">{story.keyInsight}</span>
                <span className="text-gray-500">{Math.round(story.confidence * 100)}% confidence</span>
              </div>
              
              {renderMiniVisualization(story)}
            </div>
          ))}
        </div>

        {/* Selected Story Detail */}
        <div className="lg:col-span-2">
          {selectedStory ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`bg-gradient-to-r ${getStoryColor(selectedStory.visualType)} rounded-lg p-3`}>
                    {getStoryIcon(selectedStory.category)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{selectedStory.title}</h3>
                    <p className="text-gray-600">{selectedStory.timeframe}</p>
                  </div>
                </div>
                <button
                  onClick={() => playStoryNarration(selectedStory)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Narrate Story
                </button>
              </div>

              {/* Story Narrative */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">The Story</h4>
                <p className="text-gray-700 leading-relaxed">{selectedStory.narrative}</p>
              </div>

              {/* Data Visualization */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Visual Evidence</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedStory.dataPoints && selectedStory.dataPoints.length > 0 ? (
                    <div className="h-48 flex items-end space-x-2">
                      {selectedStory.dataPoints.map((point, index) => {
                        const value = point.value || point.quality || point.duration || point.water || 0;
                        const maxValue = Math.max(...selectedStory.dataPoints.map(d => d.value || d.quality || d.duration || d.water || 0));
                        const height = (value / maxValue) * 100;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-full bg-gradient-to-t ${getStoryColor(selectedStory.visualType)} rounded-t transition-all hover:opacity-80`}
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${point.date}: ${value}`}
                            />
                            <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                              {point.date?.split('/').slice(0, 2).join('/')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Visualization will appear as more data is collected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <h5 className="font-semibold text-blue-900">Key Insight</h5>
                  </div>
                  <p className="text-blue-800">{selectedStory.keyInsight}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    <h5 className="font-semibold text-green-900">Action Plan</h5>
                  </div>
                  <p className="text-green-800">{selectedStory.actionable}</p>
                </div>
              </div>

              {/* Confidence & Category */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Category: <span className="font-medium capitalize">{selectedStory.category}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Confidence: <span className="font-medium">{Math.round(selectedStory.confidence * 100)}%</span>
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {selectedStory.timeframe}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Health Story</h3>
              <p className="text-gray-600">Choose a story from the left to see detailed insights and visualizations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
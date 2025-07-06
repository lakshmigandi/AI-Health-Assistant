import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Volume2,
  Eye,
  Star,
  Calendar,
  Target,
  Activity,
  Heart,
  Moon,
  Utensils,
  Shield,
  Zap,
  Award,
  ArrowRight
} from 'lucide-react';
import { HealthInsight } from '../types/user';
import { userService } from '../services/userService';
import { useEnhancedTextToSpeech } from '../hooks/useEnhancedTextToSpeech';

interface HealthInsightCardsProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
}

interface InsightCard extends HealthInsight {
  visualElements: {
    primaryColor: string;
    secondaryColor: string;
    icon: React.ReactNode;
    pattern: 'gradient' | 'dots' | 'waves' | 'geometric';
  };
  storyElements: {
    hook: string;
    context: string;
    climax: string;
    resolution: string;
  };
}

export const HealthInsightCards: React.FC<HealthInsightCardsProps> = ({ 
  className = '', 
  limit,
  showFilters = true 
}) => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<InsightCard[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<InsightCard | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    category: 'all'
  });
  const [isNarrating, setIsNarrating] = useState(false);

  const { speak, stop, isSpeaking } = useEnhancedTextToSpeech();

  useEffect(() => {
    loadAndEnhanceInsights();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [insights, filters]);

  const loadAndEnhanceInsights = () => {
    const rawInsights = userService.getHealthInsights();
    const enhancedInsights = rawInsights.map(insight => enhanceInsightWithStoryElements(insight));
    
    setInsights(enhancedInsights);
  };

  const enhanceInsightWithStoryElements = (insight: HealthInsight): InsightCard => {
    const visualElements = getVisualElements(insight);
    const storyElements = createStoryNarrative(insight);

    return {
      ...insight,
      visualElements,
      storyElements
    };
  };

  const getVisualElements = (insight: HealthInsight) => {
    const colorSchemes = {
      recommendation: { primary: 'from-blue-500 to-cyan-500', secondary: 'bg-blue-50', icon: <TrendingUp className="w-6 h-6" /> },
      warning: { primary: 'from-yellow-500 to-orange-500', secondary: 'bg-yellow-50', icon: <AlertTriangle className="w-6 h-6" /> },
      achievement: { primary: 'from-green-500 to-emerald-500', secondary: 'bg-green-50', icon: <Award className="w-6 h-6" /> },
      educational: { primary: 'from-purple-500 to-pink-500', secondary: 'bg-purple-50', icon: <BookOpen className="w-6 h-6" /> },
      trend: { primary: 'from-indigo-500 to-blue-500', secondary: 'bg-indigo-50', icon: <TrendingUp className="w-6 h-6" /> }
    };

    const categoryIcons = {
      nutrition: <Utensils className="w-5 h-5" />,
      exercise: <Activity className="w-5 h-5" />,
      sleep: <Moon className="w-5 h-5" />,
      'mental-health': <Brain className="w-5 h-5" />,
      'preventive-care': <Shield className="w-5 h-5" />,
      vitals: <Heart className="w-5 h-5" />
    };

    const scheme = colorSchemes[insight.type] || colorSchemes.recommendation;
    const patterns = ['gradient', 'dots', 'waves', 'geometric'] as const;

    return {
      primaryColor: scheme.primary,
      secondaryColor: scheme.secondary,
      icon: categoryIcons[insight.category] || scheme.icon,
      pattern: patterns[Math.floor(Math.random() * patterns.length)]
    };
  };

  const createStoryNarrative = (insight: HealthInsight) => {
    // Create a compelling narrative structure
    const hooks = {
      recommendation: "Here's an opportunity to enhance your health journey:",
      warning: "Your health data reveals something important:",
      achievement: "Congratulations! Your efforts are paying off:",
      educational: "Let's explore an important aspect of your health:",
      trend: "Your health patterns show an interesting development:"
    };

    const contexts = {
      nutrition: "Based on your eating patterns and nutritional data,",
      exercise: "Looking at your activity levels and fitness metrics,",
      sleep: "Your sleep patterns and quality indicators suggest",
      'mental-health': "Your wellness and stress indicators show",
      'preventive-care': "For optimal long-term health,",
      vitals: "Your vital signs and health measurements indicate"
    };

    return {
      hook: hooks[insight.type] || hooks.recommendation,
      context: contexts[insight.category] || "Based on your health data,",
      climax: insight.content,
      resolution: insight.actionItems.length > 0 ? 
        `Here's what you can do: ${insight.actionItems[0]}` : 
        "Continue monitoring this aspect of your health."
    };
  };

  const applyFilters = () => {
    let filtered = [...insights];

    if (filters.type !== 'all') {
      filtered = filtered.filter(insight => insight.type === filters.type);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filters.priority);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(insight => insight.category === filters.category);
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredInsights(filtered);
  };

  const narrateInsight = (insight: InsightCard) => {
    const fullStory = `${insight.storyElements.hook} ${insight.storyElements.context} ${insight.storyElements.climax} ${insight.storyElements.resolution}`;
    speak(fullStory);
  };

  const narrateAllInsights = async () => {
    setIsNarrating(true);
    
    for (const insight of filteredInsights.slice(0, 3)) { // Limit to first 3 for demo
      if (!isSpeaking) break;
      
      await new Promise(resolve => {
        speak(`Insight ${filteredInsights.indexOf(insight) + 1}: ${insight.title}. ${insight.storyElements.climax}`);
        setTimeout(resolve, 4000); // Wait 4 seconds between insights
      });
    }
    
    setIsNarrating(false);
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      critical: { color: 'bg-red-100 text-red-800', icon: <Zap className="w-3 h-3" /> },
      high: { color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="w-3 h-3" /> },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: <Target className="w-3 h-3" /> },
      low: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" /> }
    };

    const badge = badges[priority] || badges.medium;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        <span className="ml-1 capitalize">{priority}</span>
      </span>
    );
  };

  const renderPatternOverlay = (pattern: string) => {
    switch (pattern) {
      case 'dots':
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>
        );
      case 'waves':
        return (
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q25,0 50,10 T100,10 V20 H0 Z" fill="currentColor" />
            </svg>
          </div>
        );
      case 'geometric':
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(-45deg, currentColor 25%, transparent 25%)',
              backgroundSize: '20px 20px'
            }} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">Health Insights</h2>
            <p className="text-gray-600">AI-powered stories from your health data</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={narrateAllInsights}
            disabled={isNarrating || filteredInsights.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {isNarrating ? 'Narrating...' : 'Narrate All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="recommendation">Recommendations</option>
              <option value="warning">Warnings</option>
              <option value="achievement">Achievements</option>
              <option value="educational">Educational</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="nutrition">Nutrition</option>
              <option value="exercise">Exercise</option>
              <option value="sleep">Sleep</option>
              <option value="mental-health">Mental Health</option>
              <option value="preventive-care">Preventive Care</option>
            </select>
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => setSelectedInsight(insight)}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg"
          >
            {/* Header with Pattern */}
            <div className={`relative bg-gradient-to-r ${insight.visualElements.primaryColor} p-6 text-white`}>
              {renderPatternOverlay(insight.visualElements.pattern)}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-lg p-2">
                    {insight.visualElements.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    {insight.isFavorited && <Star className="w-4 h-4 fill-current" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        narrateInsight(insight);
                      }}
                      className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
                <p className="text-white/90 text-sm">{insight.storyElements.hook}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {insight.storyElements.context} {insight.content.substring(0, 120)}...
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-4">
                {getPriorityBadge(insight.priority)}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(insight.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Action Items Preview */}
              {insight.actionItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Quick Action:</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{insight.actionItems[0]}</p>
                </div>
              )}

              {/* Confidence & Read Status */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <Brain className="w-3 h-3 mr-1" />
                  {Math.round(insight.confidence * 100)}% confidence
                </div>
                <div className="flex items-center space-x-2">
                  {!insight.isRead && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`bg-gradient-to-r ${selectedInsight.visualElements.primaryColor} p-6 text-white relative`}>
              {renderPatternOverlay(selectedInsight.visualElements.pattern)}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    {selectedInsight.visualElements.icon}
                  </div>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedInsight.title}</h2>
                <div className="flex items-center space-x-4">
                  {getPriorityBadge(selectedInsight.priority)}
                  <span className="text-white/80 text-sm capitalize">{selectedInsight.category.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Full Story */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">The Complete Story</h3>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Context:</strong> {selectedInsight.storyElements.context}</p>
                  <p><strong>Insight:</strong> {selectedInsight.content}</p>
                  <p><strong>Resolution:</strong> {selectedInsight.storyElements.resolution}</p>
                </div>
              </div>

              {/* Action Items */}
              {selectedInsight.actionItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Recommended Actions</h3>
                  <ul className="space-y-2">
                    {selectedInsight.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => narrateInsight(selectedInsight)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Narrate Story
                </button>
                
                <div className="text-sm text-gray-500">
                  Confidence: {Math.round(selectedInsight.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-600">Try adjusting your filters or add more health data to generate insights.</p>
        </div>
      )}
    </div>
  );
};
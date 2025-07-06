import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Calendar, 
  Filter, 
  Star, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Volume2,
  Heart,
  Activity,
  Moon,
  Utensils,
  Shield
} from 'lucide-react';
import { HealthInsight } from '../types/user';
import { userService } from '../services/userService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface InsightsHistoryProps {
  className?: string;
}

export const InsightsHistory: React.FC<InsightsHistoryProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<HealthInsight[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    priority: 'all',
    isRead: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { speak } = useTextToSpeech();

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [insights, filters, searchTerm]);

  const loadInsights = () => {
    const allInsights = userService.getHealthInsights();
    setInsights(allInsights);
  };

  const applyFilters = () => {
    let filtered = [...insights];

    // Apply filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(insight => insight.type === filters.type);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(insight => insight.category === filters.category);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filters.priority);
    }
    if (filters.isRead !== 'all') {
      filtered = filtered.filter(insight => insight.isRead === (filters.isRead === 'read'));
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(insight => 
        new Date(insight.createdAt) >= startDate
      );
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(insight =>
        insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInsights(filtered);
  };

  const toggleInsightRead = (insightId: string) => {
    userService.markInsightAsRead(insightId);
    loadInsights();
  };

  const toggleInsightFavorite = (insightId: string) => {
    userService.toggleInsightFavorite(insightId);
    loadInsights();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'achievement': return <CheckCircle className="w-5 h-5" />;
      case 'educational': return <BookOpen className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return <Utensils className="w-4 h-4" />;
      case 'exercise': return <Activity className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'mental-health': return <Brain className="w-4 h-4" />;
      case 'preventive-care': return <Shield className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recommendation': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'achievement': return 'text-green-600 bg-green-50 border-green-200';
      case 'educational': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const readInsightAloud = (insight: HealthInsight) => {
    const text = `${insight.title}. ${insight.content}. Priority: ${insight.priority}. Category: ${insight.category}.`;
    speak(text);
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
            <h2 className="text-2xl font-bold text-gray-900">Health Insights History</h2>
            <p className="text-gray-600">Your personalized AI recommendations over time</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredInsights.length} of {insights.length} insights
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="recommendation">Recommendations</option>
            <option value="warning">Warnings</option>
            <option value="achievement">Achievements</option>
            <option value="educational">Educational</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="nutrition">Nutrition</option>
            <option value="exercise">Exercise</option>
            <option value="sleep">Sleep</option>
            <option value="mental-health">Mental Health</option>
            <option value="preventive-care">Preventive Care</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past 3 Months</option>
          </select>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
            <p className="text-gray-600">
              {insights.length === 0 
                ? "You don't have any health insights yet. Keep using the app to get personalized recommendations!"
                : "Try adjusting your filters to see more insights."
              }
            </p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                insight.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg border-2 ${getTypeColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                      {!insight.isRead && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        {getCategoryIcon(insight.category)}
                        <span className="ml-1 capitalize">{insight.category.replace('-', ' ')}</span>
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                        <span className="capitalize">{insight.priority}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => readInsightAloud(insight)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Read aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleInsightFavorite(insight.id)}
                    className={`p-2 transition-colors ${
                      insight.isFavorited 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    title={insight.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${insight.isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleInsightRead(insight.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title={insight.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {insight.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{insight.content}</p>

              {insight.actionItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
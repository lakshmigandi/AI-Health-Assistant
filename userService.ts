import { UserProfile, HealthInsight, HealthMetricHistory, UserSession, DetailedHealthData, HealthTrend } from '../types/user';
import { aiRecommendationEngine } from './aiRecommendationEngine';

class UserService {
  private readonly STORAGE_KEYS = {
    USER_PROFILE: 'healthassist_user_profile',
    HEALTH_INSIGHTS: 'healthassist_health_insights',
    METRIC_HISTORY: 'healthassist_metric_history',
    DETAILED_DATA: 'healthassist_detailed_data',
    USER_SESSIONS: 'healthassist_user_sessions',
    CURRENT_SESSION: 'healthassist_current_session',
    HEALTH_TRENDS: 'healthassist_health_trends'
  };

  // User Profile Management
  saveUserProfile(profile: UserProfile): void {
    try {
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  getUserProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const currentProfile = this.getUserProfile();
    if (!currentProfile) return null;

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  // Health Insights Management
  saveHealthInsight(insight: HealthInsight): void {
    try {
      const insights = this.getHealthInsights();
      insights.push(insight);
      localStorage.setItem(this.STORAGE_KEYS.HEALTH_INSIGHTS, JSON.stringify(insights));
    } catch (error) {
      console.error('Failed to save health insight:', error);
    }
  }

  getHealthInsights(filters?: {
    type?: string;
    category?: string;
    priority?: string;
    isRead?: boolean;
    dateRange?: { start: string; end: string };
  }): HealthInsight[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.HEALTH_INSIGHTS);
      let insights: HealthInsight[] = stored ? JSON.parse(stored) : [];

      if (filters) {
        insights = insights.filter(insight => {
          if (filters.type && insight.type !== filters.type) return false;
          if (filters.category && insight.category !== filters.category) return false;
          if (filters.priority && insight.priority !== filters.priority) return false;
          if (filters.isRead !== undefined && insight.isRead !== filters.isRead) return false;
          if (filters.dateRange) {
            const insightDate = new Date(insight.createdAt);
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            if (insightDate < startDate || insightDate > endDate) return false;
          }
          return true;
        });
      }

      // Sort by creation date (newest first)
      return insights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load health insights:', error);
      return [];
    }
  }

  markInsightAsRead(insightId: string): void {
    try {
      const insights = this.getHealthInsights();
      const insight = insights.find(i => i.id === insightId);
      if (insight) {
        insight.isRead = true;
        localStorage.setItem(this.STORAGE_KEYS.HEALTH_INSIGHTS, JSON.stringify(insights));
      }
    } catch (error) {
      console.error('Failed to mark insight as read:', error);
    }
  }

  toggleInsightFavorite(insightId: string): void {
    try {
      const insights = this.getHealthInsights();
      const insight = insights.find(i => i.id === insightId);
      if (insight) {
        insight.isFavorited = !insight.isFavorited;
        localStorage.setItem(this.STORAGE_KEYS.HEALTH_INSIGHTS, JSON.stringify(insights));
      }
    } catch (error) {
      console.error('Failed to toggle insight favorite:', error);
    }
  }

  // Health Metrics History
  saveHealthMetric(metric: HealthMetricHistory): void {
    try {
      const history = this.getHealthMetricHistory();
      history.push(metric);
      localStorage.setItem(this.STORAGE_KEYS.METRIC_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save health metric:', error);
    }
  }

  getHealthMetricHistory(metricType?: string, limit?: number): HealthMetricHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.METRIC_HISTORY);
      let history: HealthMetricHistory[] = stored ? JSON.parse(stored) : [];

      if (metricType) {
        history = history.filter(metric => metric.metricType === metricType);
      }

      // Sort by timestamp (newest first)
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (limit) {
        history = history.slice(0, limit);
      }

      return history;
    } catch (error) {
      console.error('Failed to load health metric history:', error);
      return [];
    }
  }

  // Detailed Health Data Management
  saveDetailedHealthData(data: DetailedHealthData): void {
    try {
      const detailedData = this.getDetailedHealthData();
      detailedData.push(data);
      localStorage.setItem(this.STORAGE_KEYS.DETAILED_DATA, JSON.stringify(detailedData));
    } catch (error) {
      console.error('Failed to save detailed health data:', error);
    }
  }

  getDetailedHealthData(type?: string, limit?: number): DetailedHealthData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.DETAILED_DATA);
      let data: DetailedHealthData[] = stored ? JSON.parse(stored) : [];

      if (type) {
        data = data.filter(d => d.type === type);
      }

      // Sort by timestamp (newest first)
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (limit) {
        data = data.slice(0, limit);
      }

      return data;
    } catch (error) {
      console.error('Failed to load detailed health data:', error);
      return [];
    }
  }

  // Health Trends Management
  saveHealthTrend(trend: HealthTrend): void {
    try {
      const trends = this.getHealthTrends();
      trends.push(trend);
      localStorage.setItem(this.STORAGE_KEYS.HEALTH_TRENDS, JSON.stringify(trends));
    } catch (error) {
      console.error('Failed to save health trend:', error);
    }
  }

  getHealthTrends(metricType?: string): HealthTrend[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.HEALTH_TRENDS);
      let trends: HealthTrend[] = stored ? JSON.parse(stored) : [];

      if (metricType) {
        trends = trends.filter(t => t.metricType === metricType);
      }

      return trends.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load health trends:', error);
      return [];
    }
  }

  // Session Management
  startSession(userId: string): UserSession {
    const session: UserSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: new Date().toISOString(),
      actionsPerformed: [],
      voiceCommandsUsed: 0,
      insightsViewed: [],
      dataEntriesAdded: 0,
      featuresUsed: []
    };

    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    return session;
  }

  updateCurrentSession(updates: Partial<UserSession>): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      if (stored) {
        const session = JSON.parse(stored);
        const updatedSession = { ...session, ...updates };
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('Failed to update current session:', error);
    }
  }

  endSession(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      if (stored) {
        const session = JSON.parse(stored);
        session.endTime = new Date().toISOString();

        // Save to sessions history
        const sessions = this.getUserSessions();
        sessions.push(session);
        localStorage.setItem(this.STORAGE_KEYS.USER_SESSIONS, JSON.stringify(sessions));

        // Clear current session
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  getCurrentSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  getUserSessions(): UserSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load user sessions:', error);
      return [];
    }
  }

  // Enhanced Analytics and Insights Generation
  generatePersonalizedInsights(profile: UserProfile, recentMetrics: HealthMetricHistory[]): HealthInsight[] {
    const detailedData = this.getDetailedHealthData(undefined, 30);
    const trends = this.getHealthTrends();
    
    const insights = aiRecommendationEngine.generatePersonalizedInsights(
      profile, 
      recentMetrics, 
      detailedData, 
      trends
    );
    
    return insights;
  }

  // Simulate different health scenarios for testing
  simulateHealthScenario(scenario: 'healthy' | 'at-risk' | 'chronic-condition'): void {
    const profile = this.getUserProfile();
    if (!profile) return;

    const now = new Date().toISOString();
    const baseDate = new Date();

    switch (scenario) {
      case 'healthy':
        this.simulateHealthyScenario(profile, baseDate, now);
        break;
      case 'at-risk':
        this.simulateAtRiskScenario(profile, baseDate, now);
        break;
      case 'chronic-condition':
        this.simulateChronicConditionScenario(profile, baseDate, now);
        break;
    }
  }

  private simulateHealthyScenario(profile: UserProfile, baseDate: Date, now: string): void {
    // Simulate good health metrics
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Sleep data
      this.saveDetailedHealthData({
        id: `sim_sleep_${i}`,
        userId: profile.id,
        type: 'sleep',
        timestamp: date.toISOString(),
        data: {
          bedtime: '22:30',
          wakeTime: '07:00',
          totalSleep: 8.5,
          sleepQuality: 4,
          sleepDisturbances: []
        },
        source: 'manual'
      });

      // Exercise data
      this.saveDetailedHealthData({
        id: `sim_exercise_${i}`,
        userId: profile.id,
        type: 'exercise',
        timestamp: date.toISOString(),
        data: {
          activities: [{
            type: 'Running',
            duration: 30,
            intensity: 'moderate',
            caloriesBurned: 300
          }],
          steps: 10000,
          activeMinutes: 45
        },
        source: 'manual'
      });

      // Nutrition data
      this.saveDetailedHealthData({
        id: `sim_nutrition_${i}`,
        userId: profile.id,
        type: 'nutrition',
        timestamp: date.toISOString(),
        data: {
          meals: [
            { type: 'breakfast', foods: [{ name: 'Oatmeal with berries', quantity: 1, unit: 'bowl' }], time: '08:00' },
            { type: 'lunch', foods: [{ name: 'Grilled chicken salad', quantity: 1, unit: 'plate' }], time: '12:30' },
            { type: 'dinner', foods: [{ name: 'Salmon with vegetables', quantity: 1, unit: 'plate' }], time: '19:00' }
          ],
          waterIntake: 2500,
          supplements: ['Vitamin D', 'Omega-3']
        },
        source: 'manual'
      });
    }
  }

  private simulateAtRiskScenario(profile: UserProfile, baseDate: Date, now: string): void {
    // Simulate concerning health patterns
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Poor sleep
      this.saveDetailedHealthData({
        id: `sim_sleep_risk_${i}`,
        userId: profile.id,
        type: 'sleep',
        timestamp: date.toISOString(),
        data: {
          bedtime: '01:00',
          wakeTime: '06:30',
          totalSleep: 5.5,
          sleepQuality: 2,
          sleepDisturbances: ['stress', 'screen time']
        },
        source: 'manual'
      });

      // Minimal exercise
      this.saveDetailedHealthData({
        id: `sim_exercise_risk_${i}`,
        userId: profile.id,
        type: 'exercise',
        timestamp: date.toISOString(),
        data: {
          activities: [],
          steps: 3000,
          activeMinutes: 10
        },
        source: 'manual'
      });

      // High stress symptoms
      this.saveDetailedHealthData({
        id: `sim_symptoms_risk_${i}`,
        userId: profile.id,
        type: 'symptoms',
        timestamp: date.toISOString(),
        data: {
          symptoms: [
            { name: 'Headache', severity: 3, duration: '2 hours' },
            { name: 'Fatigue', severity: 4, duration: 'All day' }
          ],
          mood: 2,
          energyLevel: 2,
          stressLevel: 4
        },
        source: 'manual'
      });
    }

    // Add elevated blood pressure readings
    for (let i = 0; i < 5; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      this.saveHealthMetric({
        id: `sim_bp_${i}`,
        userId: profile.id,
        metricType: 'blood_pressure',
        value: 145 + Math.random() * 10,
        unit: 'mmHg',
        timestamp: date.toISOString(),
        source: 'manual'
      });
    }
  }

  private simulateChronicConditionScenario(profile: UserProfile, baseDate: Date, now: string): void {
    // Simulate diabetes management scenario
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Blood sugar readings
      this.saveDetailedHealthData({
        id: `sim_vitals_chronic_${i}`,
        userId: profile.id,
        type: 'vitals',
        timestamp: date.toISOString(),
        data: {
          bloodSugar: 180 + Math.random() * 40,
          bloodPressure: { systolic: 135, diastolic: 85 }
        },
        source: 'manual'
      });

      // Medication tracking
      this.saveDetailedHealthData({
        id: `sim_medication_chronic_${i}`,
        userId: profile.id,
        type: 'medication',
        timestamp: date.toISOString(),
        data: {
          medications: [
            { name: 'Metformin', dosage: '500mg', timeTaken: '08:00', adherence: Math.random() > 0.2 },
            { name: 'Lisinopril', dosage: '10mg', timeTaken: '08:00', adherence: Math.random() > 0.1 }
          ]
        },
        source: 'manual'
      });
    }
  }

  // Data Export/Import with enhanced data
  exportUserData(): string {
    const data = {
      profile: this.getUserProfile(),
      insights: this.getHealthInsights(),
      metricHistory: this.getHealthMetricHistory(),
      detailedData: this.getDetailedHealthData(),
      trends: this.getHealthTrends(),
      sessions: this.getUserSessions(),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    return JSON.stringify(data, null, 2);
  }

  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) {
        this.saveUserProfile(data.profile);
      }
      
      if (data.insights) {
        localStorage.setItem(this.STORAGE_KEYS.HEALTH_INSIGHTS, JSON.stringify(data.insights));
      }
      
      if (data.metricHistory) {
        localStorage.setItem(this.STORAGE_KEYS.METRIC_HISTORY, JSON.stringify(data.metricHistory));
      }

      if (data.detailedData) {
        localStorage.setItem(this.STORAGE_KEYS.DETAILED_DATA, JSON.stringify(data.detailedData));
      }

      if (data.trends) {
        localStorage.setItem(this.STORAGE_KEYS.HEALTH_TRENDS, JSON.stringify(data.trends));
      }
      
      if (data.sessions) {
        localStorage.setItem(this.STORAGE_KEYS.USER_SESSIONS, JSON.stringify(data.sessions));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const userService = new UserService();
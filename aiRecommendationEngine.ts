import { UserProfile, HealthMetricHistory, DetailedHealthData, HealthInsight, HealthTrend } from '../types/user';

export class AIRecommendationEngine {
  private static instance: AIRecommendationEngine;

  public static getInstance(): AIRecommendationEngine {
    if (!AIRecommendationEngine.instance) {
      AIRecommendationEngine.instance = new AIRecommendationEngine();
    }
    return AIRecommendationEngine.instance;
  }

  generatePersonalizedInsights(
    profile: UserProfile, 
    recentMetrics: HealthMetricHistory[], 
    detailedData: DetailedHealthData[],
    trends: HealthTrend[]
  ): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const now = new Date().toISOString();

    // Analyze BMI and weight trends
    insights.push(...this.analyzeBMIAndWeight(profile, recentMetrics, now));

    // Analyze sleep patterns
    insights.push(...this.analyzeSleepPatterns(profile, detailedData, now));

    // Analyze nutrition patterns
    insights.push(...this.analyzeNutritionPatterns(profile, detailedData, now));

    // Analyze exercise patterns
    insights.push(...this.analyzeExercisePatterns(profile, detailedData, now));

    // Analyze vital signs trends
    insights.push(...this.analyzeVitalSigns(recentMetrics, trends, now));

    // Age and gender-specific recommendations
    insights.push(...this.generatePreventiveCareRecommendations(profile, now));

    // Medication and condition-specific insights
    insights.push(...this.analyzeMedicationAdherence(profile, detailedData, now));

    // Stress and mental health analysis
    insights.push(...this.analyzeStressAndMentalHealth(profile, detailedData, now));

    return insights.filter(insight => insight.confidence > 0.6);
  }

  private analyzeBMIAndWeight(profile: UserProfile, metrics: HealthMetricHistory[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const bmi = profile.weight / Math.pow(profile.height / 100, 2);
    const weightMetrics = metrics.filter(m => m.metricType === 'weight').slice(0, 10);

    // BMI-based recommendations
    if (bmi < 18.5) {
      insights.push({
        id: `insight_${Date.now()}_bmi_underweight`,
        userId: profile.id,
        type: 'recommendation',
        title: 'Healthy Weight Gain Strategy Needed',
        content: `Your BMI of ${bmi.toFixed(1)} indicates underweight status. Focus on nutrient-dense, calorie-rich foods and consider strength training to build healthy muscle mass.`,
        category: 'nutrition',
        priority: 'medium',
        confidence: 0.85,
        dataPoints: ['weight', 'height'],
        actionItems: [
          'Increase caloric intake with healthy fats (nuts, avocados, olive oil)',
          'Add protein-rich foods to each meal',
          'Consider working with a registered dietitian',
          'Include resistance training 2-3 times per week'
        ],
        isRead: false,
        isFavorited: false,
        createdAt: timestamp,
        tags: ['weight-gain', 'nutrition', 'exercise'],
        relatedInsights: []
      });
    } else if (bmi >= 25 && bmi < 30) {
      insights.push({
        id: `insight_${Date.now()}_bmi_overweight`,
        userId: profile.id,
        type: 'recommendation',
        title: 'Weight Management Opportunity',
        content: `Your BMI of ${bmi.toFixed(1)} suggests focusing on gradual, sustainable weight loss could benefit your overall health and reduce disease risk.`,
        category: 'nutrition',
        priority: 'medium',
        confidence: 0.8,
        dataPoints: ['weight', 'height'],
        actionItems: [
          'Create a moderate caloric deficit (300-500 calories/day)',
          'Increase physical activity gradually',
          'Focus on whole foods and portion control',
          'Track food intake for better awareness'
        ],
        isRead: false,
        isFavorited: false,
        createdAt: timestamp,
        tags: ['weight-loss', 'nutrition', 'exercise'],
        relatedInsights: []
      });
    } else if (bmi >= 30) {
      insights.push({
        id: `insight_${Date.now()}_bmi_obese`,
        userId: profile.id,
        type: 'warning',
        title: 'Significant Weight Management Needed',
        content: `Your BMI of ${bmi.toFixed(1)} indicates obesity, which increases risk for diabetes, heart disease, and other conditions. Professional guidance is recommended.`,
        category: 'nutrition',
        priority: 'high',
        confidence: 0.9,
        dataPoints: ['weight', 'height'],
        actionItems: [
          'Consult with healthcare provider for weight management plan',
          'Consider working with registered dietitian',
          'Start with low-impact exercises (walking, swimming)',
          'Set realistic, gradual weight loss goals (1-2 lbs/week)'
        ],
        isRead: false,
        isFavorited: false,
        createdAt: timestamp,
        tags: ['weight-loss', 'medical-consultation', 'nutrition'],
        relatedInsights: []
      });
    }

    // Weight trend analysis
    if (weightMetrics.length >= 3) {
      const recentWeights = weightMetrics.slice(0, 3).map(m => m.value);
      const olderWeights = weightMetrics.slice(3, 6).map(m => m.value);
      
      if (recentWeights.length >= 2 && olderWeights.length >= 2) {
        const recentAvg = recentWeights.reduce((a, b) => a + b) / recentWeights.length;
        const olderAvg = olderWeights.reduce((a, b) => a + b) / olderWeights.length;
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (Math.abs(changePercent) > 5) {
          insights.push({
            id: `insight_${Date.now()}_weight_trend`,
            userId: profile.id,
            type: changePercent > 0 ? 'warning' : 'achievement',
            title: `Significant Weight ${changePercent > 0 ? 'Gain' : 'Loss'} Detected`,
            content: `You've ${changePercent > 0 ? 'gained' : 'lost'} approximately ${Math.abs(changePercent).toFixed(1)}% of your body weight recently. ${changePercent > 0 ? 'Monitor this trend closely.' : 'Great progress on your health journey!'}`,
            category: 'nutrition',
            priority: Math.abs(changePercent) > 10 ? 'high' : 'medium',
            confidence: 0.8,
            dataPoints: ['weight'],
            actionItems: changePercent > 0 ? [
              'Review recent dietary changes',
              'Assess stress levels and sleep quality',
              'Consider consulting healthcare provider if trend continues'
            ] : [
              'Continue current healthy habits',
              'Ensure adequate nutrition during weight loss',
              'Monitor for any concerning symptoms'
            ],
            isRead: false,
            isFavorited: false,
            createdAt: timestamp,
            tags: ['weight-trend', 'monitoring'],
            relatedInsights: []
          });
        }
      }
    }

    return insights;
  }

  private analyzeSleepPatterns(profile: UserProfile, detailedData: DetailedHealthData[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const sleepData = detailedData.filter(d => d.type === 'sleep').slice(0, 7);

    if (sleepData.length >= 3) {
      const avgSleep = sleepData.reduce((sum, d) => sum + (d.data as any).totalSleep, 0) / sleepData.length;
      const avgQuality = sleepData.reduce((sum, d) => sum + (d.data as any).sleepQuality, 0) / sleepData.length;

      if (avgSleep < 7) {
        insights.push({
          id: `insight_${Date.now()}_sleep_duration`,
          userId: profile.id,
          type: 'warning',
          title: 'Insufficient Sleep Duration',
          content: `Your average sleep duration of ${avgSleep.toFixed(1)} hours is below the recommended 7-9 hours. This can impact immune function, cognitive performance, and overall health.`,
          category: 'sleep',
          priority: 'high',
          confidence: 0.9,
          dataPoints: ['sleep'],
          actionItems: [
            'Establish consistent bedtime routine',
            'Limit screen time 1 hour before bed',
            'Keep bedroom cool, dark, and quiet',
            'Avoid caffeine after 2 PM'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['sleep-duration', 'sleep-hygiene'],
          relatedInsights: []
        });
      }

      if (avgQuality < 3) {
        insights.push({
          id: `insight_${Date.now()}_sleep_quality`,
          userId: profile.id,
          type: 'recommendation',
          title: 'Poor Sleep Quality Detected',
          content: `Your average sleep quality score of ${avgQuality.toFixed(1)}/5 suggests you're not getting restorative sleep. Focus on sleep hygiene improvements.`,
          category: 'sleep',
          priority: 'medium',
          confidence: 0.8,
          dataPoints: ['sleep'],
          actionItems: [
            'Track sleep disturbances to identify patterns',
            'Consider relaxation techniques before bed',
            'Evaluate mattress and pillow comfort',
            'Discuss with healthcare provider if issues persist'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['sleep-quality', 'sleep-hygiene'],
          relatedInsights: []
        });
      }
    }

    return insights;
  }

  private analyzeNutritionPatterns(profile: UserProfile, detailedData: DetailedHealthData[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const nutritionData = detailedData.filter(d => d.type === 'nutrition').slice(0, 7);

    if (nutritionData.length >= 3) {
      const avgWaterIntake = nutritionData.reduce((sum, d) => sum + (d.data as any).waterIntake, 0) / nutritionData.length;
      const mealPatterns = nutritionData.map(d => (d.data as any).meals.length);
      const avgMealsPerDay = mealPatterns.reduce((a, b) => a + b) / mealPatterns.length;

      // Water intake analysis
      const recommendedWater = profile.weight * 35; // ml per kg body weight
      if (avgWaterIntake < recommendedWater * 0.8) {
        insights.push({
          id: `insight_${Date.now()}_hydration`,
          userId: profile.id,
          type: 'recommendation',
          title: 'Increase Daily Water Intake',
          content: `Your average water intake of ${(avgWaterIntake / 1000).toFixed(1)}L is below the recommended ${(recommendedWater / 1000).toFixed(1)}L for your body weight. Proper hydration supports metabolism and cognitive function.`,
          category: 'nutrition',
          priority: 'medium',
          confidence: 0.8,
          dataPoints: ['nutrition'],
          actionItems: [
            'Carry a water bottle throughout the day',
            'Set hourly hydration reminders',
            'Eat water-rich foods (fruits, vegetables)',
            'Monitor urine color as hydration indicator'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['hydration', 'nutrition'],
          relatedInsights: []
        });
      }

      // Meal frequency analysis
      if (avgMealsPerDay < 3) {
        insights.push({
          id: `insight_${Date.now()}_meal_frequency`,
          userId: profile.id,
          type: 'recommendation',
          title: 'Consider More Regular Meal Patterns',
          content: `You're averaging ${avgMealsPerDay.toFixed(1)} meals per day. Regular meal timing can help stabilize blood sugar and energy levels.`,
          category: 'nutrition',
          priority: 'low',
          confidence: 0.7,
          dataPoints: ['nutrition'],
          actionItems: [
            'Plan 3 balanced meals per day',
            'Include healthy snacks if needed',
            'Maintain consistent meal timing',
            'Focus on balanced macronutrients'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['meal-timing', 'nutrition'],
          relatedInsights: []
        });
      }
    }

    return insights;
  }

  private analyzeExercisePatterns(profile: UserProfile, detailedData: DetailedHealthData[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const exerciseData = detailedData.filter(d => d.type === 'exercise').slice(0, 7);

    if (exerciseData.length >= 3) {
      const totalMinutes = exerciseData.reduce((sum, d) => {
        const activities = (d.data as any).activities || [];
        return sum + activities.reduce((actSum: number, act: any) => actSum + act.duration, 0);
      }, 0);
      
      const avgMinutesPerWeek = (totalMinutes / exerciseData.length) * 7;
      const recommendedMinutes = 150; // WHO recommendation

      if (avgMinutesPerWeek < recommendedMinutes * 0.5) {
        insights.push({
          id: `insight_${Date.now()}_exercise_insufficient`,
          userId: profile.id,
          type: 'warning',
          title: 'Increase Physical Activity',
          content: `You're averaging ${avgMinutesPerWeek.toFixed(0)} minutes of exercise per week, well below the recommended 150 minutes. Regular exercise reduces disease risk and improves mental health.`,
          category: 'exercise',
          priority: 'high',
          confidence: 0.9,
          dataPoints: ['exercise'],
          actionItems: [
            'Start with 10-minute daily walks',
            'Take stairs instead of elevators',
            'Schedule 3 workout sessions per week',
            'Find activities you enjoy to maintain consistency'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['exercise-frequency', 'physical-activity'],
          relatedInsights: []
        });
      } else if (avgMinutesPerWeek >= recommendedMinutes) {
        insights.push({
          id: `insight_${Date.now()}_exercise_excellent`,
          userId: profile.id,
          type: 'achievement',
          title: 'Excellent Exercise Consistency!',
          content: `Great job! You're averaging ${avgMinutesPerWeek.toFixed(0)} minutes of exercise per week, meeting or exceeding health guidelines. Keep up the fantastic work!`,
          category: 'exercise',
          priority: 'low',
          confidence: 0.9,
          dataPoints: ['exercise'],
          actionItems: [
            'Continue current exercise routine',
            'Consider adding variety to prevent plateaus',
            'Include both cardio and strength training',
            'Listen to your body and allow rest days'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['exercise-achievement', 'consistency'],
          relatedInsights: []
        });
      }
    }

    return insights;
  }

  private analyzeVitalSigns(metrics: HealthMetricHistory[], trends: HealthTrend[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    
    // Blood pressure analysis
    const bpMetrics = metrics.filter(m => m.metricType === 'blood_pressure').slice(0, 5);
    if (bpMetrics.length >= 2) {
      const avgBP = bpMetrics.reduce((sum, m) => sum + m.value, 0) / bpMetrics.length;
      
      if (avgBP > 140) {
        insights.push({
          id: `insight_${Date.now()}_bp_high`,
          userId: bpMetrics[0].userId,
          type: 'warning',
          title: 'Elevated Blood Pressure Detected',
          content: `Your recent blood pressure readings average ${avgBP.toFixed(0)} mmHg systolic, which is above normal range. This requires attention and monitoring.`,
          category: 'preventive-care',
          priority: 'high',
          confidence: 0.9,
          dataPoints: ['blood_pressure'],
          actionItems: [
            'Schedule appointment with healthcare provider',
            'Monitor blood pressure daily',
            'Reduce sodium intake',
            'Increase physical activity gradually',
            'Manage stress through relaxation techniques'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['blood-pressure', 'cardiovascular'],
          relatedInsights: []
        });
      }
    }

    return insights;
  }

  private generatePreventiveCareRecommendations(profile: UserProfile, timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();

    // Age-specific screening recommendations
    if (age >= 40 && age < 50) {
      insights.push({
        id: `insight_${Date.now()}_preventive_40s`,
        userId: profile.id,
        type: 'educational',
        title: 'Important Health Screenings for Your 40s',
        content: 'Your age group should focus on cardiovascular health monitoring, diabetes prevention, and cancer screenings. Early detection is key to maintaining long-term health.',
        category: 'preventive-care',
        priority: 'medium',
        confidence: 0.95,
        dataPoints: ['age'],
        actionItems: [
          'Annual blood pressure and cholesterol checks',
          'Diabetes screening every 3 years',
          'Mammogram (women) or prostate screening (men)',
          'Skin cancer screening annually',
          'Eye exam every 2 years'
        ],
        isRead: false,
        isFavorited: false,
        createdAt: timestamp,
        tags: ['preventive-care', 'screening', 'age-specific'],
        relatedInsights: []
      });
    } else if (age >= 50) {
      insights.push({
        id: `insight_${Date.now()}_preventive_50plus`,
        userId: profile.id,
        type: 'educational',
        title: 'Essential Health Screenings After 50',
        content: 'Your age group has increased focus on cancer screenings, bone health, and cardiovascular monitoring. Regular preventive care becomes even more critical.',
        category: 'preventive-care',
        priority: 'high',
        confidence: 0.95,
        dataPoints: ['age'],
        actionItems: [
          'Colonoscopy every 10 years (or as recommended)',
          'Annual mammogram (women)',
          'Bone density screening',
          'Annual eye exam including glaucoma screening',
          'Cardiovascular risk assessment'
        ],
        isRead: false,
        isFavorited: false,
        createdAt: timestamp,
        tags: ['preventive-care', 'screening', 'age-specific'],
        relatedInsights: []
      });
    }

    return insights;
  }

  private analyzeMedicationAdherence(profile: UserProfile, detailedData: DetailedHealthData[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const medicationData = detailedData.filter(d => d.type === 'medication').slice(0, 7);

    if (profile.medications.length > 0 && medicationData.length >= 3) {
      const adherenceRates = medicationData.map(d => {
        const meds = (d.data as any).medications || [];
        const adherent = meds.filter((m: any) => m.adherence).length;
        return meds.length > 0 ? adherent / meds.length : 1;
      });

      const avgAdherence = adherenceRates.reduce((a, b) => a + b) / adherenceRates.length;

      if (avgAdherence < 0.8) {
        insights.push({
          id: `insight_${Date.now()}_medication_adherence`,
          userId: profile.id,
          type: 'warning',
          title: 'Medication Adherence Needs Improvement',
          content: `Your medication adherence rate of ${(avgAdherence * 100).toFixed(0)}% is below optimal. Poor adherence can reduce treatment effectiveness and worsen health outcomes.`,
          category: 'medication',
          priority: 'high',
          confidence: 0.85,
          dataPoints: ['medication'],
          actionItems: [
            'Set daily medication reminders',
            'Use a pill organizer',
            'Discuss barriers with healthcare provider',
            'Consider medication timing adjustments'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['medication-adherence', 'treatment'],
          relatedInsights: []
        });
      }
    }

    return insights;
  }

  private analyzeStressAndMentalHealth(profile: UserProfile, detailedData: DetailedHealthData[], timestamp: string): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const symptomData = detailedData.filter(d => d.type === 'symptoms').slice(0, 7);

    if (symptomData.length >= 3) {
      const avgStress = symptomData.reduce((sum, d) => sum + (d.data as any).stressLevel, 0) / symptomData.length;
      const avgMood = symptomData.reduce((sum, d) => sum + (d.data as any).mood, 0) / symptomData.length;
      const avgEnergy = symptomData.reduce((sum, d) => sum + (d.data as any).energyLevel, 0) / symptomData.length;

      if (avgStress > 3.5) {
        insights.push({
          id: `insight_${Date.now()}_high_stress`,
          userId: profile.id,
          type: 'warning',
          title: 'Elevated Stress Levels Detected',
          content: `Your average stress level of ${avgStress.toFixed(1)}/5 indicates chronic stress, which can impact immune function, sleep, and overall health.`,
          category: 'mental-health',
          priority: 'high',
          confidence: 0.8,
          dataPoints: ['symptoms'],
          actionItems: [
            'Practice daily stress reduction techniques',
            'Consider meditation or mindfulness apps',
            'Ensure adequate sleep and exercise',
            'Talk to a mental health professional if needed'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['stress-management', 'mental-health'],
          relatedInsights: []
        });
      }

      if (avgMood < 2.5) {
        insights.push({
          id: `insight_${Date.now()}_low_mood`,
          userId: profile.id,
          type: 'warning',
          title: 'Concerning Mood Patterns',
          content: `Your average mood score of ${avgMood.toFixed(1)}/5 suggests you may be experiencing persistent low mood. This deserves attention and support.`,
          category: 'mental-health',
          priority: 'high',
          confidence: 0.8,
          dataPoints: ['symptoms'],
          actionItems: [
            'Consider speaking with a mental health professional',
            'Maintain social connections',
            'Engage in activities you enjoy',
            'Ensure adequate sunlight exposure'
          ],
          isRead: false,
          isFavorited: false,
          createdAt: timestamp,
          tags: ['mood', 'mental-health'],
          relatedInsights: []
        });
      }
    }

    return insights;
  }
}

export const aiRecommendationEngine = AIRecommendationEngine.getInstance();
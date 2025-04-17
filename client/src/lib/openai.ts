import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Generate an AI insight based on user data
 * @param userId User ID
 * @param data Object containing user life data for analysis
 * @returns The generated insight content
 */
export async function generateLifeInsight(userId: number, data: any): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/suggestions', {
      userId,
      data
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate insight');
    }
    
    const result = await response.json();
    return result.content;
  } catch (error) {
    console.error('Error generating life insight:', error);
    throw error;
  }
}

/**
 * Analyze life balance across different domains
 * @param domains Array of life domains with scores
 * @returns Overall score and insights
 */
export async function analyzeLifeBalance(domains: any[]): Promise<{
  overallScore: number;
  insights: string;
}> {
  try {
    if (domains.length === 0) {
      return {
        overallScore: 0,
        insights: "No life domains data available for analysis."
      };
    }
    
    // Calculate average score across domains
    const sum = domains.reduce((acc, domain) => acc + domain.score, 0);
    const overallScore = Math.round(sum / domains.length);
    
    // Send to API for AI-powered insights
    const data = {
      domains: domains.map(d => ({
        name: d.name,
        score: d.score
      })),
      overallScore
    };
    
    try {
      // Try to get AI-powered insights
      const insight = await generateLifeInsight(domains[0].userId, data);
      return {
        overallScore,
        insights: insight
      };
    } catch (error) {
      console.error("Error getting AI insights, falling back to local analysis:", error);
      
      // Fallback to local analysis
      let insights = "Your life appears generally balanced. ";
      
      // Find lowest domain
      const lowestDomain = domains.reduce((lowest, current) => 
        current.score < lowest.score ? current : lowest, domains[0]);
        
      if (lowestDomain.score < 65) {
        insights += `Consider focusing more on improving your ${lowestDomain.name.toLowerCase()} domain.`;
      } else {
        insights += "All domains are performing well, keep up the good work!";
      }
      
      return {
        overallScore,
        insights
      };
    }
  } catch (error) {
    console.error('Error analyzing life balance:', error);
    throw error;
  }
}

/**
 * Generate schedule optimization suggestions based on events and preferences
 * @param events User's events/schedule
 * @param preferences User preferences for productive times and focus needs
 * @returns A suggestion for optimizing the schedule
 */
export async function suggestScheduleOptimization(
  events: any[],
  preferences: { productiveTimes: string[], focusNeeds: string[] }
): Promise<string> {
  try {
    if (events.length === 0) {
      return "Consider setting up your schedule to include focused work blocks, regular breaks, and time for recreation.";
    }
    
    // Prepare data for AI analysis
    const data = {
      events: events.map(e => ({
        title: e.title,
        startTime: e.startTime,
        endTime: e.endTime,
        type: e.type
      })),
      preferences
    };
    
    try {
      // Get AI-powered suggestion
      const userId = events[0].userId;
      const suggestion = await generateLifeInsight(userId, data);
      return suggestion;
    } catch (error) {
      console.error("Error getting AI schedule suggestion, falling back to default:", error);
      
      // Fallback suggestion
      return `Based on your schedule, consider blocking out 2 hours in the morning for deep work on your most important tasks.`;
    }
  } catch (error) {
    console.error('Error suggesting schedule optimization:', error);
    throw error;
  }
}

/**
 * Analyze mood patterns to generate insights
 * @param moods Array of user's mood entries
 * @returns AI-generated insights about mood patterns
 */
export async function analyzeMoodPatterns(moods: any[]): Promise<string> {
  try {
    if (moods.length < 3) {
      return "Record more moods to receive personalized insights about your emotional patterns.";
    }
    
    // Prepare data for AI analysis
    const data = {
      moods: moods.map(m => ({
        moodType: m.moodType,
        date: m.date,
        notes: m.notes
      }))
    };
    
    try {
      // Get AI-powered analysis
      const userId = moods[0].userId;
      const analysis = await generateLifeInsight(userId, data);
      return analysis;
    } catch (error) {
      console.error("Error analyzing mood patterns, falling back to default:", error);
      
      // Fallback analysis
      const moodCounts: Record<string, number> = {};
      moods.forEach(mood => {
        moodCounts[mood.moodType] = (moodCounts[mood.moodType] || 0) + 1;
      });
      
      const mostCommonMood = Object.entries(moodCounts).reduce(
        (max, [type, count]) => count > max[1] ? [type, count] : max, 
        ["", 0]
      )[0];
      
      return `You most frequently record feeling ${mostCommonMood}. Consider exploring what factors contribute to this mood.`;
    }
  } catch (error) {
    console.error('Error analyzing mood patterns:', error);
    throw error;
  }
}

/**
 * Generate personalized recommendations based on user data
 * @param userId User ID
 * @param context The context for recommendations (e.g., "health", "productivity")
 * @param userData Relevant user data for generating recommendations
 * @returns AI-generated personalized recommendations
 */
export async function generatePersonalizedRecommendations(
  userId: number, 
  context: string,
  userData: any
): Promise<string[]> {
  try {
    // Prepare data for AI analysis
    const data = {
      context,
      userData
    };
    
    try {
      // Get AI-powered recommendations
      const recommendationsText = await generateLifeInsight(userId, data);
      
      // Parse recommendations (assuming the API returns a list)
      const recommendations = recommendationsText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[0-9-.\s]*/, '').trim())
        .slice(0, 3); // Limit to 3 recommendations
      
      return recommendations.length > 0 ? recommendations : ["No specific recommendations available at this time."];
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      
      // Fallback recommendations
      return [
        `Consider setting specific, measurable goals for your ${context} activities.`,
        `Track your progress regularly to stay motivated.`,
        `Find an accountability partner to help you stay on track.`
      ];
    }
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    throw error;
  }
}

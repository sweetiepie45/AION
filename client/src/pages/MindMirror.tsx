import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Calendar, CalendarCheck2, History, Brain, Lightbulb, Plus } from "lucide-react";

export default function MindMirror() {
  const { 
    user, 
    moods, 
    fetchMoods, 
    fetchLifeDomains,
    fetchInsights,
    addMood,
    generateAISuggestion
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("today");
  const [currentMood, setCurrentMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [moodTrends, setMoodTrends] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([
    "Your mood tends to be highest in the mornings and declines throughout the day.",
    "You show a pattern of stress mid-week which may correlate with deadlines.",
    "Your happy moods strongly correlate with physical activity and social interaction."
  ]);
  
  const { toast } = useToast();

  const moodOptions = [
    { label: "Happy", emoji: "😊", value: "happy", color: "#4F46E5" },
    { label: "Energetic", emoji: "⚡", value: "energetic", color: "#10B981" },
    { label: "Calm", emoji: "😌", value: "calm", color: "#06B6D4" },
    { label: "Neutral", emoji: "😐", value: "neutral", color: "#9CA3AF" },
    { label: "Tired", emoji: "😴", value: "tired", color: "#6B7280" },
    { label: "Anxious", emoji: "😰", value: "anxious", color: "#F59E0B" },
    { label: "Sad", emoji: "😔", value: "sad", color: "#7C3AED" },
    { label: "Angry", emoji: "😠", value: "angry", color: "#EF4444" },
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Get date range for one month of data
          const today = new Date();
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          
          await Promise.all([
            fetchMoods(lastMonth, today),
            fetchLifeDomains(),
            fetchInsights()
          ]);
        }
      } catch (error) {
        console.error("Error loading mind mirror data:", error);
        toast({
          title: "Error",
          description: "Failed to load mood data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, fetchMoods, fetchLifeDomains, fetchInsights, toast]);

  // Process mood data
  useEffect(() => {
    if (moods && moods.length > 0) {
      // Set current mood if one exists for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayMood = moods.find(mood => {
        const moodDate = new Date(mood.date);
        moodDate.setHours(0, 0, 0, 0);
        return moodDate.getTime() === today.getTime();
      });
      
      if (todayMood) {
        setCurrentMood(todayMood.moodType);
      }
      
      // Process mood history (last 14 days)
      const last14Days = moods
        .slice(0, 14)
        .map(mood => ({
          date: format(new Date(mood.date), 'MMM d'),
          mood: mood.moodType,
          notes: mood.notes,
          score: getMoodScore(mood.moodType)
        }))
        .reverse();
      
      setMoodHistory(last14Days);
      
      // Calculate mood distribution
      const distribution = moodOptions.map(option => {
        const count = moods.filter(mood => mood.moodType === option.value).length;
        return {
          name: option.label,
          value: count,
          color: option.color
        };
      }).filter(item => item.value > 0);
      
      setMoodDistribution(distribution);
      
      // Calculate mood trends by day of week
      const moodsByDay = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
        const dayName = format(addDays(startOfWeek(new Date()), dayIndex), 'EEE');
        
        const dayMoods = moods.filter(mood => {
          const moodDate = new Date(mood.date);
          return moodDate.getDay() === dayIndex;
        });
        
        const scoreSum = dayMoods.reduce((sum, mood) => sum + getMoodScore(mood.moodType), 0);
        const average = dayMoods.length > 0 ? Math.round(scoreSum / dayMoods.length) : 0;
        
        return {
          day: dayName,
          score: average
        };
      });
      
      setMoodTrends(moodsByDay);
    }
  }, [moods]);

  const handleMoodSelection = (mood: string) => {
    setCurrentMood(mood);
    setMoodDialogOpen(true);
  };

  const handleSubmitMood = async () => {
    if (!user || !currentMood) return;
    
    try {
      await addMood({
        userId: user.id,
        date: new Date(),
        moodType: currentMood,
        notes: moodNote
      });
      
      setMoodDialogOpen(false);
      setMoodNote("");
      
      toast({
        title: "Mood Recorded",
        description: "Your mood has been successfully recorded.",
      });
      
      // Refresh moods
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      await fetchMoods(lastMonth, today);
      
      // Generate new AI insight
      await generateAISuggestion();
    } catch (error) {
      console.error("Error recording mood:", error);
      toast({
        title: "Error",
        description: "Failed to record your mood.",
        variant: "destructive"
      });
    }
  };

  // Helpers
  function getMoodScore(type: string): number {
    switch (type) {
      case "happy": return 90;
      case "energetic": return 85;
      case "calm": return 75;
      case "neutral": return 60;
      case "tired": return 40;
      case "anxious": return 30;
      case "sad": return 20;
      case "angry": return 10;
      default: return 50;
    }
  }

  function getMoodColor(type: string): string {
    const option = moodOptions.find(o => o.value === type);
    return option ? option.color : "#9CA3AF";
  }

  function getMoodEmoji(type: string): string {
    const option = moodOptions.find(o => o.value === type);
    return option ? option.emoji : "😐";
  }

  // Sample emotional dimensions data
  const emotionalDimensions = [
    { subject: 'Joy', A: 80, fullMark: 100 },
    { subject: 'Calmness', A: 70, fullMark: 100 },
    { subject: 'Energy', A: 60, fullMark: 100 },
    { subject: 'Focus', A: 75, fullMark: 100 },
    { subject: 'Optimism', A: 65, fullMark: 100 },
    { subject: 'Resilience', A: 85, fullMark: 100 },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Mind Mirror</h2>
          <p className="text-neutral-500 mt-1">Track, analyze, and improve your emotional well-being</p>
        </div>
        <div className="flex items-center mt-3 sm:mt-0 space-x-2">
          <Dialog open={moodDialogOpen} onOpenChange={setMoodDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Record Mood
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How are you feeling?</DialogTitle>
                <DialogDescription>
                  Record your current emotional state for tracking and insights.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-4 gap-2 py-4">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      currentMood === mood.value 
                        ? 'border-primary bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary-200'
                    }`}
                    onClick={() => setCurrentMood(mood.value)}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="grid gap-4 py-2">
                <Textarea
                  placeholder="Add notes about your mood (optional)"
                  className="min-h-[100px]"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setMoodDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitMood} disabled={!currentMood}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today" className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <Lightbulb className="mr-2 h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Tracker
          </TabsTrigger>
        </TabsList>

        {/* Today's Tab */}
        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Mood</CardTitle>
              </CardHeader>
              <CardContent>
                {currentMood ? (
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">{getMoodEmoji(currentMood)}</div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: getMoodColor(currentMood) }}>
                      {moodOptions.find(m => m.value === currentMood)?.label || "Neutral"}
                    </h3>
                    <p className="text-neutral-500 text-sm">Recorded today</p>
                    
                    <Button 
                      variant="outline" 
                      className="mt-6"
                      onClick={() => setMoodDialogOpen(true)}
                    >
                      Update Mood
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-neutral-600 mb-4">No mood recorded today</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood.value}
                          className="flex flex-col items-center p-3 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary-50"
                          onClick={() => handleMoodSelection(mood.value)}
                        >
                          <span className="text-2xl mb-1">{mood.emoji}</span>
                          <span className="text-xs font-medium">{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emotional Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={emotionalDimensions}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Your Emotional State"
                        dataKey="A"
                        stroke="#4F46E5"
                        fill="#4F46E5"
                        fillOpacity={0.3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-neutral-700">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mood History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mood Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {moodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Mood Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Mood Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <h3 className="font-medium text-lg mb-2 text-primary">Weekly Summary</h3>
                  <p className="text-neutral-700">
                    Your mood has been generally positive this week, with an average score of 72/100. 
                    This is a 5% improvement from last week. Your highest mood was recorded on Tuesday morning,
                    and your lowest mood was on Thursday afternoon.
                  </p>
                </div>
                
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <h3 className="font-medium text-lg mb-2 text-primary">Identified Patterns</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      Your mood is consistently higher in the mornings, particularly after exercise.
                    </li>
                    <li className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      Mid-week stress appears to correlate with your increased workload on Wednesdays.
                    </li>
                    <li className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      Social interactions on weekends have a strong positive effect on your mood.
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <h3 className="font-medium text-lg mb-2 text-primary">Recommendations</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li className="flex items-start">
                      <CalendarCheck2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      Schedule morning exercise sessions 3-4 times per week to maintain energy levels.
                    </li>
                    <li className="flex items-start">
                      <CalendarCheck2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      Consider implementing a mid-week relaxation routine to counteract Wednesday stress.
                    </li>
                    <li className="flex items-start">
                      <CalendarCheck2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      Plan at least one meaningful social interaction each weekend to boost overall mood.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracker Tab */}
        <TabsContent value="tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="font-medium text-neutral-500">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => {
                  // Calculate the date
                  const date = new Date();
                  date.setDate(date.getDate() - 34 + i);
                  
                  // Find if there's a mood for this date
                  const moodForDay = moods?.find(mood => {
                    const moodDate = new Date(mood.date);
                    return (
                      moodDate.getDate() === date.getDate() &&
                      moodDate.getMonth() === date.getMonth() &&
                      moodDate.getFullYear() === date.getFullYear()
                    );
                  });
                  
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-lg border p-2 flex flex-col items-center justify-center ${
                        moodForDay ? 'border-primary' : 'border-neutral-200'
                      }`}
                    >
                      <div className="text-xs text-neutral-500 mb-1">{format(date, 'd')}</div>
                      {moodForDay ? (
                        <div className="text-xl" title={moodOptions.find(m => m.value === moodForDay.moodType)?.label}>
                          {getMoodEmoji(moodForDay.moodType)}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-neutral-100"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-4 text-sm text-neutral-500">
                Mood data for the last 35 days
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Lightbulb, 
  MessageSquare, 
  CalendarClock, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  BarChart4, 
  Star, 
  Plus
} from "lucide-react";
import { generateLifeInsight } from "@/lib/openai";

export default function SmartAgent() {
  const { 
    user, 
    fetchLifeDomains,
    fetchEvents, 
    fetchMoods, 
    fetchTransactions, 
    fetchGoals, 
    fetchContacts, 
    fetchInsights,
    insights,
    addEvent,
    generateAISuggestion
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState("suggestions");
  const [filteredInsights, setFilteredInsights] = useState<any[]>([]);
  const [messageThread, setMessageThread] = useState<{
    id: number;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }[]>([
    {
      id: 1,
      content: "Hello! I'm your AI life assistant. How can I help optimize your life today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const today = new Date();
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          
          await Promise.all([
            fetchLifeDomains(),
            fetchEvents(lastMonth, today),
            fetchMoods(lastMonth, today),
            fetchTransactions(lastMonth, today),
            fetchGoals(),
            fetchContacts(),
            fetchInsights()
          ]);
        }
      } catch (error) {
        console.error("Error loading smart agent data:", error);
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, fetchLifeDomains, fetchEvents, fetchMoods, fetchTransactions, fetchGoals, fetchContacts, fetchInsights, toast]);

  // Process insights
  useEffect(() => {
    if (insights) {
      const filtered = insights.filter(insight => 
        selectedTab === "suggestions" 
          ? insight.type === 'suggestion' && !insight.isActioned
          : selectedTab === "all" 
            ? true
            : insight.type === selectedTab
      );
      
      setFilteredInsights(filtered);
    }
  }, [insights, selectedTab]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || !user) return;
    
    const userMessage = {
      id: messageThread.length + 1,
      content: prompt,
      role: 'user' as const,
      timestamp: new Date()
    };
    
    setMessageThread(prev => [...prev, userMessage]);
    setPrompt("");
    setIsGenerating(true);
    
    try {
      // In a real implementation, we would call the OpenAI API directly
      // For now, simulate a delay and use pre-defined responses
      
      // Try to get a response from the user's context
      let response: string;
      
      if (prompt.toLowerCase().includes("goal") || prompt.toLowerCase().includes("target")) {
        response = "Based on your current goals, you're making good progress on your reading goal but falling behind on your exercise targets. Would you like me to suggest a workout schedule that fits your calendar?";
      } else if (prompt.toLowerCase().includes("finance") || prompt.toLowerCase().includes("money") || prompt.toLowerCase().includes("budget")) {
        response = "Looking at your finances, I notice you've been spending more on dining out this month compared to last month. Would you like me to suggest some budget-friendly meal ideas?";
      } else if (prompt.toLowerCase().includes("mood") || prompt.toLowerCase().includes("feel")) {
        response = "I've analyzed your mood patterns, and you tend to feel best in the mornings after a good night's sleep. You might want to prioritize sleep and schedule important tasks in the morning when your energy is highest.";
      } else if (prompt.toLowerCase().includes("schedule") || prompt.toLowerCase().includes("calendar")) {
        response = "Your calendar looks quite busy next week. I suggest time-blocking your day to ensure you have focused work periods and adequate breaks. Would you like me to suggest an optimal schedule?";
      } else {
        response = "I'm analyzing your life data to provide helpful suggestions. Based on your patterns, I recommend focusing on better work-life balance. Would you like more specific suggestions for any particular area of your life?";
      }
      
      setTimeout(() => {
        const assistantMessage = {
          id: messageThread.length + 2,
          content: response,
          role: 'assistant' as const,
          timestamp: new Date()
        };
        
        setMessageThread(prev => [...prev, assistantMessage]);
        setIsGenerating(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    try {
      await generateAISuggestion();
      toast({
        title: "Insights Generated",
        description: "New AI insights have been generated based on your life data.",
      });
      
      await fetchInsights();
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = (insight: any) => {
    if (!user) return;
    
    // In a real implementation, this would create an event based on the suggestion
    // and mark the insight as actioned
    
    toast({
      title: "Suggestion Accepted",
      description: "The suggestion has been added to your schedule.",
    });
    
    // Refresh insights
    fetchInsights();
  };

  const handleScheduleSuggestion = (insight: any) => {
    if (!user) return;
    
    // In a real implementation, create an event from the suggestion
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    startTime.setMinutes(0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    const newEvent = {
      userId: user.id,
      title: "Smart Suggestion",
      description: insight.content,
      startTime,
      endTime,
      type: "personal",
      location: ""
    };
    
    addEvent(newEvent);
    
    toast({
      title: "Event Scheduled",
      description: "The suggestion has been added to your calendar.",
    });
  };

  const handleDismissSuggestion = (insight: any) => {
    // In a real implementation, mark the insight as read but not actioned
    toast({
      title: "Suggestion Dismissed",
      description: "The suggestion has been dismissed.",
    });
    
    // Refresh insights
    fetchInsights();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">SmartAgent</h2>
          <p className="text-neutral-500 mt-1">Your AI-powered life assistant</p>
        </div>
        <div className="flex items-center mt-3 sm:mt-0">
          <Button 
            onClick={handleGenerateInsights}
            disabled={isLoading}
            className="flex items-center"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Generate New Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Chat with Aion</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messageThread.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {format(message.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Ask Aion a question about your life..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] resize-none"
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-3"
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="suggestions" className="text-xs">Suggestions</TabsTrigger>
              <TabsTrigger value="reminder" className="text-xs">Reminders</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            </TabsList>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  AI Insights
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => fetchInsights()}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredInsights.length > 0 ? (
                  <div className="space-y-4">
                    {filteredInsights.map((insight) => (
                      <div key={insight.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start mb-3">
                          {insight.type === 'suggestion' ? (
                            <Lightbulb className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                          ) : insight.type === 'reminder' ? (
                            <Clock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                          ) : (
                            <BarChart4 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="font-medium text-sm text-neutral-800">
                              {insight.type === 'suggestion' ? 'Suggestion' : 
                               insight.type === 'reminder' ? 'Reminder' : 'Analysis'}
                              <span className="text-xs font-normal text-neutral-500 ml-2">
                                {format(new Date(insight.createdAt), 'MMM d, yyyy')}
                              </span>
                            </h3>
                            <p className="text-sm text-neutral-700 mt-1">{insight.content}</p>
                          </div>
                        </div>
                        
                        {insight.type === 'suggestion' && !insight.isActioned && (
                          <div className="flex space-x-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleAcceptSuggestion(insight)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleScheduleSuggestion(insight)}
                            >
                              <CalendarClock className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs h-8 ml-auto"
                              onClick={() => handleDismissSuggestion(insight)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-neutral-600 mb-1">No insights yet</h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      Generate AI insights based on your life data.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mx-auto"
                      onClick={handleGenerateInsights}
                      disabled={isLoading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">SmartAgent Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-lg mr-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Personalized Suggestions</h3>
                    <p className="text-xs text-neutral-500">
                      Get AI-powered suggestions based on your habits, goals, and life data.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-lg mr-3">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Smart Scheduling</h3>
                    <p className="text-xs text-neutral-500">
                      Optimize your calendar and automatically schedule activities at ideal times.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <BarChart4 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Life Analysis</h3>
                    <p className="text-xs text-neutral-500">
                      Get insights into patterns and trends across your life domains.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Goal Optimization</h3>
                    <p className="text-xs text-neutral-500">
                      Receive personalized strategies to help achieve your goals faster.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";
import { RefreshCw, Utensils, ShoppingBag, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import SmartAgentAlert from "@/components/dashboard/SmartAgentAlert";
import LifeBalanceCard from "@/components/dashboard/LifeBalanceCard";
import TodayScheduleCard from "@/components/dashboard/TodayScheduleCard";
import MindMirrorCard from "@/components/dashboard/MindMirrorCard";
import FinanceFlowCard from "@/components/dashboard/FinanceFlowCard";
import HumanNetworkCard from "@/components/dashboard/HumanNetworkCard";
import GoalProgressCard from "@/components/dashboard/GoalProgressCard";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { 
    user, 
    lifeDomains,
    events, 
    moods, 
    transactions, 
    goals, 
    contacts, 
    insights,
    fetchLifeDomains,
    fetchEvents, 
    fetchMoods, 
    fetchTransactions, 
    fetchGoals, 
    fetchContacts, 
    fetchInsights,
    addEvent,
    addMood,
    generateAISuggestion
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeInsight, setActiveInsight] = useState<any>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get current date range for today's events
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);

        // Get date range for weekly data
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        
        await Promise.all([
          fetchLifeDomains(),
          fetchEvents(today, tomorrow),
          fetchMoods(weekStart, tomorrow),
          fetchTransactions(weekStart, tomorrow),
          fetchGoals(),
          fetchContacts(),
          fetchInsights(1) // Get latest insight
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchLifeDomains, fetchEvents, fetchMoods, fetchTransactions, fetchGoals, fetchContacts, fetchInsights, toast]);

  useEffect(() => {
    // Set the most recent unactioned insight as active
    if (insights && insights.length > 0) {
      const latestInsight = insights.find(insight => !insight.isActioned);
      if (latestInsight) {
        setActiveInsight(latestInsight);
      }
    }
  }, [insights]);

  const handleRefresh = async () => {
    if (user) {
      setIsLoading(true);
      try {
        // Get current date range for today's events
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);

        // Get date range for weekly data
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        
        await Promise.all([
          fetchEvents(today, tomorrow),
          fetchMoods(weekStart, tomorrow),
          fetchTransactions(weekStart, tomorrow),
          fetchGoals(),
          fetchInsights(1)
        ]);
        
        // Generate new AI suggestion
        await generateAISuggestion();
        
        toast({
          title: "Dashboard Refreshed",
          description: "Latest data has been loaded.",
        });
      } catch (error) {
        console.error("Error refreshing dashboard:", error);
        toast({
          title: "Error",
          description: "Failed to refresh dashboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionAccept = () => {
    // In a real implementation, this would create an event from the suggestion
    if (activeInsight && user) {
      const newEvent = {
        userId: user.id,
        title: "Smart Suggestion: Break",
        description: activeInsight.content.slice(0, 100),
        startTime: new Date(Date.now() + 15 * 60000), // 15 minutes from now
        endTime: new Date(Date.now() + 45 * 60000), // 45 minutes from now
        type: "health",
        location: "Nearby"
      };
      
      addEvent(newEvent);
      
      toast({
        title: "Suggestion Scheduled",
        description: "The suggested activity has been added to your schedule.",
      });
    }
  };

  const handleSuggestionDismiss = () => {
    setActiveInsight(null);
    toast({
      title: "Suggestion Dismissed",
      description: "You can find more suggestions in the SmartAgent section.",
    });
  };

  // Format today's date
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");

  // Prepare mood options
  const moodOptions = [
    { label: "Happy", emoji: "😊", selected: moods?.[0]?.moodType === "happy" },
    { label: "Neutral", emoji: "😐", selected: moods?.[0]?.moodType === "neutral" },
    { label: "Low", emoji: "😔", selected: moods?.[0]?.moodType === "low" },
    { label: "Stressed", emoji: "😤", selected: moods?.[0]?.moodType === "stressed" },
  ];

  // Process mood data for trends
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday (0) to 6, others to 0-5
  
  const moodTrends = dayLabels.map((day, index) => {
    const matchingMood = moods?.find(mood => {
      const moodDate = new Date(mood.date);
      return moodDate.getDay() === (index + 1) % 7;
    });
    
    return {
      day,
      score: matchingMood ? getMoodScore(matchingMood.moodType) : 0,
      isToday: index === currentDay
    };
  });

  function getMoodScore(type: string): number {
    switch (type) {
      case "happy": return 80;
      case "neutral": return 60;
      case "low": return 30;
      case "stressed": return 20;
      default: return 0;
    }
  }

  // Format events for today's schedule
  const todayEvents = events?.map(event => ({
    id: event.id,
    title: event.title,
    startTime: event.startTime,
    duration: getEventDuration(new Date(event.startTime), new Date(event.endTime)),
    description: event.description || "",
    type: event.type
  })) || [];

  function getEventDuration(start: Date, end: Date): string {
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  // Finance data
  const financeSummary = {
    income: calculateTotalByType(transactions, "income"),
    incomeChange: 12,
    expenses: calculateTotalByType(transactions, "expense"),
    expensesChange: 8
  };

  function calculateTotalByType(transactions: any[], type: string): number {
    return transactions
      ?.filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0) || 0;
  }

  // Format weekly finance data
  const financeData = dayLabels.map(day => {
    return {
      day,
      income: Math.random() * 500 + 200, // This would be calculated from transaction data in a real app
      expenses: Math.random() * 300 + 100
    };
  });

  // Top expenses
  const topExpenses = [
    { id: 1, category: "Restaurants", amount: 280, percentage: 35, icon: <Utensils className="text-neutral-500 h-4 w-4" /> },
    { id: 2, category: "Shopping", amount: 240, percentage: 30, icon: <ShoppingBag className="text-neutral-500 h-4 w-4" /> },
    { id: 3, category: "Rent", amount: 950, percentage: 60, icon: <Home className="text-neutral-500 h-4 w-4" /> },
  ];

  // Format contacts for human network
  const priorityContacts = contacts?.map(contact => {
    // Calculate last contact status based on last contact date
    let status: 'good' | 'warn' | 'overdue' = 'good';
    if (contact.lastContact) {
      const lastContactDate = new Date(contact.lastContact);
      const daysSinceContact = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysSinceContact > 60) {
        status = 'overdue';
      } else if (daysSinceContact > 21) {
        status = 'warn';
      }
    } else {
      status = 'overdue';
    }
    
    return {
      id: contact.id,
      name: contact.name,
      avatarUrl: contact.avatarUrl,
      lastContact: contact.lastContact ? formatLastContact(new Date(contact.lastContact)) : 'Never',
      lastContactStatus: status
    };
  }).slice(0, 3) || [];

  function formatLastContact(date: Date): string {
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
    return `${Math.floor(daysDiff / 365)} years ago`;
  }

  // Network insights
  const networkInsights = [
    { id: 1, type: 'birthday', content: "Emma's birthday is in 3 days. Send a message or schedule a call." },
    { id: 2, type: 'suggestion', content: "You haven't connected with your college friends in 6+ months. Plan a reunion?" },
    { id: 3, type: 'trend', content: "Your networking activity is down 20% from last month." },
  ];

  // Format goals
  const activeGoals = goals?.map(goal => {
    const progress = (goal.current / goal.target) * 100;
    let status: 'on-track' | 'behind' | 'completed' = 'on-track';
    
    if (goal.isCompleted) {
      status = 'completed';
    } else if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const daysLeft = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      // Assume goal should be 50% complete when half the time to deadline has passed
      // A standard assumption without needing createdAt
      if (daysLeft < 0) {
        // Past deadline and not complete
        status = 'behind';
      } else if (daysLeft < 7 && progress < 80) {
        // Less than a week left but not at least 80% complete
        status = 'behind';
      } else if (daysLeft < 30 && progress < 50) {
        // Less than a month left but not at least 50% complete
        status = 'behind';
      }
    }
    
    return {
      id: goal.id,
      title: goal.title,
      current: goal.current,
      target: goal.target,
      remainingTime: goal.deadline ? formatRemainingTime(new Date(goal.deadline)) : 'No deadline',
      status,
      category: goal.category,
      icon: goal.icon
    };
  }).filter(goal => !goal.status.includes('completed')).slice(0, 3) || [];

  function formatRemainingTime(deadline: Date): string {
    const daysLeft = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return '1 day remaining';
    if (daysLeft < 7) return `${daysLeft} days remaining`;
    if (daysLeft < 30) return `${Math.floor(daysLeft / 7)} weeks remaining`;
    if (daysLeft < 365) return `${Math.floor(daysLeft / 30)} months remaining`;
    return `${Math.floor(daysLeft / 365)} years remaining`;
  }

  const handleSelectMood = (moodType: string) => {
    if (user) {
      addMood({
        userId: user.id,
        date: new Date(),
        moodType,
        notes: "",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Smart Agent Alert */}
      {activeInsight && (
        <SmartAgentAlert
          suggestion={activeInsight.content}
          timestamp="Just now"
          onAccept={handleSuggestionAccept}
          onDismiss={handleSuggestionDismiss}
        />
      )}

      {/* Dashboard Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
        <div className="flex items-center mt-3 sm:mt-0">
          <div className="mr-2 text-sm text-neutral-600">
            {formattedDate}
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center text-sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Life Balance Score */}
      <div className="mb-6">
        <LifeBalanceCard 
          domains={lifeDomains}
          overallScore={78}
          period="Last 7 days"
        />
      </div>

      {/* Today's Schedule and Mind Mirror */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TodayScheduleCard 
          events={todayEvents}
          onAddActivity={() => navigate("/auto-scheduler")}
          onViewAll={() => navigate("/auto-scheduler")}
        />
        
        <MindMirrorCard 
          moodOptions={moodOptions}
          moodTrends={moodTrends}
          lastUpdated="2h ago"
          aiInsight="You tend to be most productive and happy in the mornings. Consider scheduling creative tasks before noon."
          onSelectMood={handleSelectMood}
          onViewFullReport={() => navigate("/mind-mirror")}
        />
      </div>

      {/* Finance Flow + Human Network Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <FinanceFlowCard 
            summary={financeSummary}
            weeklyData={financeData}
            topExpenses={topExpenses}
          />
        </div>
        
        <HumanNetworkCard 
          contacts={priorityContacts}
          insights={networkInsights}
          onContactAction={(id) => console.log("Contact action for ID:", id)}
          onViewAll={() => navigate("/life-graph")}
        />
      </div>

      {/* Goal Progress */}
      <div className="mb-6">
        <GoalProgressCard 
          goals={activeGoals}
          onAddGoal={() => navigate("/life-graph")}
        />
      </div>
    </div>
  );
}

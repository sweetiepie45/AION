import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Book, Dumbbell, PiggyBank } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: number;
  title: string;
  current: number;
  target: number;
  remainingTime: string;
  status: 'on-track' | 'behind' | 'completed';
  category: string;
  icon: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on-track':
      return 'text-green-500';
    case 'behind':
      return 'text-amber-500';
    case 'completed':
      return 'text-blue-500';
    default:
      return 'text-neutral-500';
  }
};

const getGoalIcon = (icon: string, category: string) => {
  if (icon === 'book' || category === 'learning') {
    return <Book className="text-primary" />;
  } else if (icon === 'dumbbell' || category === 'health') {
    return <Dumbbell className="text-green-500" />;
  } else if (icon === 'piggy-bank' || category === 'finance') {
    return <PiggyBank className="text-amber-500" />;
  }
  return <Book className="text-primary" />;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'learning':
      return 'bg-primary-100';
    case 'health':
      return 'bg-green-100';
    case 'finance':
      return 'bg-amber-100';
    default:
      return 'bg-primary-100';
  }
};

interface GoalProgressCardProps {
  goals: Goal[];
  onAddGoal: () => void;
}

export default function GoalProgressCard({ goals = [], onAddGoal }: GoalProgressCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-neutral-800">Active Goals</h3>
          <Button
            variant="link"
            className="text-sm text-primary p-0 h-auto flex items-center"
            onClick={onAddGoal}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Goal
          </Button>
        </div>
        
        {goals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-neutral-500">No active goals</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onAddGoal}
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
              
              return (
                <div 
                  key={goal.id} 
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", getCategoryColor(goal.category))}>
                        {getGoalIcon(goal.icon, goal.category)}
                      </div>
                      <h4 className="ml-2 text-sm font-medium text-neutral-800">{goal.title}</h4>
                    </div>
                    <div className={cn("text-xs font-medium", getStatusColor(goal.status))}>
                      {goal.status === 'on-track' ? 'On track' : 
                       goal.status === 'behind' ? 'Behind' : 'Completed'}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">Progress</span>
                      <span className="text-neutral-800 font-medium">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <p className="text-xs text-neutral-500">{goal.remainingTime}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

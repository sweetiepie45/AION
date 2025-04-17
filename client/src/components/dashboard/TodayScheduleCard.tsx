import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface ScheduleEvent {
  id: number;
  title: string;
  startTime: Date | string;
  duration: string;
  description: string;
  type: 'work' | 'health' | 'personal' | 'other';
}

const getEventStyles = (type: string) => {
  switch (type) {
    case 'work':
      return 'border-primary-500 bg-primary-50';
    case 'health':
      return 'border-green-500 bg-green-50';
    case 'personal':
      return 'border-amber-500 bg-amber-50';
    default:
      return 'border-neutral-400 bg-neutral-50';
  }
};

interface TodayScheduleCardProps {
  events: ScheduleEvent[];
  onAddActivity: () => void;
  onViewAll: () => void;
}

export default function TodayScheduleCard({ 
  events = [], 
  onAddActivity, 
  onViewAll 
}: TodayScheduleCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 h-full">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-800">Today's Schedule</h3>
          <Button 
            variant="link" 
            className="text-xs font-medium text-primary p-0 h-auto"
            onClick={onViewAll}
          >
            View all
          </Button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500">No events scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const startTime = new Date(event.startTime);
              const hour = format(startTime, 'h:mm');
              const period = format(startTime, 'a');
              
              return (
                <div key={event.id} className="flex items-start">
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="block text-sm font-medium text-neutral-800">{hour}</span>
                    <span className="block text-xs text-neutral-500">{period}</span>
                  </div>
                  <div className={`ml-3 flex-1 p-3 border-l-2 rounded-r-lg ${getEventStyles(event.type)}`}>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-800">{event.title}</span>
                      <span className="text-xs text-neutral-500">{event.duration}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <Button 
          variant="outline"
          className="mt-4 w-full py-2 h-auto border-dashed text-sm text-neutral-600 hover:bg-neutral-50"
          onClick={onAddActivity}
        >
          <Plus className="mr-2 h-3 w-3" /> Add Activity
        </Button>
      </CardContent>
    </Card>
  );
}

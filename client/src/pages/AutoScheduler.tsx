import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, addDays, isSameDay, parseISO, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertOctagon, Calendar as CalendarIcon, Lightbulb, Plus, RefreshCw } from "lucide-react";
import { suggestScheduleOptimization } from "@/lib/openai";

export default function AutoScheduler() {
  const { 
    user, 
    events, 
    fetchEvents, 
    fetchLifeDomains,
    fetchInsights,
    addEvent,
    generateAISuggestion 
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWeek, setSelectedWeek] = useState<Date[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [optimizationTip, setOptimizationTip] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    location: "",
    type: "work"
  });

  const { toast } = useToast();

  // Generate week days
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = today.getDay() === 0 
      ? addDays(today, -6) // If Sunday, start from previous Monday
      : addDays(today, 1 - today.getDay()); // Otherwise, find last Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfWeek, i));
    }
    setSelectedWeek(days);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Get 30 days of events centered on today
          const startDate = addDays(new Date(), -15);
          const endDate = addDays(new Date(), 15);
          
          await Promise.all([
            fetchEvents(startDate, endDate),
            fetchLifeDomains(),
            fetchInsights()
          ]);

          // Get AI schedule optimization tip
          try {
            const preferences = {
              productiveTimes: ["morning"],
              focusNeeds: ["deep work", "meetings", "health"]
            };
            const tip = await suggestScheduleOptimization(events, preferences);
            setOptimizationTip(tip);
          } catch (error) {
            console.error("Error getting schedule optimization:", error);
            setOptimizationTip("Consider time-blocking your day for focused work and scheduled breaks.");
          }
        }
      } catch (error) {
        console.error("Error loading scheduler data:", error);
        toast({
          title: "Error",
          description: "Failed to load scheduler data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, fetchEvents, fetchLifeDomains, fetchInsights, toast]);

  // Filter events by selected date
  useEffect(() => {
    if (events && selectedDate) {
      const filtered = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return isSameDay(eventDate, selectedDate);
      });
      
      // Sort by start time
      filtered.sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
      
      setFilteredEvents(filtered);
    }
  }, [events, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleAddEvent = async () => {
    if (!user) return;
    
    // Validate form
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create event date by combining selected date with time inputs
    const [startHours, startMinutes] = newEvent.startTime.split(':').map(Number);
    const [endHours, endMinutes] = newEvent.endTime.split(':').map(Number);
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    // Validate times
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addEvent({
        userId: user.id,
        title: newEvent.title,
        description: newEvent.description,
        startTime: startDateTime,
        endTime: endDateTime,
        type: newEvent.type,
        location: newEvent.location
      });
      
      setOpenDialog(false);
      
      // Reset form
      setNewEvent({
        title: "",
        startTime: "",
        endTime: "",
        description: "",
        location: "",
        type: "work"
      });
      
      toast({
        title: "Event Added",
        description: "Your event has been added to your schedule.",
      });
      
      // Refresh events for selected date
      const startDate = addDays(new Date(), -15);
      const endDate = addDays(new Date(), 15);
      await fetchEvents(startDate, endDate);
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add the event.",
        variant: "destructive"
      });
    }
  };

  const formatEventTime = (time: string | Date) => {
    const date = typeof time === 'string' ? parseISO(time) : time;
    return format(date, 'h:mm a');
  };

  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'work':
        return 'border-l-primary bg-primary-50';
      case 'health':
        return 'border-l-green-500 bg-green-50';
      case 'personal':
        return 'border-l-amber-500 bg-amber-50';
      default:
        return 'border-l-neutral-400 bg-neutral-50';
    }
  };

  const generateScheduleSuggestion = async () => {
    setIsLoading(true);
    try {
      await generateAISuggestion();
      
      toast({
        title: "Schedule Optimized",
        description: "AI has analyzed your schedule and provided suggestions.",
      });
      
      // Update optimization tip
      const preferences = {
        productiveTimes: ["morning"],
        focusNeeds: ["deep work", "meetings", "health"]
      };
      const tip = await suggestScheduleOptimization(events, preferences);
      setOptimizationTip(tip);
    } catch (error) {
      console.error("Error generating schedule suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to generate schedule suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">AutoScheduler</h2>
        <div className="flex items-center mt-3 sm:mt-0 space-x-2">
          <Button
            onClick={generateScheduleSuggestion}
            disabled={isLoading}
            className="flex items-center"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Optimize Schedule
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event for {format(selectedDate, 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Event title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select 
                    defaultValue={newEvent.type}
                    onValueChange={(value) => setNewEvent({...newEvent, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input 
                    id="location" 
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Event location"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Event description"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleAddEvent}>Save Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Optimization Tip */}
      {optimizationTip && (
        <Card className="bg-primary-50 border-primary-200 mb-6">
          <CardContent className="py-4">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-neutral-800 mb-1">Schedule Optimization</h3>
                <p className="text-sm text-neutral-700">{optimizationTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        <Card className="bg-white lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card className="bg-white lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday(selectedDate) && (
                <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">Today</span>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedDate(new Date())}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Go to today</span>
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="day" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
              
              <TabsContent value="day">
                {filteredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="flex items-start">
                        <div className="flex-shrink-0 w-16 text-center">
                          <span className="block text-sm font-medium text-neutral-800">
                            {formatEventTime(event.startTime)}
                          </span>
                        </div>
                        <div className={`ml-3 flex-1 p-3 border-l-2 rounded-r-lg ${getEventTypeStyles(event.type)}`}>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-neutral-800">{event.title}</span>
                            <span className="text-xs text-neutral-500">
                              {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            {event.location && <span className="font-medium">{event.location}</span>}
                            {event.location && event.description && <span> - </span>}
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg">
                    <AlertOctagon className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-neutral-600 mb-1">No Events Scheduled</h3>
                    <p className="text-sm text-neutral-500 mb-4">There are no events scheduled for this day.</p>
                    <Button 
                      onClick={() => setOpenDialog(true)}
                      className="flex mx-auto items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Event
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="week">
                <div className="grid grid-cols-7 gap-2">
                  {selectedWeek.map((day, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-2 rounded-md ${
                        isSameDay(day, selectedDate) ? 'bg-primary-50 border border-primary-200' : ''
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-xs font-medium text-neutral-500">{format(day, 'E')}</div>
                      <div className={`
                        text-lg font-medium rounded-full w-8 h-8 mx-auto flex items-center justify-center
                        ${isToday(day) ? 'bg-primary text-white' : 'text-neutral-700'}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {events
                          .filter(event => isSameDay(new Date(event.startTime), day))
                          .slice(0, 3)
                          .map((event, idx) => (
                            <div 
                              key={idx} 
                              className={`
                                text-xs truncate py-1 px-2 rounded 
                                ${getEventTypeStyles(event.type)}
                              `}
                              title={event.title}
                            >
                              {format(new Date(event.startTime), 'h:mm a')} {event.title}
                            </div>
                          ))
                        }
                        
                        {events.filter(event => isSameDay(new Date(event.startTime), day)).length > 3 && (
                          <div className="text-xs text-neutral-500 italic">
                            + {events.filter(event => isSameDay(new Date(event.startTime), day)).length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

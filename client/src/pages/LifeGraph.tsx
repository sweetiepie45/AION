import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Network,
  Users, 
  Heart, 
  Briefcase, 
  BookOpen, 
  Smile, 
  Brain, 
  Plus, 
  BarChart4, 
  UserPlus, 
  MessageSquare, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Cake
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";

export default function LifeGraph() {
  const { 
    user, 
    lifeDomains, 
    contacts, 
    goals,
    fetchLifeDomains, 
    fetchContacts, 
    fetchGoals,
    addGoal
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("life-domains");
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedLifeDomain, setSelectedLifeDomain] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: "",
    current: "0",
    deadline: "",
    category: "",
    icon: ""
  });
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    notes: ""
  });
  
  const { toast } = useToast();

  // Life domain options
  const domainOptions = [
    { name: "Health", icon: <Heart className="h-5 w-5" />, color: "bg-primary-100 text-primary" },
    { name: "Work", icon: <Briefcase className="h-5 w-5" />, color: "bg-green-100 text-green-500" },
    { name: "Social", icon: <Users className="h-5 w-5" />, color: "bg-amber-100 text-amber-500" },
    { name: "Learning", icon: <BookOpen className="h-5 w-5" />, color: "bg-pink-100 text-pink-500" },
    { name: "Fun", icon: <Smile className="h-5 w-5" />, color: "bg-purple-100 text-purple-500" },
    { name: "Mental", icon: <Brain className="h-5 w-5" />, color: "bg-blue-100 text-blue-500" },
  ];

  // Goal categories
  const goalCategories = [
    { value: "health", label: "Health", icon: "heart" },
    { value: "work", label: "Work", icon: "briefcase" },
    { value: "social", label: "Social", icon: "users" },
    { value: "learning", label: "Learning", icon: "book" },
    { value: "fun", label: "Fun", icon: "smile" },
    { value: "finance", label: "Finance", icon: "piggy-bank" },
  ];

  // Relationship types
  const relationshipTypes = [
    { value: "friend", label: "Friend" },
    { value: "family", label: "Family" },
    { value: "colleague", label: "Colleague" },
    { value: "acquaintance", label: "Acquaintance" },
    { value: "mentor", label: "Mentor" },
    { value: "mentee", label: "Mentee" },
    { value: "other", label: "Other" },
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          await Promise.all([
            fetchLifeDomains(),
            fetchContacts(),
            fetchGoals()
          ]);
        }
      } catch (error) {
        console.error("Error loading life graph data:", error);
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
  }, [user, fetchLifeDomains, fetchContacts, fetchGoals, toast]);

  const handleAddGoal = async () => {
    if (!user) return;
    
    // Validate form
    if (!newGoal.title || !newGoal.target || !newGoal.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const target = parseFloat(newGoal.target);
      const current = parseFloat(newGoal.current);
      
      if (isNaN(target) || target <= 0) {
        toast({
          title: "Invalid Target",
          description: "Please enter a valid positive target value.",
          variant: "destructive"
        });
        return;
      }
      
      if (isNaN(current) || current < 0) {
        toast({
          title: "Invalid Current Value",
          description: "Please enter a valid current value (0 or greater).",
          variant: "destructive"
        });
        return;
      }
      
      const deadline = newGoal.deadline ? new Date(newGoal.deadline) : undefined;
      
      await addGoal({
        userId: user.id,
        title: newGoal.title,
        description: newGoal.description,
        target: target,
        current: current,
        deadline: deadline,
        category: newGoal.category,
        icon: newGoal.icon || goalCategories.find(c => c.value === newGoal.category)?.icon || "target",
        isCompleted: false
      });
      
      setGoalDialogOpen(false);
      
      // Reset form
      setNewGoal({
        title: "",
        description: "",
        target: "",
        current: "0",
        deadline: "",
        category: "",
        icon: ""
      });
      
      toast({
        title: "Goal Added",
        description: "Your goal has been added successfully.",
      });
      
      // Refresh goals
      await fetchGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add the goal.",
        variant: "destructive"
      });
    }
  };

  const handleAddContact = async () => {
    if (!user) return;
    
    // Validate form
    if (!newContact.name) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a name for the contact.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, we'd call the API here
      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your contacts.`,
      });
      
      setContactDialogOpen(false);
      
      // Reset form
      setNewContact({
        name: "",
        email: "",
        phone: "",
        relationship: "",
        notes: ""
      });
      
      // We'd refresh contacts here in a real app
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add the contact.",
        variant: "destructive"
      });
    }
  };

  // Sample data for radar chart
  const domainRadarData = lifeDomains.map(domain => ({
    subject: domain.name,
    A: domain.score,
    fullMark: 100
  }));

  // Format goals for display
  const formatGoals = goals.map(goal => {
    const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
    let status: 'on-track' | 'behind' | 'completed' = 'on-track';
    
    if (goal.isCompleted) {
      status = 'completed';
    } else if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const today = new Date();
      
      // Calculate days left until deadline
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
      ...goal,
      progress,
      status,
      formattedDeadline: goal.deadline 
        ? new Date(goal.deadline) < new Date() 
          ? 'Overdue'
          : formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })
        : 'No deadline'
    };
  });

  // Format contacts for display
  const formattedContacts = contacts.map(contact => {
    let lastContactText = 'Never';
    let status: 'good' | 'warn' | 'overdue' = 'good';
    
    if (contact.lastContact) {
      lastContactText = formatDistanceToNow(new Date(contact.lastContact), { addSuffix: true });
      
      const lastContactDate = new Date(contact.lastContact);
      const today = new Date();
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
      ...contact,
      lastContactText,
      status
    };
  });

  // Sample birthdays data
  const upcomingBirthdays = [
    { id: 1, name: "Emma Thompson", date: "Oct 15", daysLeft: 3 },
    { id: 2, name: "James Wilson", date: "Oct 22", daysLeft: 10 },
    { id: 3, name: "Sarah Miller", date: "Nov 5", daysLeft: 24 },
  ];

  // Sample relationship graph data
  const relationshipDistribution = [
    { name: "Friends", value: formattedContacts.filter(c => c.relationship === "friend").length },
    { name: "Family", value: formattedContacts.filter(c => c.relationship === "family").length },
    { name: "Colleagues", value: formattedContacts.filter(c => c.relationship === "colleague").length },
    { name: "Other", value: formattedContacts.filter(c => !["friend", "family", "colleague"].includes(c.relationship || "")).length },
  ];

  // Sample contact frequency data
  const contactFrequencyData = [
    { name: "Daily", count: 2 },
    { name: "Weekly", count: 5 },
    { name: "Monthly", count: 8 },
    { name: "Quarterly", count: 12 },
    { name: "Yearly", count: 20 },
    { name: "Rarely", count: 15 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-500';
      case 'behind':
        return 'text-amber-500';
      case 'completed':
        return 'text-blue-500';
      case 'good':
        return 'text-green-500';
      case 'warn':
        return 'text-amber-500';
      case 'overdue':
        return 'text-red-500';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">LifeGraph</h2>
          <p className="text-neutral-500 mt-1">Visualize and optimize your life balance</p>
        </div>
        <div className="flex items-center mt-3 sm:mt-0 space-x-2">
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>
                  Create a new goal to track your progress.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input 
                    id="title" 
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="E.g., Read 24 books this year"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({...newGoal, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="target">Target Value</Label>
                    <Input 
                      id="target" 
                      type="number"
                      min="1"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      placeholder="E.g., 24"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="current">Current Value</Label>
                    <Input 
                      id="current" 
                      type="number"
                      min="0"
                      value={newGoal.current}
                      onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                      placeholder="E.g., 0"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input 
                    id="deadline" 
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Add details about this goal"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddGoal}>Save Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new person to your human network.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Full name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input 
                      id="phone" 
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={newContact.relationship}
                    onValueChange={(value) => setNewContact({...newContact, relationship: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    value={newContact.notes}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    placeholder="Add notes about this contact"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setContactDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddContact}>Save Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="life-domains" className="flex items-center">
            <BarChart4 className="mr-2 h-4 w-4" />
            Life Domains
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center">
            <Network className="mr-2 h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Human Network
          </TabsTrigger>
        </TabsList>

        {/* Life Domains Tab */}
        <TabsContent value="life-domains" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Life Balance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={domainRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Your Life Balance"
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Domain Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lifeDomains.length > 0 ? (
                    lifeDomains.map((domain) => (
                      <div key={domain.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${domain.color}`}>
                              {domainOptions.find(d => d.name.toLowerCase() === domain.name.toLowerCase())?.icon || 
                               <Brain className="h-5 w-5" />}
                            </div>
                            <span className="ml-2 font-medium text-neutral-800">{domain.name}</span>
                          </div>
                          <span className="text-neutral-600">{domain.score}/100</span>
                        </div>
                        <Progress value={domain.score} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No life domains defined yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setDomainDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Life Domain
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Life Domain Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-neutral-800 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {lifeDomains
                      .filter(domain => domain.score >= 75)
                      .map((domain) => (
                        <li key={domain.id} className="flex items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${domain.color}`}>
                            {domainOptions.find(d => d.name.toLowerCase() === domain.name.toLowerCase())?.icon || 
                             <Brain className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="font-medium">{domain.name}</span>
                            <p className="text-sm text-neutral-600">
                              You're thriving in this area with a score of {domain.score}/100.
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-800 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {lifeDomains
                      .filter(domain => domain.score < 75)
                      .map((domain) => (
                        <li key={domain.id} className="flex items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${domain.color}`}>
                            {domainOptions.find(d => d.name.toLowerCase() === domain.name.toLowerCase())?.icon || 
                             <Brain className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="font-medium">{domain.name}</span>
                            <p className="text-sm text-neutral-600">
                              Consider focusing on improving this area (current score: {domain.score}/100).
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {formatGoals.filter(goal => !goal.isCompleted).length > 0 ? (
                  <div className="space-y-4">
                    {formatGoals
                      .filter(goal => !goal.isCompleted)
                      .map((goal) => (
                        <div key={goal.id} className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-all duration-200">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                goal.category === 'health' ? 'bg-primary-100 text-primary' :
                                goal.category === 'work' ? 'bg-green-100 text-green-500' :
                                goal.category === 'social' ? 'bg-amber-100 text-amber-500' :
                                goal.category === 'learning' ? 'bg-pink-100 text-pink-500' :
                                goal.category === 'fun' ? 'bg-purple-100 text-purple-500' :
                                goal.category === 'finance' ? 'bg-blue-100 text-blue-500' :
                                'bg-neutral-100 text-neutral-500'
                              }`}>
                                {goal.icon === 'heart' ? <Heart className="h-4 w-4" /> :
                                 goal.icon === 'briefcase' ? <Briefcase className="h-4 w-4" /> :
                                 goal.icon === 'users' ? <Users className="h-4 w-4" /> :
                                 goal.icon === 'book' ? <BookOpen className="h-4 w-4" /> :
                                 goal.icon === 'smile' ? <Smile className="h-4 w-4" /> :
                                 <Network className="h-4 w-4" />}
                              </div>
                              <h4 className="ml-2 text-sm font-medium text-neutral-800">{goal.title}</h4>
                            </div>
                            <div className={`text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {goal.status === 'on-track' ? 'On track' : 'Behind'}
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neutral-600">Progress</span>
                              <span className="text-neutral-800 font-medium">
                                {goal.current}/{goal.target}
                              </span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                          <p className="text-xs text-neutral-500">{goal.formattedDeadline}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No active goals yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setGoalDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {formatGoals.filter(goal => goal.isCompleted).length > 0 ? (
                  <div className="space-y-4">
                    {formatGoals
                      .filter(goal => goal.isCompleted)
                      .map((goal) => (
                        <div key={goal.id} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-500">
                                {goal.icon === 'heart' ? <Heart className="h-4 w-4" /> :
                                 goal.icon === 'briefcase' ? <Briefcase className="h-4 w-4" /> :
                                 goal.icon === 'users' ? <Users className="h-4 w-4" /> :
                                 goal.icon === 'book' ? <BookOpen className="h-4 w-4" /> :
                                 goal.icon === 'smile' ? <Smile className="h-4 w-4" /> :
                                 <Network className="h-4 w-4" />}
                              </div>
                              <h4 className="ml-2 text-sm font-medium text-neutral-800">{goal.title}</h4>
                            </div>
                            <div className="text-xs font-medium text-green-500">
                              Completed
                            </div>
                          </div>
                          <Progress value={100} className="h-2 bg-green-100" />
                          <p className="text-xs text-neutral-500 mt-2">
                            Target: {goal.target} {goal.description ? `- ${goal.description}` : ''}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No completed goals yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Goal Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={goalCategories.map(category => ({
                      name: category.label,
                      active: formatGoals.filter(g => g.category === category.value && !g.isCompleted).length,
                      completed: formatGoals.filter(g => g.category === category.value && g.isCompleted).length,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" name="Active Goals" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed Goals" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Human Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                {formattedContacts.length > 0 ? (
                  <div className="space-y-4">
                    {formattedContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center p-3 border border-neutral-200 rounded-lg hover:border-primary hover:bg-primary-50/30 transition-all duration-200">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                          <AvatarFallback>
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-neutral-800">{contact.name}</p>
                              <p className="text-xs text-neutral-500">
                                {contact.relationship ? 
                                  relationshipTypes.find(r => r.value === contact.relationship)?.label || contact.relationship
                                  : 'No relationship defined'}
                              </p>
                            </div>
                            <div className={`text-xs ${getStatusColor(contact.status)}`}>
                              Last contact: {contact.lastContactText}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-2">
                          {contact.email && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Mail className="h-4 w-4 text-neutral-500" />
                              <span className="sr-only">Email</span>
                            </Button>
                          )}
                          {contact.phone && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Phone className="h-4 w-4 text-neutral-500" />
                              <span className="sr-only">Call</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="sr-only">Message</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                            <span className="sr-only">More</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No contacts yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setContactDialogOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Your First Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Birthdays</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingBirthdays.map((birthday) => (
                      <div key={birthday.id} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Cake className="h-4 w-4 text-primary" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-800">{birthday.name}</p>
                          <p className="text-xs text-neutral-500">
                            {birthday.date} ({birthday.daysLeft} days away)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Network Composition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    {relationshipDistribution.map((type, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{type.name}</span>
                          <span className="font-medium">{type.value}</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${Math.min(100, (type.value / Math.max(...relationshipDistribution.map(t => t.value), 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contactFrequencyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Number of Contacts" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

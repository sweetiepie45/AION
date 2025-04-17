import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface LifeDomain {
  id: number;
  userId: number;
  name: string;
  score: number;
  icon: string;
  color: string;
}

interface Event {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  type: string;
  location?: string;
}

interface Mood {
  id: number;
  userId: number;
  date: Date | string;
  moodType: string;
  notes?: string;
}

interface Transaction {
  id: number;
  userId: number;
  amount: number;
  category: string;
  date: Date | string;
  description?: string;
  type: string;
}

interface Goal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  target: number;
  current: number;
  deadline?: Date | string;
  category: string;
  icon: string;
  isCompleted: boolean;
}

interface Contact {
  id: number;
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  lastContact?: Date | string;
  relationship?: string;
  notes?: string;
}

interface Insight {
  id: number;
  userId: number;
  content: string;
  type: string;
  category: string;
  createdAt: Date | string;
  isRead: boolean;
  isActioned: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
  lifeDomains: LifeDomain[];
  events: Event[];
  moods: Mood[];
  transactions: Transaction[];
  goals: Goal[];
  contacts: Contact[];
  insights: Insight[];
  fetchLifeDomains: () => Promise<void>;
  fetchEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchMoods: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchTransactions: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  fetchInsights: (limit?: number) => Promise<void>;
  addMood: (mood: Omit<Mood, 'id'>) => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: number, goal: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  generateAISuggestion: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [lifeDomains, setLifeDomains] = useState<LifeDomain[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  
  const { toast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error('Failed to fetch current user');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const fetchLifeDomains = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/life-domains?userId=${user.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLifeDomains(data);
      } else {
        console.error('Failed to fetch life domains');
      }
    } catch (error) {
      console.error('Error fetching life domains:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let url = `/api/events?userId=${user.id}`;
      
      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMoods = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let url = `/api/moods?userId=${user.id}`;
      
      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoods(data);
      } else {
        console.error('Failed to fetch moods');
      }
    } catch (error) {
      console.error('Error fetching moods:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTransactions = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let url = `/api/transactions?userId=${user.id}`;
      
      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/goals?userId=${user.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        console.error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts?userId=${user.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchInsights = useCallback(async (limit?: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let url = `/api/insights?userId=${user.id}`;
      
      if (limit) {
        url += `&limit=${limit}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        console.error('Failed to fetch insights');
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addMood = useCallback(async (mood: Omit<Mood, 'id'>) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('POST', '/api/moods', mood);
      
      if (response.ok) {
        const newMood = await response.json();
        setMoods(prev => [newMood, ...prev]);
        toast({
          title: "Mood recorded",
          description: "Your mood has been successfully recorded.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to record mood.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding mood:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const addEvent = useCallback(async (event: Omit<Event, 'id'>) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('POST', '/api/events', event);
      
      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        toast({
          title: "Event added",
          description: "Your event has been successfully added to your schedule.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('POST', '/api/goals', goal);
      
      if (response.ok) {
        const newGoal = await response.json();
        setGoals(prev => [...prev, newGoal]);
        toast({
          title: "Goal added",
          description: "Your goal has been successfully added.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add goal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateGoal = useCallback(async (id: number, goal: Partial<Omit<Goal, 'id'>>) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('PUT', `/api/goals/${id}`, goal);
      
      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
        toast({
          title: "Goal updated",
          description: "Your goal has been successfully updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update goal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const generateAISuggestion = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Collect all user data to send to the AI
      const userData = {
        lifeDomains,
        events,
        moods,
        transactions,
        goals,
        contacts
      };
      
      const response = await apiRequest('POST', '/api/ai/suggestions', {
        userId: user.id,
        data: userData
      });
      
      if (response.ok) {
        const newInsight = await response.json();
        setInsights(prev => [newInsight, ...prev]);
        toast({
          title: "New suggestion",
          description: "AI has generated a new suggestion for you.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate AI suggestion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, lifeDomains, events, moods, transactions, goals, contacts, toast]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      loading,
      fetchCurrentUser,
      logout,
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
      addMood,
      addEvent,
      addGoal,
      updateGoal,
      generateAISuggestion,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

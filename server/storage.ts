import { 
  type User, 
  type InsertUser, 
  type LifeDomain, 
  type InsertLifeDomain,
  type Event,
  type InsertEvent,
  type Mood,
  type InsertMood,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type Contact,
  type InsertContact,
  type Insight,
  type InsertInsight
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Life Domains
  getLifeDomains(userId: number): Promise<LifeDomain[]>;
  getLifeDomain(id: number): Promise<LifeDomain | undefined>;
  createLifeDomain(domain: InsertLifeDomain): Promise<LifeDomain>;
  updateLifeDomain(id: number, domain: Partial<InsertLifeDomain>): Promise<LifeDomain | undefined>;
  deleteLifeDomain(id: number): Promise<boolean>;
  
  // Events/Schedule
  getEvents(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Moods
  getMoods(userId: number, startDate?: Date, endDate?: Date): Promise<Mood[]>;
  getMood(id: number): Promise<Mood | undefined>;
  createMood(mood: InsertMood): Promise<Mood>;
  
  // Transactions
  getTransactions(userId: number, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Goals
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Contacts
  getContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // Insights
  getInsights(userId: number, limit?: number): Promise<Insight[]>;
  getInsight(id: number): Promise<Insight | undefined>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  markInsightAsRead(id: number): Promise<Insight | undefined>;
  markInsightAsActioned(id: number): Promise<Insight | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lifeDomains: Map<number, LifeDomain>;
  private events: Map<number, Event>;
  private moods: Map<number, Mood>;
  private transactions: Map<number, Transaction>;
  private goals: Map<number, Goal>;
  private contacts: Map<number, Contact>;
  private insights: Map<number, Insight>;
  
  private userId: number;
  private lifeDomainId: number;
  private eventId: number;
  private moodId: number;
  private transactionId: number;
  private goalId: number;
  private contactId: number;
  private insightId: number;

  constructor() {
    this.users = new Map();
    this.lifeDomains = new Map();
    this.events = new Map();
    this.moods = new Map();
    this.transactions = new Map();
    this.goals = new Map();
    this.contacts = new Map();
    this.insights = new Map();
    
    this.userId = 1;
    this.lifeDomainId = 1;
    this.eventId = 1;
    this.moodId = 1;
    this.transactionId = 1;
    this.goalId = 1;
    this.contactId = 1;
    this.insightId = 1;
    
    // Initialize with demo user
    this.createUser({
      username: "demo",
      password: "password123",
      email: "demo@example.com",
      fullName: "Alex Morgan",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Life Domains methods
  async getLifeDomains(userId: number): Promise<LifeDomain[]> {
    return Array.from(this.lifeDomains.values()).filter(
      (domain) => domain.userId === userId
    );
  }
  
  async getLifeDomain(id: number): Promise<LifeDomain | undefined> {
    return this.lifeDomains.get(id);
  }
  
  async createLifeDomain(domain: InsertLifeDomain): Promise<LifeDomain> {
    const id = this.lifeDomainId++;
    const lifeDomain: LifeDomain = { ...domain, id };
    this.lifeDomains.set(id, lifeDomain);
    return lifeDomain;
  }
  
  async updateLifeDomain(id: number, domain: Partial<InsertLifeDomain>): Promise<LifeDomain | undefined> {
    const existing = this.lifeDomains.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...domain };
    this.lifeDomains.set(id, updated);
    return updated;
  }
  
  async deleteLifeDomain(id: number): Promise<boolean> {
    return this.lifeDomains.delete(id);
  }
  
  // Events methods
  async getEvents(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let events = Array.from(this.events.values()).filter(
      (event) => event.userId === userId
    );
    
    if (startDate) {
      events = events.filter(event => new Date(event.startTime) >= startDate);
    }
    
    if (endDate) {
      events = events.filter(event => new Date(event.startTime) <= endDate);
    }
    
    return events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent: Event = { ...event, id };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    return updated;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Moods methods
  async getMoods(userId: number, startDate?: Date, endDate?: Date): Promise<Mood[]> {
    let moods = Array.from(this.moods.values()).filter(
      (mood) => mood.userId === userId
    );
    
    if (startDate) {
      moods = moods.filter(mood => new Date(mood.date) >= startDate);
    }
    
    if (endDate) {
      moods = moods.filter(mood => new Date(mood.date) <= endDate);
    }
    
    return moods.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getMood(id: number): Promise<Mood | undefined> {
    return this.moods.get(id);
  }
  
  async createMood(mood: InsertMood): Promise<Mood> {
    const id = this.moodId++;
    const newMood: Mood = { ...mood, id };
    this.moods.set(id, newMood);
    return newMood;
  }
  
  // Transactions methods
  async getTransactions(userId: number, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
    
    if (startDate) {
      transactions = transactions.filter(transaction => new Date(transaction.date) >= startDate);
    }
    
    if (endDate) {
      transactions = transactions.filter(transaction => new Date(transaction.date) <= endDate);
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  // Goals methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }
  
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goalId++;
    const newGoal: Goal = { ...goal, id };
    this.goals.set(id, newGoal);
    return newGoal;
  }
  
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...goal };
    this.goals.set(id, updated);
    return updated;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
  
  // Contacts methods
  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.userId === userId
    );
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...contact };
    this.contacts.set(id, updated);
    return updated;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }
  
  // Insights methods
  async getInsights(userId: number, limit?: number): Promise<Insight[]> {
    const insights = Array.from(this.insights.values())
      .filter(insight => insight.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? insights.slice(0, limit) : insights;
  }
  
  async getInsight(id: number): Promise<Insight | undefined> {
    return this.insights.get(id);
  }
  
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const id = this.insightId++;
    const newInsight: Insight = { 
      ...insight, 
      id, 
      createdAt: new Date(),
    };
    this.insights.set(id, newInsight);
    return newInsight;
  }
  
  async markInsightAsRead(id: number): Promise<Insight | undefined> {
    const insight = this.insights.get(id);
    if (!insight) return undefined;
    
    const updated = { ...insight, isRead: true };
    this.insights.set(id, updated);
    return updated;
  }
  
  async markInsightAsActioned(id: number): Promise<Insight | undefined> {
    const insight = this.insights.get(id);
    if (!insight) return undefined;
    
    const updated = { ...insight, isActioned: true };
    this.insights.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

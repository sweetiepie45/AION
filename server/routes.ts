import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertLifeDomainSchema,
  insertEventSchema,
  insertMoodSchema,
  insertTransactionSchema,
  insertGoalSchema,
  insertContactSchema,
  insertInsightSchema
} from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development" });

export async function registerRoutes(app: Express): Promise<Server> {
  // ==== User Routes ====
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/users', async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid user data', errors: result.error.errors });
      }
      
      // Check if user with username/email already exists
      const existingUserByUsername = await storage.getUserByUsername(result.data.username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: 'Username already taken' });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(result.data.email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      const user = await storage.createUser(result.data);
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.get('/api/users/me', async (req, res) => {
    try {
      // In a real app, this would get the user from the session
      // For demo purposes, returning the first user
      const users = Array.from(storage['users'].values());
      if (users.length === 0) {
        return res.status(404).json({ message: 'No user found' });
      }
      
      const user = users[0];
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Life Domains Routes ====
  app.get('/api/life-domains', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      const domains = await storage.getLifeDomains(userId);
      res.status(200).json(domains);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/life-domains', async (req, res) => {
    try {
      const result = insertLifeDomainSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid life domain data', errors: result.error.errors });
      }
      
      const domain = await storage.createLifeDomain(result.data);
      res.status(201).json(domain);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/life-domains/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const result = insertLifeDomainSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid life domain data', errors: result.error.errors });
      }
      
      const updated = await storage.updateLifeDomain(id, result.data);
      
      if (!updated) {
        return res.status(404).json({ message: 'Life domain not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/life-domains/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const success = await storage.deleteLifeDomain(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Life domain not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Events Routes ====
  app.get('/api/events', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      let startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      let endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      // Validate dates
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid startDate format' });
      }
      
      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format' });
      }
      
      const events = await storage.getEvents(userId, startDate, endDate);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/events', async (req, res) => {
    try {
      const result = insertEventSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid event data', errors: result.error.errors });
      }
      
      const event = await storage.createEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const result = insertEventSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid event data', errors: result.error.errors });
      }
      
      const updated = await storage.updateEvent(id, result.data);
      
      if (!updated) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Moods Routes ====
  app.get('/api/moods', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      let startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      let endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      // Validate dates
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid startDate format' });
      }
      
      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format' });
      }
      
      const moods = await storage.getMoods(userId, startDate, endDate);
      res.status(200).json(moods);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/moods', async (req, res) => {
    try {
      const result = insertMoodSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid mood data', errors: result.error.errors });
      }
      
      const mood = await storage.createMood(result.data);
      res.status(201).json(mood);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Transactions Routes ====
  app.get('/api/transactions', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      let startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      let endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      // Validate dates
      if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid startDate format' });
      }
      
      if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format' });
      }
      
      const transactions = await storage.getTransactions(userId, startDate, endDate);
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/transactions', async (req, res) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: result.error.errors });
      }
      
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Goals Routes ====
  app.get('/api/goals', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      const goals = await storage.getGoals(userId);
      res.status(200).json(goals);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/goals', async (req, res) => {
    try {
      const result = insertGoalSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid goal data', errors: result.error.errors });
      }
      
      const goal = await storage.createGoal(result.data);
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const result = insertGoalSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid goal data', errors: result.error.errors });
      }
      
      const updated = await storage.updateGoal(id, result.data);
      
      if (!updated) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const success = await storage.deleteGoal(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Contacts Routes ====
  app.get('/api/contacts', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      const contacts = await storage.getContacts(userId);
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/contacts', async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid contact data', errors: result.error.errors });
      }
      
      const contact = await storage.createContact(result.data);
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const result = insertContactSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid contact data', errors: result.error.errors });
      }
      
      const updated = await storage.updateContact(id, result.data);
      
      if (!updated) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.delete('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const success = await storage.deleteContact(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== Insights Routes ====
  app.get('/api/insights', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }
      
      if (limit !== undefined && isNaN(limit)) {
        return res.status(400).json({ message: 'Limit must be a number' });
      }
      
      const insights = await storage.getInsights(userId, limit);
      res.status(200).json(insights);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/insights', async (req, res) => {
    try {
      const result = insertInsightSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid insight data', errors: result.error.errors });
      }
      
      const insight = await storage.createInsight(result.data);
      res.status(201).json(insight);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.patch('/api/insights/:id/read', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const updated = await storage.markInsightAsRead(id);
      
      if (!updated) {
        return res.status(404).json({ message: 'Insight not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.patch('/api/insights/:id/action', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Valid id is required' });
      }
      
      const updated = await storage.markInsightAsActioned(id);
      
      if (!updated) {
        return res.status(404).json({ message: 'Insight not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ==== OpenAI Route for AI Insights ====
  app.post('/api/ai/suggestions', async (req, res) => {
    try {
      const { userId, data } = req.body;
      
      if (!userId || !data) {
        return res.status(400).json({ message: 'userId and data are required' });
      }
      
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an AI life assistant that provides helpful insights and suggestions based on user data. Your goal is to help users optimize their life and achieve balance."
            },
            {
              role: "user",
              content: `Based on this user data, provide one specific, actionable insight or suggestion that would help the user optimize their life or achieve better balance:\n\n${JSON.stringify(data)}`
            }
          ],
          max_tokens: 150
        });
        
        const suggestion = response.choices[0].message.content;
        
        // Store the suggestion as an insight
        const insight = await storage.createInsight({
          userId,
          content: suggestion,
          type: 'suggestion',
          category: 'ai',
          isRead: false,
          isActioned: false
        });
        
        res.status(200).json(insight);
      } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ message: 'Error generating AI suggestion', error: error.message });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

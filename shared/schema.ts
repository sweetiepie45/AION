import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatarUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Life domains
export const lifeDomains = pgTable("life_domains", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertLifeDomainSchema = createInsertSchema(lifeDomains).pick({
  userId: true,
  name: true,
  score: true,
  icon: true,
  color: true,
});

export type InsertLifeDomain = z.infer<typeof insertLifeDomainSchema>;
export type LifeDomain = typeof lifeDomains.$inferSelect;

// Activities/Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: text("type").notNull(), // work, personal, health, etc.
  location: text("location"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  type: true,
  location: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Mood tracking
export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  moodType: text("mood_type").notNull(), // happy, sad, neutral, stressed, etc.
  notes: text("notes"),
});

export const insertMoodSchema = createInsertSchema(moods).pick({
  userId: true,
  date: true,
  moodType: true,
  notes: true,
});

export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moods.$inferSelect;

// Financial transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  type: text("type").notNull(), // income or expense
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  category: true,
  date: true,
  description: true,
  type: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Goals
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  target: real("target").notNull(),
  current: real("current").notNull(),
  deadline: timestamp("deadline"),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  target: true,
  current: true,
  deadline: true,
  category: true,
  icon: true,
  isCompleted: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Contacts for human network
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  lastContact: timestamp("last_contact"),
  relationship: text("relationship"), // friend, family, colleague, etc.
  notes: text("notes"),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  lastContact: true,
  relationship: true,
  notes: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// AI Insights
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull(), // suggestion, reminder, analysis
  category: text("category").notNull(), // health, work, finance, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  isActioned: boolean("is_actioned").notNull().default(false),
});

export const insertInsightSchema = createInsertSchema(insights).pick({
  userId: true,
  content: true,
  type: true,
  category: true,
  isRead: true,
  isActioned: true,
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

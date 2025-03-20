import { pgTable, text, serial, integer, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('parent'),
  email: text("email").notNull(),
  name: text("name").notNull(),
});

export const childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  stats: jsonb("stats").notNull(),
  equipmentSlots: jsonb("equipment_slots").notNull(),
  preferences: jsonb("preferences").notNull(),
  avatarColor: text("avatar_color").notNull().default('primary'),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(),
  price: integer("price").notNull(),
  statBoosts: jsonb("stat_boosts").notNull(),
  imageUrl: text("image_url"),
  requirements: jsonb("requirements"),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  itemId: integer("item_id").notNull(),
  equipped: boolean("equipped").notNull().default(false),
  acquiredAt: text("acquired_at").notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contentType: text("content_type").notNull(),
  content: text("content").notNull(),
  difficulty: integer("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull(),
  coinReward: integer("coin_reward").notNull(),
  prerequisites: jsonb("prerequisites"),
  tags: jsonb("tags").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  choices: jsonb("choices").notNull(),
  correctAnswerId: text("correct_answer_id").notNull(),
  hint: text("hint"),
  difficulty: integer("difficulty").notNull(),
  tags: jsonb("tags").notNull(),
});

export const answerHistory = pgTable("answer_history", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedChoiceId: text("selected_choice_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const lessonCompletions = pgTable("lesson_completions", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  score: integer("score").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const mapZones = pgTable("map_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  config: jsonb("config").notNull(),
  unlockRequirements: jsonb("unlock_requirements"),
});

export const miniGames = pgTable("mini_games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  difficulty: integer("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull(),
  coinReward: integer("coin_reward").notNull(),
  questionIds: jsonb("question_ids"),
});

export const childMapProgress = pgTable("child_map_progress", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  zoneId: integer("zone_id").notNull(),
  nodeStatuses: jsonb("node_statuses").notNull(), // Array of {nodeId: string, status: string}
  completedAt: text("completed_at"),
  lastUpdatedAt: text("last_updated_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
  name: true,
});

export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertAnswerHistorySchema = createInsertSchema(answerHistory).omit({
  id: true,
});

export const insertLessonCompletionSchema = createInsertSchema(lessonCompletions).omit({
  id: true,
});

export const insertMapZoneSchema = createInsertSchema(mapZones).omit({
  id: true,
});

export const insertMiniGameSchema = createInsertSchema(miniGames).omit({
  id: true,
});

export const insertChildMapProgressSchema = createInsertSchema(childMapProgress).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type AnswerHistory = typeof answerHistory.$inferSelect;
export type InsertAnswerHistory = z.infer<typeof insertAnswerHistorySchema>;

export type LessonCompletion = typeof lessonCompletions.$inferSelect;
export type InsertLessonCompletion = z.infer<typeof insertLessonCompletionSchema>;

export type MapZone = typeof mapZones.$inferSelect;
export type InsertMapZone = z.infer<typeof insertMapZoneSchema>;

export type MiniGame = typeof miniGames.$inferSelect;
export type InsertMiniGame = z.infer<typeof insertMiniGameSchema>;

export type ChildMapProgress = typeof childMapProgress.$inferSelect;
export type InsertChildMapProgress = z.infer<typeof insertChildMapProgressSchema>;

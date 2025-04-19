import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { pgTable, text, timestamp, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core"

// Configure Neon for serverless environment
neonConfig.fetchConnectionCache = true

// Initialize the SQL client with the database URL
export const sql = neon(process.env.DATABASE_URL!)

// Initialize Drizzle ORM
export const db = drizzle(sql)

// Helper function to execute raw SQL queries using tagged template literals
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // For debugging
    console.log("Executing query:", query.replace(/\$\d+/g, "?"))

    // Use sql.query for parameterized queries
    return await sql.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Export the raw SQL client for direct use when needed

// Define role enum for messages
export const roleEnum = pgEnum("role", ["user", "agent"])

// Define tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  voice: text("voice"),
  instructions: text("instructions"),
  data: jsonb("data"), // Additional agent data in JSON format
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const scenarios = pgTable("scenarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  // Store the entire scenario structure as JSONB for efficient nested JSON storage
  root: jsonb("root").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id")
    .notNull()
    .references(() => scenarios.id, { onDelete: "cascade" }),
  title: text("title"),
  // Store messages as JSONB array for efficient access
  messages: jsonb("messages")
    .$type<
      {
        role: "user" | "agent"
        content: string
        agentId?: string
        timestamp: string
      }[]
    >()
    .default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Types for our database schema
export type User = typeof users.$inferSelect
export type Agent = typeof agents.$inferSelect
export type Scenario = typeof scenarios.$inferSelect
export type Conversation = typeof conversations.$inferSelect

// Types for inserting data
export type NewUser = typeof users.$inferInsert
export type NewAgent = typeof agents.$inferInsert
export type NewScenario = typeof scenarios.$inferInsert
export type NewConversation = typeof conversations.$inferInsert

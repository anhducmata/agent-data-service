import { z } from "zod"

// Position schema
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

// Tool schema - matching the real structure
export const toolSchema = z.object({
  tool_id: z.string(),
  position: positionSchema,
  name: z.string().optional(),
  description: z.string().optional(),
})

// Handoff schema (recursive)
export const handoffSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    handoff_description: z.string(),
    agent_id: z.string(),
    position: positionSchema,
    tools: z.array(toolSchema).default([]),
    handoffs: z.array(z.lazy(() => handoffSchema)).default([]),
  }),
)

// Scenario node schema
export const scenarioNodeSchema = z.object({
  agent_id: z.string(),
  position: positionSchema,
  tools: z.array(toolSchema).default([]),
  handoffs: z.array(handoffSchema).default([]),
})

// Scenario validation schemas
export const createScenarioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  scenario_id: z.string().optional(), // Allow this field but it's optional
  root: scenarioNodeSchema,
})

export const updateScenarioSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  scenario_id: z.string().optional(), // Allow this field but it's optional
  root: scenarioNodeSchema.optional(),
})

// Keep the rest of the validation schemas unchanged
export const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  voice: z.string().optional(),
  instructions: z.string().optional(),
})

export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  voice: z.string().optional(),
  instructions: z.string().optional(),
})

// Conversation validation schemas
export const createConversationSchema = z.object({
  title: z.string().optional(),
  initialMessage: z.string().optional(),
})

// UUID regex pattern
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Param validation schemas
export const userIdParam = z.object({
  userId: z.string().refine((val) => uuidRegex.test(val) || val === "demo", {
    message: "User ID must be a valid UUID or 'demo'",
  }),
})

export const agentIdParam = z.object({
  agentId: z.string().refine((val) => uuidRegex.test(val), {
    message: "Agent ID must be a valid UUID",
  }),
})

export const scenarioIdParam = z.object({
  scenarioId: z.string().refine((val) => uuidRegex.test(val), {
    message: "Scenario ID must be a valid UUID",
  }),
})

export const conversationIdParam = z.object({
  conversationId: z.string().refine((val) => uuidRegex.test(val), {
    message: "Conversation ID must be a valid UUID",
  }),
})

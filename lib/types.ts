// Common types
export interface Position {
  x: number
  y: number
}

// Agent types
export interface Agent {
  id: string
  name: string
  description?: string
  userId: string
  voice?: string
  instructions?: string
  createdAt: Date
  updatedAt: Date
}

export interface AgentCreate {
  name: string
  description?: string
  voice?: string
  instructions?: string
}

export interface AgentUpdate {
  name?: string
  description?: string
  voice?: string
  instructions?: string
}

// Tool types
export interface Tool {
  tool_id: string
  name?: string
  description?: string
  position: Position
}

// Handoff types
export interface Handoff {
  handoff_description: string
  agent_id: string
  position: Position
  tools: Tool[]
  handoffs: Handoff[]
}

// Scenario types
export interface ScenarioNode {
  agent_id: string
  position: Position
  tools: Tool[]
  handoffs: Handoff[]
}

export interface Scenario {
  id: string
  name: string
  description?: string
  userId: string
  root: ScenarioNode
  createdAt: Date
  updatedAt: Date
}

export interface ScenarioCreate {
  name: string
  description?: string
  scenario_id?: string
  root: ScenarioNode
}

export interface ScenarioUpdate {
  name?: string
  description?: string
  scenario_id?: string
  root?: ScenarioNode
}

// Conversation types
export interface Message {
  role: "user" | "agent"
  content: string
  agentId?: string
  timestamp: Date
}

export interface Conversation {
  id: string
  scenarioId: string
  title?: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ConversationCreate {
  title?: string
  initialMessage?: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ErrorResponse {
  message: string
  code: string
}

import { sql } from "./db"
import type {
  Agent,
  AgentCreate,
  AgentUpdate,
  Scenario,
  ScenarioCreate,
  ScenarioUpdate,
  Conversation,
  ConversationCreate,
} from "./types"

// UUID regex pattern
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// User operations
export async function getUserById(userId: string) {
  try {
    console.log(`Fetching user with ID: ${userId}`)

    // Special case for demo or non-UUID IDs
    if (userId === "demo" || !uuidRegex.test(userId)) {
      console.log(`Using demo user for non-UUID ID: ${userId}`)
      // Return a demo user for testing
      return {
        id: "00000000-0000-0000-0000-000000000000",
        name: "Demo User",
        email: "demo@example.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // Use tagged template literal syntax for valid UUIDs
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`
    console.log(`User query result:`, result.length > 0 ? "User found" : "User not found")
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error(`Error in getUserById(${userId}):`, error)
    throw error
  }
}

// Agent operations
export async function getAgentsByUserId(userId: string): Promise<Agent[]> {
  try {
    console.log(`Fetching agents for user ID: ${userId}`)

    // Special case for demo or non-UUID IDs
    if (userId === "demo" || !uuidRegex.test(userId)) {
      console.log(`Using demo agents for non-UUID ID: ${userId}`)
      // Return demo agents for testing
      return [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Demo Support Agent",
          description: "A demo support agent for testing",
          userId: "00000000-0000-0000-0000-000000000000",
          voice: "friendly",
          instructions: "Be helpful and courteous",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          name: "Demo Sales Agent",
          description: "A demo sales agent for testing",
          userId: "00000000-0000-0000-0000-000000000000",
          voice: "professional",
          instructions: "Focus on customer needs and product benefits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    }

    // Use tagged template literal syntax for valid UUIDs
    const result = await sql`SELECT * FROM agents WHERE user_id = ${userId} ORDER BY created_at DESC`

    console.log(`Found ${result.length} agents for user ${userId}`)

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      voice: row.voice,
      instructions: row.instructions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      ...(row.data || {}),
    }))
  } catch (error) {
    console.error(`Error in getAgentsByUserId(${userId}):`, error)
    throw error
  }
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  try {
    // Use tagged template literal syntax
    const result = await sql`SELECT * FROM agents WHERE id = ${agentId}`

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      voice: row.voice,
      instructions: row.instructions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      ...(row.data || {}),
    }
  } catch (error) {
    console.error(`Error in getAgentById(${agentId}):`, error)
    throw error
  }
}

export async function createAgent(userId: string, data: AgentCreate): Promise<Agent> {
  try {
    console.log(`Creating agent for user ID: ${userId}`, data)

    // Use tagged template literal syntax
    const result = await sql`
      INSERT INTO agents (user_id, name, description, voice, instructions, data)
      VALUES (${userId}, ${data.name}, ${data.description || null}, ${data.voice || null}, ${data.instructions || null}, ${"{}"}::jsonb)
      RETURNING *
    `

    console.log(`Agent created successfully with ID: ${result[0]?.id || "unknown"}`)

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      voice: row.voice,
      instructions: row.instructions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in createAgent for user ${userId}:`, error)
    throw error
  }
}

export async function updateAgent(agentId: string, data: AgentUpdate): Promise<Agent | null> {
  try {
    // Build the SET clause dynamically
    const updateQuery = `UPDATE agents SET `
    const updateValues = []
    const updateClauses = []

    if (data.name !== undefined) {
      updateClauses.push(`name = ${data.name}`)
    }

    if (data.description !== undefined) {
      updateClauses.push(`description = ${data.description}`)
    }

    if (data.voice !== undefined) {
      updateClauses.push(`voice = ${data.voice}`)
    }

    if (data.instructions !== undefined) {
      updateClauses.push(`instructions = ${data.instructions}`)
    }

    // Always update the updated_at timestamp
    updateClauses.push(`updated_at = NOW()`)

    if (updateClauses.length === 1) {
      // Only updated_at was set, nothing else to update
      return getAgentById(agentId)
    }

    // Use tagged template literal syntax with dynamic construction
    // This is a bit complex, so we'll use a simpler approach for now
    // Just update all fields regardless of whether they were provided
    const result = await sql`
      UPDATE agents 
      SET 
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        voice = COALESCE(${data.voice}, voice),
        instructions = COALESCE(${data.instructions}, instructions),
        updated_at = NOW()
      WHERE id = ${agentId}
      RETURNING *
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      voice: row.voice,
      instructions: row.instructions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in updateAgent:`, error)
    throw error
  }
}

export async function deleteAgent(agentId: string): Promise<boolean> {
  try {
    // Use tagged template literal syntax
    const result = await sql`DELETE FROM agents WHERE id = ${agentId} RETURNING id`
    return result.length > 0
  } catch (error) {
    console.error(`Error in deleteAgent:`, error)
    throw error
  }
}

// Scenario operations
export async function getScenariosByUserId(userId: string): Promise<Scenario[]> {
  try {
    // Use tagged template literal syntax
    const result = await sql`SELECT * FROM scenarios WHERE user_id = ${userId} ORDER BY created_at DESC`

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      root: row.root,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error(`Error in getScenariosByUserId:`, error)
    throw error
  }
}

export async function getScenarioById(scenarioId: string): Promise<Scenario | null> {
  try {
    // Use tagged template literal syntax
    const result = await sql`SELECT * FROM scenarios WHERE id = ${scenarioId}`

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      root: row.root,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in getScenarioById:`, error)
    throw error
  }
}

export async function createScenario(userId: string, data: ScenarioCreate): Promise<Scenario> {
  try {
    console.log(`Creating scenario for user ID: ${userId}`)

    // Use the provided scenario_id if available, otherwise generate a new one
    const scenarioId = data.scenario_id || undefined

    // Ensure the root object is properly formatted
    const rootData = JSON.stringify(data.root)

    // Use a transaction to ensure data consistency
    const result = await sql.transaction(async (tx) => {
      const insertResult = await tx`
        INSERT INTO scenarios (id, user_id, name, description, root)
        VALUES (${scenarioId || null}, ${userId}, ${data.name}, ${data.description || null}, ${rootData}::jsonb)
        RETURNING *
      `
      return insertResult
    })

    console.log(`Scenario created successfully with ID: ${result[0]?.id || "unknown"}`)

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      root: row.root,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in createScenario for user ${userId}:`, error)
    throw error
  }
}

export async function updateScenario(scenarioId: string, data: ScenarioUpdate): Promise<Scenario | null> {
  try {
    // Use tagged template literal syntax with COALESCE for optional updates
    const result = await sql`
      UPDATE scenarios 
      SET 
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        root = COALESCE(${data.root ? JSON.stringify(data.root) : null}, root),
        updated_at = NOW()
      WHERE id = ${scenarioId}
      RETURNING *
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      userId: row.user_id,
      root: row.root,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in updateScenario:`, error)
    throw error
  }
}

export async function deleteScenario(scenarioId: string): Promise<boolean> {
  try {
    // Use tagged template literal syntax
    const result = await sql`DELETE FROM scenarios WHERE id = ${scenarioId} RETURNING id`
    return result.length > 0
  } catch (error) {
    console.error(`Error in deleteScenario:`, error)
    throw error
  }
}

// Conversation operations
export async function getConversationsByScenarioId(scenarioId: string): Promise<Conversation[]> {
  try {
    // Use tagged template literal syntax
    const result = await sql`
      SELECT * FROM conversations 
      WHERE scenario_id = ${scenarioId} 
      ORDER BY created_at DESC
    `

    return result.map((row) => ({
      id: row.id,
      scenarioId: row.scenario_id,
      title: row.title,
      messages: row.messages || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error(`Error in getConversationsByScenarioId:`, error)
    throw error
  }
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    // Use tagged template literal syntax
    const result = await sql`SELECT * FROM conversations WHERE id = ${conversationId}`

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      scenarioId: row.scenario_id,
      title: row.title,
      messages: row.messages || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in getConversationById:`, error)
    throw error
  }
}

export async function createConversation(scenarioId: string, data: ConversationCreate): Promise<Conversation> {
  try {
    const messages = data.initialMessage
      ? [
          {
            role: "user" as const,
            content: data.initialMessage,
            timestamp: new Date().toISOString(),
          },
        ]
      : []

    const title = data.title || `Conversation ${new Date().toISOString()}`
    const messagesJson = JSON.stringify(messages)

    // Use tagged template literal syntax
    const result = await sql`
      INSERT INTO conversations (scenario_id, title, messages)
      VALUES (${scenarioId}, ${title}, ${messagesJson})
      RETURNING *
    `

    const row = result[0]
    return {
      id: row.id,
      scenarioId: row.scenario_id,
      title: row.title,
      messages: row.messages || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in createConversation:`, error)
    throw error
  }
}

export async function addMessageToConversation(
  conversationId: string,
  role: "user" | "agent",
  content: string,
  agentId?: string,
): Promise<Conversation | null> {
  try {
    const conversation = await getConversationById(conversationId)
    if (!conversation) return null

    const newMessage = {
      role,
      content,
      agentId,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...conversation.messages, newMessage]
    const messagesJson = JSON.stringify(updatedMessages)

    // Use tagged template literal syntax
    const result = await sql`
      UPDATE conversations 
      SET messages = ${messagesJson}, updated_at = NOW()
      WHERE id = ${conversationId}
      RETURNING *
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      scenarioId: row.scenario_id,
      title: row.title,
      messages: row.messages,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  } catch (error) {
    console.error(`Error in addMessageToConversation:`, error)
    throw error
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    // Use tagged template literal syntax
    const result = await sql`DELETE FROM conversations WHERE id = ${conversationId} RETURNING id`
    return result.length > 0
  } catch (error) {
    console.error(`Error in deleteConversation:`, error)
    throw error
  }
}

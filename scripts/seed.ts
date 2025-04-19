import { sql } from "../lib/db"
import { v4 as uuidv4 } from "uuid"

async function seed() {
  console.log("🌱 Seeding database...")

  try {
    // Check if we have any users
    const existingUsers = await sql`SELECT * FROM users LIMIT 1`

    let userId: string

    if (existingUsers.length === 0) {
      // Create a test user
      console.log("Creating test user...")
      const userResult = await sql`
        INSERT INTO users (id, name, email, created_at)
        VALUES (${uuidv4()}, 'Test User', 'test@example.com', NOW())
        RETURNING id
      `
      userId = userResult[0].id
      console.log(`Created user with ID: ${userId}`)
    } else {
      userId = existingUsers[0].id
      console.log(`Using existing user with ID: ${userId}`)
    }

    // Create some test agents
    console.log("Creating test agents...")
    const agent1Id = uuidv4()
    const agent2Id = uuidv4()

    await sql`
      INSERT INTO agents (id, user_id, name, description, voice, instructions, created_at, updated_at)
      VALUES 
        (${agent1Id}, ${userId}, 'Customer Support Agent', 'Handles customer inquiries and support requests', 'friendly', 'Be helpful and courteous', NOW(), NOW()),
        (${agent2Id}, ${userId}, 'Sales Agent', 'Handles product inquiries and sales', 'professional', 'Focus on customer needs and product benefits', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `

    // Create a test scenario
    console.log("Creating test scenario...")
    const scenarioId = uuidv4()

    const scenarioRoot = {
      agent_id: agent1Id,
      position: { x: 100, y: 100 },
      tools: [
        {
          tool_id: uuidv4(),
          name: "Knowledge Base",
          description: "Access to product documentation",
          position: { x: 200, y: 150 },
        },
      ],
      handoffs: [
        {
          handoff_description: "Transfer to sales",
          agent_id: agent2Id,
          position: { x: 300, y: 200 },
          tools: [],
          handoffs: [],
        },
      ],
    }

    await sql`
      INSERT INTO scenarios (id, user_id, name, description, root, created_at, updated_at)
      VALUES (${scenarioId}, ${userId}, 'Customer Support Flow', 'Standard customer support workflow', ${JSON.stringify(scenarioRoot)}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `

    // Create a test conversation
    console.log("Creating test conversation...")
    const conversationId = uuidv4()

    const messages = [
      {
        role: "user",
        content: "Hello, I need help with my order",
        timestamp: new Date().toISOString(),
      },
      {
        role: "agent",
        content: "Hi there! I'd be happy to help with your order. Could you please provide your order number?",
        agentId: agent1Id,
        timestamp: new Date(Date.now() + 1000).toISOString(),
      },
    ]

    await sql`
      INSERT INTO conversations (id, scenario_id, title, messages, created_at, updated_at)
      VALUES (${conversationId}, ${scenarioId}, 'Order Help Request', ${JSON.stringify(messages)}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `

    console.log("✅ Seed completed successfully!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
  } finally {
    process.exit(0)
  }
}

seed()

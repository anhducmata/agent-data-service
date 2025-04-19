import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    console.log("Running seed API endpoint")

    // Check if we have any users
    const existingUsers = await sql`SELECT * FROM users LIMIT 1`

    let userId: string

    if (existingUsers.length === 0) {
      // Create a test user
      console.log("Creating test user...")
      const userResult = await sql`
        INSERT INTO users (id, name, email, created_at, updated_at)
        VALUES (${uuidv4()}, 'Test User', 'test@example.com', NOW(), NOW())
        RETURNING id
      `

      userId = userResult[0].id
      console.log(`Created user with ID: ${userId}`)
    } else {
      userId = existingUsers[0].id
      console.log(`Using existing user with ID: ${userId}`)
    }

    // Create some test agents if none exist
    const existingAgents = await sql`SELECT * FROM agents WHERE user_id = ${userId} LIMIT 1`

    if (existingAgents.length === 0) {
      console.log("Creating test agents...")
      const agent1Id = uuidv4()
      const agent2Id = uuidv4()

      await sql`
        INSERT INTO agents (id, user_id, name, description, voice, instructions, created_at, updated_at)
        VALUES 
          (${agent1Id}, ${userId}, 'Customer Support Agent', 'Handles customer inquiries and support requests', 'friendly', 'Be helpful and courteous', NOW(), NOW()),
          (${agent2Id}, ${userId}, 'Sales Agent', 'Handles product inquiries and sales', 'professional', 'Focus on customer needs and product benefits', NOW(), NOW())
      `

      console.log("Created test agents")
    } else {
      console.log("Test agents already exist")
    }

    return NextResponse.json({
      success: true,
      message: "Seed completed successfully",
      userId,
    })
  } catch (error) {
    console.error("Seed API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}

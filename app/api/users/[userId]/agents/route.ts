import type { NextRequest } from "next/server"
import { validateRequest, validateParams, successResponse, errorResponse } from "@/lib/api-utils"
import { userIdParam, createAgentSchema } from "@/lib/validation"
import { getAgentsByUserId, getUserById, createAgent } from "@/lib/db-utils"

/**
 * @swagger
 * /users/{userId}/agents:
 *   get:
 *     summary: Get all agents for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    console.log("GET /api/users/[userId]/agents - Request received", { userId: params.userId })

    // For demo purposes, allow any userId
    let userId = params.userId

    try {
      // Try to validate the userId as a UUID
      const validatedParams = validateParams(params, userIdParam)
      if (!validatedParams.success) {
        console.log("Using demo mode due to validation error:", validatedParams.error)
        userId = "demo" // Use demo mode for invalid UUIDs
      } else {
        userId = validatedParams.data.userId
      }
    } catch (error) {
      console.log("Using demo mode due to validation error:", error)
      userId = "demo" // Use demo mode for any validation errors
    }

    try {
      // Get user (will return demo user for non-UUID IDs)
      const user = await getUserById(userId)
      if (!user) {
        console.log("User not found, returning empty array")
        return successResponse([])
      }

      // Get agents (will return demo agents for non-UUID IDs)
      const userAgents = await getAgentsByUserId(userId)
      console.log(`Found ${userAgents.length} agents for user ${userId}`)
      return successResponse(userAgents)
    } catch (error) {
      console.error("Error fetching data:", error)
      return errorResponse(
        {
          message: "Failed to fetch agents",
          code: "FETCH_FAILED",
        },
        500,
      )
    }
  } catch (error) {
    console.error("Unexpected error in GET /api/users/[userId]/agents:", error)
    return errorResponse(
      {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
      500,
    )
  }
}

/**
 * @swagger
 * /users/{userId}/agents:
 *   post:
 *     summary: Create a new agent
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentCreate'
 *     responses:
 *       201:
 *         description: Agent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    console.log("POST /api/users/[userId]/agents - Request received", { userId: params.userId })

    // For demo purposes, allow any userId
    let userId = params.userId

    try {
      // Try to validate the userId as a UUID
      const validatedParams = validateParams(params, userIdParam)
      if (!validatedParams.success) {
        console.log("Using demo mode due to validation error:", validatedParams.error)
        userId = "demo" // Use demo mode for invalid UUIDs
      } else {
        userId = validatedParams.data.userId
      }
    } catch (error) {
      console.log("Using demo mode due to validation error:", error)
      userId = "demo" // Use demo mode for any validation errors
    }

    // Validate request body
    const validatedBody = await validateRequest(req, createAgentSchema)
    if (!validatedBody.success) {
      console.error("Validation error:", validatedBody.error)
      return errorResponse(validatedBody.error, 400)
    }

    try {
      // Check if user exists (will return demo user for non-UUID IDs)
      const user = await getUserById(userId)
      if (!user && userId !== "demo") {
        console.log("User not found")
        return errorResponse(
          {
            message: "User not found",
            code: "NOT_FOUND",
          },
          404,
        )
      }

      // For demo mode, return a mock agent
      if (userId === "demo") {
        console.log("Using demo mode for agent creation")
        const demoAgent = {
          id: "33333333-3333-3333-3333-333333333333",
          name: validatedBody.data.name,
          description: validatedBody.data.description,
          userId: "00000000-0000-0000-0000-000000000000",
          voice: validatedBody.data.voice,
          instructions: validatedBody.data.instructions,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return successResponse(demoAgent, "Agent created successfully", 201)
      }

      // Create the agent
      console.log("Creating agent with data:", validatedBody.data)
      const newAgent = await createAgent(userId, validatedBody.data)
      console.log("Agent created successfully:", newAgent)
      return successResponse(newAgent, "Agent created successfully", 201)
    } catch (error) {
      console.error("Error creating agent:", error)
      return errorResponse(
        {
          message: "Failed to create agent",
          code: "CREATE_FAILED",
          details: String(error),
        },
        500,
      )
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/users/[userId]/agents:", error)
    return errorResponse(
      {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
        details: String(error),
      },
      500,
    )
  }
}

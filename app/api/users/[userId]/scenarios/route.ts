import type { NextRequest } from "next/server"
import { validateParams, successResponse, errorResponse } from "@/lib/api-utils"
import { createScenarioSchema, userIdParam } from "@/lib/validation"
import { getScenariosByUserId, createScenario, getUserById } from "@/lib/db-utils"

/**
 * @swagger
 * /users/{userId}/scenarios:
 *   get:
 *     summary: Get all scenarios for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of scenarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scenario'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    console.log("GET /api/users/[userId]/scenarios - Request received", { userId: params.userId })

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

    // Check if user exists
    const user = await getUserById(userId)
    if (!user) {
      return errorResponse(
        {
          message: "User not found",
          code: "NOT_FOUND",
        },
        404,
      )
    }

    const userScenarios = await getScenariosByUserId(userId)
    return successResponse(userScenarios)
  } catch (error) {
    console.error("Error in GET /api/users/[userId]/scenarios:", error)
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

/**
 * @swagger
 * /users/{userId}/scenarios:
 *   post:
 *     summary: Create a new scenario
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
 *             $ref: '#/components/schemas/ScenarioCreate'
 *     responses:
 *       201:
 *         description: Scenario created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Scenario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    console.log("POST /api/users/[userId]/scenarios - Request received", { userId: params.userId })

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

    // Parse the request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", body)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return errorResponse(
        {
          message: "Invalid JSON in request body",
          code: "INVALID_JSON",
          details: String(error),
        },
        400,
      )
    }

    // Validate the request body against our schema
    try {
      const validatedData = createScenarioSchema.parse(body)
      console.log("Validated data:", validatedData)

      // Check if user exists
      const user = await getUserById(userId)
      if (!user && userId !== "demo") {
        return errorResponse(
          {
            message: "User not found",
            code: "NOT_FOUND",
          },
          404,
        )
      }

      // For demo mode, return a mock scenario
      if (userId === "demo") {
        console.log("Using demo mode for scenario creation")
        const demoScenario = {
          id: body.scenario_id || "33333333-3333-3333-3333-333333333333",
          name: body.name,
          description: body.description,
          userId: "00000000-0000-0000-0000-000000000000",
          root: body.root,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return successResponse(demoScenario, "Scenario created successfully", 201)
      }

      // Create the scenario
      console.log("Creating scenario with data:", validatedData)
      const newScenario = await createScenario(userId, validatedData)
      console.log("Scenario created successfully:", newScenario)
      return successResponse(newScenario, "Scenario created successfully", 201)
    } catch (error) {
      console.error("Validation error:", error)
      if (error.errors) {
        return errorResponse(
          {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          },
          400,
        )
      }
      return errorResponse(
        {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          details: String(error),
        },
        400,
      )
    }
  } catch (error) {
    console.error("Error in POST /api/users/[userId]/scenarios:", error)
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

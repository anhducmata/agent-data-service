import type { NextRequest } from "next/server"
import { validateRequest, validateParams, successResponse, errorResponse, notFoundResponse } from "@/lib/api-utils"
import { createConversationSchema, scenarioIdParam } from "@/lib/validation"
import { getConversationsByScenarioId, createConversation, getScenarioById } from "@/lib/db-utils"

/**
 * @swagger
 * /scenarios/{scenarioId}/conversations:
 *   get:
 *     summary: Get all conversations for a scenario
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function GET(req: NextRequest, { params }: { params: { scenarioId: string } }) {
  const validatedParams = validateParams(params, scenarioIdParam)
  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { scenarioId } = validatedParams.data

  // Check if scenario exists
  const scenario = await getScenarioById(scenarioId)
  if (!scenario) {
    return notFoundResponse("Scenario")
  }

  const scenarioConversations = await getConversationsByScenarioId(scenarioId)
  return successResponse(scenarioConversations)
}

/**
 * @swagger
 * /scenarios/{scenarioId}/conversations:
 *   post:
 *     summary: Create a new conversation
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversationCreate'
 *     responses:
 *       201:
 *         description: Conversation created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function POST(req: NextRequest, { params }: { params: { scenarioId: string } }) {
  const validatedParams = validateParams(params, scenarioIdParam)
  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { scenarioId } = validatedParams.data

  // Check if scenario exists
  const scenario = await getScenarioById(scenarioId)
  if (!scenario) {
    return notFoundResponse("Scenario")
  }

  const validatedBody = await validateRequest(req, createConversationSchema)
  if (!validatedBody.success) {
    return errorResponse(validatedBody.error)
  }

  const newConversation = await createConversation(scenarioId, validatedBody.data)
  return successResponse(newConversation, "Conversation created successfully", 201)
}

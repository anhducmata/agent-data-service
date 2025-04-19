import type { NextRequest } from "next/server"
import { validateRequest, validateParams, successResponse, errorResponse, notFoundResponse } from "@/lib/api-utils"
import { updateAgentSchema, userIdParam, agentIdParam } from "@/lib/validation"
import { getAgentById, updateAgent, deleteAgent } from "@/lib/db-utils"

/**
 * @swagger
 * /users/{userId}/agents/{agentId}:
 *   get:
 *     summary: Get a specific agent
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function GET(req: NextRequest, { params }: { params: { userId: string; agentId: string } }) {
  const validatedParams = validateParams(params, userIdParam.merge(agentIdParam))

  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { userId, agentId } = validatedParams.data

  const agent = await getAgentById(agentId)

  if (!agent || agent.userId !== userId) {
    return notFoundResponse("Agent")
  }

  return successResponse(agent)
}

/**
 * @swagger
 * /users/{userId}/agents/{agentId}:
 *   put:
 *     summary: Update a specific agent
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: agentId
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
 *       200:
 *         description: Agent updated
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function PUT(req: NextRequest, { params }: { params: { userId: string; agentId: string } }) {
  const validatedParams = validateParams(params, userIdParam.merge(agentIdParam))

  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { userId, agentId } = validatedParams.data

  // Verify agent exists and belongs to user
  const agent = await getAgentById(agentId)
  if (!agent || agent.userId !== userId) {
    return notFoundResponse("Agent")
  }

  const validatedBody = await validateRequest(req, updateAgentSchema)
  if (!validatedBody.success) {
    return errorResponse(validatedBody.error)
  }

  const updatedAgent = await updateAgent(agentId, validatedBody.data)
  if (!updatedAgent) {
    return notFoundResponse("Agent")
  }

  return successResponse(updatedAgent, "Agent updated successfully")
}

/**
 * @swagger
 * /users/{userId}/agents/{agentId}:
 *   delete:
 *     summary: Delete a specific agent
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function DELETE(req: NextRequest, { params }: { params: { userId: string; agentId: string } }) {
  const validatedParams = validateParams(params, userIdParam.merge(agentIdParam))

  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { userId, agentId } = validatedParams.data

  // Verify agent exists and belongs to user
  const agent = await getAgentById(agentId)
  if (!agent || agent.userId !== userId) {
    return notFoundResponse("Agent")
  }

  const deleted = await deleteAgent(agentId)
  if (!deleted) {
    return errorResponse(
      {
        message: "Failed to delete agent",
        code: "DELETE_FAILED",
      },
      500,
    )
  }

  return successResponse(null, "Agent deleted successfully")
}

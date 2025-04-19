import type { NextRequest } from "next/server"
import { validateRequest, validateParams, successResponse, errorResponse, notFoundResponse } from "@/lib/api-utils"
import { conversationIdParam } from "@/lib/validation"
import { getConversationById, addMessageToConversation } from "@/lib/db-utils"
import { z } from "zod"

// Message schema
const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  role: z.enum(["user", "agent"]),
  agentId: z.string().optional(),
})

/**
 * @swagger
 * /conversations/{conversationId}/messages:
 *   post:
 *     summary: Add a message to a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, agent]
 *               agentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message added
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
export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const validatedParams = validateParams(params, conversationIdParam)
  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { conversationId } = validatedParams.data

  const validatedBody = await validateRequest(req, messageSchema)
  if (!validatedBody.success) {
    return errorResponse(validatedBody.error)
  }

  const { content, role, agentId } = validatedBody.data

  const conversation = await getConversationById(conversationId)
  if (!conversation) {
    return notFoundResponse("Conversation")
  }

  const updatedConversation = await addMessageToConversation(conversationId, role, content, agentId)

  if (!updatedConversation) {
    return errorResponse(
      {
        message: "Failed to add message",
        code: "ADD_MESSAGE_FAILED",
      },
      500,
    )
  }

  return successResponse(updatedConversation, "Message added successfully", 201)
}

/**
 * @swagger
 * /conversations/{conversationId}/messages:
 *   get:
 *     summary: Get all messages in a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                       content:
 *                         type: string
 *                       agentId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const validatedParams = validateParams(params, conversationIdParam)
  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { conversationId } = validatedParams.data

  const conversation = await getConversationById(conversationId)
  if (!conversation) {
    return notFoundResponse("Conversation")
  }

  return successResponse(conversation.messages)
}

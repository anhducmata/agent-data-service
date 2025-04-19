import type { NextRequest } from "next/server"
import { validateParams, successResponse, errorResponse, notFoundResponse } from "@/lib/api-utils"
import { conversationIdParam } from "@/lib/validation"
import { getConversationById, deleteConversation } from "@/lib/db-utils"

/**
 * @swagger
 * /conversations/{conversationId}:
 *   get:
 *     summary: Get a specific conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
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

  return successResponse(conversation)
}

/**
 * @swagger
 * /conversations/{conversationId}:
 *   delete:
 *     summary: Delete a specific conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted
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
export async function DELETE(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const validatedParams = validateParams(params, conversationIdParam)
  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { conversationId } = validatedParams.data

  const conversation = await getConversationById(conversationId)
  if (!conversation) {
    return notFoundResponse("Conversation")
  }

  const deleted = await deleteConversation(conversationId)
  if (!deleted) {
    return errorResponse(
      {
        message: "Failed to delete conversation",
        code: "DELETE_FAILED",
      },
      500,
    )
  }

  return successResponse(null, "Conversation deleted successfully")
}

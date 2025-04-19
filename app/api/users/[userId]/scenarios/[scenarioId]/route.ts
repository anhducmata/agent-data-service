import type { NextRequest } from "next/server"
import { validateRequest, validateParams, successResponse, errorResponse, notFoundResponse } from "@/lib/api-utils"
import { updateScenarioSchema, userIdParam, scenarioIdParam } from "@/lib/validation"
import type { Scenario } from "@/lib/types"

// Mock database - using the same array from the scenarios route
declare const scenarios: Scenario[]

/**
 * @swagger
 * /users/{userId}/scenarios/{scenarioId}:
 *   get:
 *     summary: Get a specific scenario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scenario details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Scenario'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function GET(req: NextRequest, { params }: { params: { userId: string; scenarioId: string } }) {
  const validatedParams = validateParams(params, userIdParam.merge(scenarioIdParam))

  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { userId, scenarioId } = validatedParams.data

  const scenario = scenarios.find((s) => s.id === scenarioId && s.userId === userId)

  if (!scenario) {
    return notFoundResponse("Scenario")
  }

  return successResponse(scenario)
}

/**
 * @swagger
 * /users/{userId}/scenarios/{scenarioId}:
 *   put:
 *     summary: Update a specific scenario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *             $ref: '#/components/schemas/ScenarioCreate'
 *     responses:
 *       200:
 *         description: Scenario updated
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export async function PUT(req: NextRequest, { params }: { params: { userId: string; scenarioId: string } }) {
  const validatedParams = validateParams(params, userIdParam.merge(scenarioIdParam))

  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { userId, scenarioId } = validatedParams.data

  const validatedBody = await validateRequest(req, updateScenarioSchema)
  if (!validatedBody.success) {
    return errorResponse(validatedBody.error)
  }

  const scenarioIndex = scenarios.findIndex((s) => s.id === scenarioId && s.userId === userId)

  if (scenarioIndex === -1) {
    return notFoundResponse("Scenario")
  }

  const updatedScenario = {
    ...scenarios[scenarioIndex],
    ...validatedBody.data,
    updatedAt: new Date(),
  }

  scenarios[scenarioIndex] = updatedScenario

  return successResponse(updatedScenario, "Scenario updated successfully")
}

/**
 * @swagger
 * /users/{userId}/scenarios/{scenarioId}:
 *   delete:
 *     summary: Delete a specific scenario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scenario deleted
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
export async function DELETE(req: NextRequest, { params }: { params: { userId: string; scenarioId: string } }) {
  const validatedParams = validateParams(params, userIdParam.merge(scenarioIdParam))

  if (!validatedParams.success) {
    return errorResponse(validatedParams.error)
  }

  const { userId, scenarioId } = validatedParams.data

  const scenarioIndex = scenarios.findIndex((s) => s.id === scenarioId && s.userId === userId)

  if (scenarioIndex === -1) {
    return notFoundResponse("Scenario")
  }

  scenarios.splice(scenarioIndex, 1)

  return successResponse(null, "Scenario deleted successfully")
}

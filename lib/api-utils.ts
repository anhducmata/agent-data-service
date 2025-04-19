import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export interface ErrorResponse {
  message: string
  code: string
  details?: string
}

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
): Promise<{ success: true; data: T } | { success: false; error: ErrorResponse }> {
  try {
    // First try to parse the request body
    let body
    try {
      body = await req.json()

      // In production, don't log the entire request body
      if (process.env.NODE_ENV === "development") {
        console.log("Request body:", body)
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return {
        success: false,
        error: {
          message: "Invalid JSON in request body",
          code: "INVALID_JSON",
          details: process.env.NODE_ENV === "development" ? String(parseError) : undefined,
        },
      }
    }

    // Then validate against the schema
    try {
      const data = schema.parse(body)
      return { success: true, data }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error("Validation error:", validationError.errors)
        return {
          success: false,
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: validationError.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", "),
          },
        }
      }
      throw validationError // Re-throw unexpected errors
    }
  } catch (error) {
    console.error("Unexpected error in validateRequest:", error)
    return {
      success: false,
      error: {
        message: "Invalid request",
        code: "INVALID_REQUEST",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
    }
  }
}

export function validateParams<T>(
  params: any,
  schema: z.ZodType<T>,
): { success: true; data: T } | { success: false; error: ErrorResponse } {
  try {
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", "),
        },
      }
    }
    return {
      success: false,
      error: {
        message: "Validation error",
        code: "VALIDATION_ERROR",
      },
    }
  }
}

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json(
    { data, message },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

export function errorResponse(error: ErrorResponse, status = 400): NextResponse {
  // In production, don't include detailed error information
  if (process.env.NODE_ENV !== "development" && error.details) {
    const { details, ...errorWithoutDetails } = error
    return NextResponse.json(errorWithoutDetails, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  return NextResponse.json(error, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export function notFoundResponse(resourceName: string): NextResponse {
  return errorResponse(
    {
      message: `${resourceName} not found`,
      code: "NOT_FOUND",
    },
    404,
  )
}

export function unauthorizedResponse(): NextResponse {
  return errorResponse(
    {
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    },
    401,
  )
}

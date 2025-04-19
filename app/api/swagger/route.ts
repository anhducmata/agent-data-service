import { NextResponse } from "next/server"
import { getApiDocs } from "@/lib/swagger"

export async function GET() {
  try {
    const spec = getApiDocs()
    return NextResponse.json(spec, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Error in Swagger endpoint:", error)
    return NextResponse.json(
      {
        openapi: "3.0.0",
        info: {
          title: "Dashboard Management API",
          version: "1.0.0",
          description: "API for managing agents, scenarios, and conversations",
        },
        paths: {},
      },
      {
        status: 200, // Return 200 with a minimal valid spec
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  }
}

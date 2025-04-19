import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW()`

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: result[0].now,
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: process.env.NODE_ENV === "development" ? String(error) : "See server logs",
      },
      { status: 500 },
    )
  }
}

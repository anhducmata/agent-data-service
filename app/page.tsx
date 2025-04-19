import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Dashboard Management API</h1>
        <p className="text-gray-600 mb-4">
          Welcome to the Dashboard Management API. This API provides endpoints for managing agents, scenarios, and
          conversations.
        </p>
        <div className="flex justify-center">
          <Link
            href="/swagger"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View API Documentation
          </Link>
        </div>
      </div>
    </div>
  )
}

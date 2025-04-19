"use client"

import { useEffect } from "react"

// Define a minimal OpenAPI spec directly in the component
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Dashboard Management API",
    version: "1.0.0",
    description: "API for managing agents, scenarios, and conversations",
  },
  servers: [
    {
      url: "/api",
    },
  ],
  tags: [
    {
      name: "Agents",
      description: "Operations related to agents",
    },
    {
      name: "Scenarios",
      description: "Operations related to scenarios",
    },
    {
      name: "Conversations",
      description: "Operations related to conversations",
    },
  ],
  paths: {
    "/users/{userId}/agents": {
      get: {
        summary: "Get all agents for a user",
        tags: ["Agents"],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "List of agents",
          },
        },
      },
      post: {
        summary: "Create a new agent",
        tags: ["Agents"],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  voice: { type: "string" },
                  instructions: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Agent created",
          },
        },
      },
    },
    "/users/{userId}/agents/{agentId}": {
      get: {
        summary: "Get a specific agent",
        tags: ["Agents"],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            in: "path",
            name: "agentId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Agent details",
          },
        },
      },
      put: {
        summary: "Update a specific agent",
        tags: ["Agents"],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            in: "path",
            name: "agentId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  voice: { type: "string" },
                  instructions: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Agent updated",
          },
        },
      },
      delete: {
        summary: "Delete a specific agent",
        tags: ["Agents"],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            in: "path",
            name: "agentId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Agent deleted",
          },
        },
      },
    },
    // Add more paths as needed
  },
}

export default function SwaggerPage() {
  useEffect(() => {
    // Initialize Swagger UI with the embedded spec
    if (typeof window !== "undefined" && window.SwaggerUIBundle) {
      window.SwaggerUIBundle({
        spec: openApiSpec,
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: "BaseLayout",
      })
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Management API Documentation</h1>
      <div id="swagger-ui" />
    </div>
  )
}

"use client"

import { useEffect } from "react"
import Script from "next/script"

// Define a minimal OpenAPI spec
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
        operationId: "getUserAgents",
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
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          userId: { type: "string" },
                          voice: { type: "string" },
                          instructions: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "User not found",
          },
        },
      },
      post: {
        operationId: "createUserAgent",
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
          400: {
            description: "Invalid request",
          },
          404: {
            description: "User not found",
          },
        },
      },
    },
    "/users/{userId}/agents/{agentId}": {
      get: {
        operationId: "getUserAgent",
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
          404: {
            description: "Agent not found",
          },
        },
      },
      put: {
        operationId: "updateUserAgent",
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
          400: {
            description: "Invalid request",
          },
          404: {
            description: "Agent not found",
          },
        },
      },
      delete: {
        operationId: "deleteUserAgent",
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
          404: {
            description: "Agent not found",
          },
        },
      },
    },
    "/users/{userId}/scenarios": {
      get: {
        operationId: "getUserScenarios",
        summary: "Get all scenarios for a user",
        tags: ["Scenarios"],
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
            description: "List of scenarios",
          },
          404: {
            description: "User not found",
          },
        },
      },
      post: {
        operationId: "createUserScenario",
        summary: "Create a new scenario",
        tags: ["Scenarios"],
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
                required: ["name", "root"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  root: {
                    type: "object",
                    properties: {
                      agent_id: { type: "string" },
                      position: {
                        type: "object",
                        properties: {
                          x: { type: "number" },
                          y: { type: "number" },
                        },
                      },
                      tools: {
                        type: "array",
                        items: {
                          type: "object",
                        },
                      },
                      handoffs: {
                        type: "array",
                        items: {
                          type: "object",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Scenario created",
          },
          400: {
            description: "Invalid request",
          },
          404: {
            description: "User not found",
          },
        },
      },
    },
    "/scenarios/{scenarioId}/conversations": {
      get: {
        operationId: "getScenarioConversations",
        summary: "Get all conversations for a scenario",
        tags: ["Conversations"],
        parameters: [
          {
            in: "path",
            name: "scenarioId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "List of conversations",
          },
          404: {
            description: "Scenario not found",
          },
        },
      },
      post: {
        operationId: "createScenarioConversation",
        summary: "Create a new conversation",
        tags: ["Conversations"],
        parameters: [
          {
            in: "path",
            name: "scenarioId",
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
                  title: { type: "string" },
                  initialMessage: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Conversation created",
          },
          400: {
            description: "Invalid request",
          },
          404: {
            description: "Scenario not found",
          },
        },
      },
    },
    "/conversations/{conversationId}/messages": {
      get: {
        operationId: "getConversationMessages",
        summary: "Get all messages in a conversation",
        tags: ["Conversations"],
        parameters: [
          {
            in: "path",
            name: "conversationId",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "List of messages",
          },
          404: {
            description: "Conversation not found",
          },
        },
      },
      post: {
        operationId: "addConversationMessage",
        summary: "Add a message to a conversation",
        tags: ["Conversations"],
        parameters: [
          {
            in: "path",
            name: "conversationId",
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
                required: ["content", "role"],
                properties: {
                  content: { type: "string" },
                  role: { type: "string", enum: ["user", "agent"] },
                  agentId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Message added",
          },
          400: {
            description: "Invalid request",
          },
          404: {
            description: "Conversation not found",
          },
        },
      },
    },
  },
}

export default function SwaggerPage() {
  useEffect(() => {
    // Initialize Swagger UI after the scripts are loaded
    const initSwagger = () => {
      if (window.SwaggerUIBundle) {
        window.SwaggerUIBundle({
          spec: openApiSpec,
          dom_id: "#swagger-ui",
          deepLinking: false,
          docExpansion: "list",
          filter: true,
          operationsSorter: "alpha",
          tagsSorter: "alpha",
          // Use BaseLayout instead of StandaloneLayout
          layout: "BaseLayout",
          displayOperationId: true,
        })
      }
    }

    // Check if SwaggerUIBundle is already loaded
    if (window.SwaggerUIBundle) {
      initSwagger()
    } else {
      // If not loaded yet, set up an event listener for when the script loads
      window.addEventListener("SwaggerUIBundleLoaded", initSwagger)
    }

    // Cleanup
    return () => {
      window.removeEventListener("SwaggerUIBundleLoaded", initSwagger)
    }
  }, [])

  return (
    <>
      <Script
        src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"
        onLoad={() => {
          window.dispatchEvent(new Event("SwaggerUIBundleLoaded"))
        }}
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard Management API Documentation</h1>
        <div id="swagger-ui" />
      </div>
    </>
  )
}

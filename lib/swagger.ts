import { createSwaggerSpec } from "next-swagger-doc"

export function getApiDocs() {
  try {
    const spec = createSwaggerSpec({
      apiFolder: "app/api", // This might be the issue - Next.js App Router structure
      definition: {
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
        components: {
          schemas: {
            Agent: {
              type: "object",
              required: ["id", "name", "userId"],
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
            AgentCreate: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                voice: { type: "string" },
                instructions: { type: "string" },
              },
            },
            Position: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
              },
            },
            Tool: {
              type: "object",
              properties: {
                tool_id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                position: { $ref: "#/components/schemas/Position" },
              },
            },
            Handoff: {
              type: "object",
              properties: {
                handoff_description: { type: "string" },
                agent_id: { type: "string" },
                position: { $ref: "#/components/schemas/Position" },
                tools: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Tool" },
                },
                handoffs: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Handoff" },
                },
              },
            },
            ScenarioNode: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                position: { $ref: "#/components/schemas/Position" },
                tools: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Tool" },
                },
                handoffs: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Handoff" },
                },
              },
            },
            Scenario: {
              type: "object",
              required: ["id", "name", "userId"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                userId: { type: "string" },
                root: { $ref: "#/components/schemas/ScenarioNode" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
            ScenarioCreate: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                root: { $ref: "#/components/schemas/ScenarioNode" },
              },
            },
            Conversation: {
              type: "object",
              required: ["id", "scenarioId"],
              properties: {
                id: { type: "string" },
                scenarioId: { type: "string" },
                title: { type: "string" },
                messages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      role: { type: "string", enum: ["user", "agent"] },
                      content: { type: "string" },
                      agentId: { type: "string" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
            ConversationCreate: {
              type: "object",
              properties: {
                title: { type: "string" },
                initialMessage: { type: "string" },
              },
            },
            Error: {
              type: "object",
              properties: {
                message: { type: "string" },
                code: { type: "string" },
              },
            },
          },
          responses: {
            BadRequest: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            NotFound: {
              description: "Resource not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            Unauthorized: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
    })
    return spec
  } catch (error) {
    console.error("Error generating Swagger spec:", error)
    // Return a minimal valid OpenAPI spec if there's an error
    return {
      openapi: "3.0.0",
      info: {
        title: "Dashboard Management API",
        version: "1.0.0",
        description: "API for managing agents, scenarios, and conversations",
      },
      paths: {},
    }
  }
}

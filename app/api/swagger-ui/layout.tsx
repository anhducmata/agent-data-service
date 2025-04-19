import type React from "react"

export default function SwaggerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" defer></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  )
}

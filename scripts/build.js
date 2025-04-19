const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Ensure the .next directory exists
const nextDir = path.join(__dirname, "..", ".next")
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true })
}

// Run the Next.js build
try {
  console.log("Building Next.js application...")
  execSync("next build", { stdio: "inherit" })
  console.log("Build completed successfully!")
} catch (error) {
  console.error("Build failed:", error)
  process.exit(1)
}

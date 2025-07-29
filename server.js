require("dotenv").config() // This MUST be at the very top

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

// Import the setSlackConfig function
const { setSlackConfig } = require("./config/slack")

// Initialize Slack configuration immediately after dotenv loads
setSlackConfig(process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET, process.env.SLACK_REDIRECT_URI)

// Import routes (these will now get the initialized config)
const authRoutes = require("./routes/auth")
const messageRoutes = require("./routes/messages")

// Import middleware
const errorHandler = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Slack API Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Slack API Backend running on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`)
  console.log(`💬 Message endpoints: http://localhost:${PORT}/api/messages`)
})

module.exports = app

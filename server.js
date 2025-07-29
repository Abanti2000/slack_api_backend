require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")


const { setSlackConfig } = require("./config/slack")

setSlackConfig(process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET, process.env.SLACK_REDIRECT_URI)

const authRoutes = require("./routes/auth")
const messageRoutes = require("./routes/messages")

const errorHandler = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Slack API Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})


app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)


app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})


app.use(errorHandler)


process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🚀 Slack API Backend running on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`)
  console.log(`💬 Message endpoints: http://localhost:${PORT}/api/messages`)
})

module.exports = app

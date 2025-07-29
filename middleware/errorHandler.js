const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  })

  let error = {
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  }

  if (err.name === "ValidationError") {
    error = {
      success: false,
      error: "VALIDATION_ERROR",
      message: err.message,
    }
    return res.status(400).json(error)
  }

  if (err.name === "CastError") {
    error = {
      success: false,
      error: "INVALID_ID",
      message: "Invalid ID format",
    }
    return res.status(400).json(error)
  }

  if (err.code === 11000) {
    error = {
      success: false,
      error: "DUPLICATE_ENTRY",
      message: "Duplicate entry found",
    }
    return res.status(409).json(error)
  }

  if (err.response) {
    error = {
      success: false,
      error: "SLACK_API_ERROR",
      message: err.response.data?.error || "Slack API request failed",
    }
    return res.status(err.response.status || 400).json(error)
  }

  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    error = {
      success: false,
      error: "NETWORK_ERROR",
      message: "Unable to connect to Slack API",
    }
    return res.status(503).json(error)
  }

  if (err.code === "ECONNABORTED") {
    error = {
      success: false,
      error: "TIMEOUT_ERROR",
      message: "Request timeout",
    }
    return res.status(408).json(error)
  }

  if (err.name === "JsonWebTokenError") {
    error = {
      success: false,
      error: "INVALID_TOKEN",
      message: "Invalid token",
    }
    return res.status(401).json(error)
  }

  if (err.name === "TokenExpiredError") {
    error = {
      success: false,
      error: "TOKEN_EXPIRED",
      message: "Token has expired",
    }
    return res.status(401).json(error)
  }

  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack
    error.details = err
  }

  res.status(500).json(error)
}

module.exports = errorHandler

const slackService = require("../services/slackService")

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "MISSING_AUTHORIZATION",
        message: "Authorization header is required",
      })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "MISSING_TOKEN",
        message: "Bearer token is required",
      })
    }

    const userInfo = await slackService.verifyToken(token)

    req.user = userInfo
    req.accessToken = token

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "AUTHENTICATION_FAILED",
      message: error.message,
    })
  }
}

module.exports = authMiddleware

const express = require("express")
const crypto = require("crypto")
const slackService = require("../services/slackService")
const { getSlackConfig } = require("../config/slack")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

router.get("/oauth-url", (req, res) => {
  try {
    const slackConfig = getSlackConfig()
    slackConfig.validate()

    const state = crypto.randomBytes(32).toString("hex")

    const oauthUrl = slackConfig.getOAuthUrl(state)

    res.json({
      success: true,
      data: {
        oauthUrl,
        state,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "OAUTH_URL_GENERATION_FAILED",
      message: error.message,
    })
  }
})

router.get("/callback", async (req, res) => {
  try {
    const slackConfig = getSlackConfig()
    const { code, state, error } = req.query

    if (error) {
      return res.status(400).json({
        success: false,
        error: "OAUTH_ERROR",
        message: `OAuth failed: ${error}`,
      })
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "MISSING_CODE",
        message: "Authorization code is required",
      })
    }

    const tokenData = await slackService.exchangeCodeForToken(code, state)

    const userInfo = await slackService.getUserInfo(tokenData.accessToken, tokenData.authedUser.id)

    res.json({
      success: true,
      data: {
        accessToken: tokenData.accessToken,
        tokenType: tokenData.tokenType,
        scope: tokenData.scope,
        team: tokenData.team,
        user: {
          id: userInfo.id,
          name: userInfo.name,
          realName: userInfo.real_name,
          email: userInfo.profile?.email,
          image: userInfo.profile?.image_192,
        },
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "OAUTH_CALLBACK_FAILED",
      message: error.message,
    })
  }
})

router.post("/verify", async (req, res) => {
  try {
    const { accessToken } = req.body

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "MISSING_TOKEN",
        message: "Access token is required",
      })
    }

    const tokenInfo = await slackService.verifyToken(accessToken)

    res.json({
      success: true,
      data: tokenInfo,
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "TOKEN_VERIFICATION_FAILED",
      message: error.message,
    })
  }
})

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userInfo = await slackService.getUserInfo(req.accessToken, req.user.userId)

    res.json({
      success: true,
      data: {
        id: userInfo.id,
        name: userInfo.name,
        realName: userInfo.real_name,
        email: userInfo.profile?.email,
        image: userInfo.profile?.image_192,
        timezone: userInfo.tz,
        status: userInfo.profile?.status_text,
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "GET_USER_INFO_FAILED",
      message: error.message,
    })
  }
})

router.post("/logout", authMiddleware, (req, res) => {

  res.json({
    success: true,
    message: "Logged out successfully",
  })
})

module.exports = router

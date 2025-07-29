const express = require("express")
const Joi = require("joi")
const slackService = require("../services/slackService")
const authMiddleware = require("../middleware/auth")

const router = express.Router()


router.use(authMiddleware)


const sendMessageSchema = Joi.object({
  channel: Joi.string().required(),
  text: Joi.string().required(),
  blocks: Joi.array().optional(),
  attachments: Joi.array().optional(),
  threadTs: Joi.string().optional(),
})

const scheduleMessageSchema = Joi.object({
  channel: Joi.string().required(),
  text: Joi.string().required(),
  scheduleTime: Joi.string().isoDate().required(),
  blocks: Joi.array().optional(),
  attachments: Joi.array().optional(),
})

const editMessageSchema = Joi.object({
  channel: Joi.string().required(),
  timestamp: Joi.string().required(),
  text: Joi.string().required(),
  blocks: Joi.array().optional(),
  attachments: Joi.array().optional(),
})

router.post("/send", async (req, res) => {
  try {
    const { error, value } = sendMessageSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: error.details[0].message,
      })
    }

    const result = await slackService.sendMessage(req.accessToken, value)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "SEND_MESSAGE_FAILED",
      message: error.message,
    })
  }
})

router.post("/schedule", async (req, res) => {
  try {
    const { error, value } = scheduleMessageSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: error.details[0].message,
      })
    }

    const scheduleDate = new Date(value.scheduleTime)
    if (scheduleDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "INVALID_SCHEDULE_TIME",
        message: "Schedule time must be in the future",
      })
    }

    const result = await slackService.scheduleMessage(req.accessToken, value)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "SCHEDULE_MESSAGE_FAILED",
      message: error.message,
    })
  }
})

router.get("/retrieve/:channel", async (req, res) => {
  try {
    const { channel } = req.params
    const { latest, oldest, limit } = req.query

    const result = await slackService.getMessages(req.accessToken, {
      channel,
      latest,
      oldest,
      limit: limit ? Number.parseInt(limit) : 100,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "RETRIEVE_MESSAGES_FAILED",
      message: error.message,
    })
  }
})

router.get("/retrieve/:channel/:timestamp", async (req, res) => {
  try {
    const { channel, timestamp } = req.params

    const result = await slackService.getMessages(req.accessToken, {
      channel,
      latest: timestamp,
      oldest: timestamp,
      limit: 1,
    })

    if (result.messages.length === 0) {
      return res.status(404).json({
        success: false,
        error: "MESSAGE_NOT_FOUND",
        message: "Message not found",
      })
    }

    res.json({
      success: true,
      data: {
        message: result.messages[0],
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "RETRIEVE_MESSAGE_FAILED",
      message: error.message,
    })
  }
})

router.put("/edit", async (req, res) => {
  try {
    const { error, value } = editMessageSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: error.details[0].message,
      })
    }

    const result = await slackService.updateMessage(req.accessToken, value)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "EDIT_MESSAGE_FAILED",
      message: error.message,
    })
  }
})

router.delete("/delete/:channel/:timestamp", async (req, res) => {
  try {
    const { channel, timestamp } = req.params

    const result = await slackService.deleteMessage(req.accessToken, {
      channel,
      timestamp,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "DELETE_MESSAGE_FAILED",
      message: error.message,
    })
  }
})

router.get("/channels", async (req, res) => {
  try {
    const { types, limit } = req.query

    const result = await slackService.getChannels(req.accessToken, {
      types,
      limit: limit ? Number.parseInt(limit) : 100,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "GET_CHANNELS_FAILED",
      message: error.message,
    })
  }
})

router.get("/permalink/:channel/:timestamp", async (req, res) => {
  try {
    const { channel, timestamp } = req.params

    const result = await slackService.getMessagePermalink(req.accessToken, {
      channel,
      messageTs: timestamp,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "GET_PERMALINK_FAILED",
      message: error.message,
    })
  }
})

module.exports = router

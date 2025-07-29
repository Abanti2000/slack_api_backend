const axios = require("axios")
const { getSlackConfig } = require("../config/slack")

class SlackService {
  constructor() {
    this.baseURL = "https://slack.com/api"
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }


  async exchangeCodeForToken(code, state) {
    const slackConfig = getSlackConfig()
    try {
      const response = await this.axiosInstance.post(
        "/oauth.v2.access",
        {
          client_id: slackConfig.clientId,
          client_secret: slackConfig.clientSecret,
          code: code,
          redirect_uri: slackConfig.redirectUri,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      if (!response.data.ok) {
        throw new Error(response.data.error || "OAuth exchange failed")
      }

      return {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        botUserId: response.data.bot_user_id,
        appId: response.data.app_id,
        team: response.data.team,
        enterprise: response.data.enterprise,
        authedUser: response.data.authed_user,
      }
    } catch (error) {
      throw new Error(`OAuth token exchange failed: ${error.message}`)
    }
  }

  async verifyToken(accessToken) {
    try {
      const response = await this.axiosInstance.post(
        "/auth.test",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (!response.data.ok) {
        throw new Error(response.data.error || "Token verification failed")
      }

      return {
        userId: response.data.user_id,
        user: response.data.user,
        teamId: response.data.team_id,
        team: response.data.team,
        url: response.data.url,
        botId: response.data.bot_id,
      }
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`)
    }
  }

  async getUserInfo(accessToken, userId) {
    try {
      const response = await this.axiosInstance.get("/users.info", {
        params: { user: userId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to get user info")
      }

      return response.data.user
    } catch (error) {
      throw new Error(`Get user info failed: ${error.message}`)
    }
  }

  async sendMessage(accessToken, { channel, text, blocks, attachments, threadTs }) {
    try {
      const payload = {
        channel,
        text,
        ...(blocks && { blocks }),
        ...(attachments && { attachments }),
        ...(threadTs && { thread_ts: threadTs }),
      }

      const response = await this.axiosInstance.post("/chat.postMessage", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to send message")
      }

      return {
        channel: response.data.channel,
        timestamp: response.data.ts,
        message: response.data.message,
      }
    } catch (error) {
      throw new Error(`Send message failed: ${error.message}`)
    }
  }

  async scheduleMessage(accessToken, { channel, text, scheduleTime, blocks, attachments }) {
    try {
      const postAt = Math.floor(new Date(scheduleTime).getTime() / 1000)

      const payload = {
        channel,
        text,
        post_at: postAt,
        ...(blocks && { blocks }),
        ...(attachments && { attachments }),
      }

      const response = await this.axiosInstance.post("/chat.scheduleMessage", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to schedule message")
      }

      return {
        channel: response.data.channel,
        scheduledMessageId: response.data.scheduled_message_id,
        postAt: response.data.post_at,
      }
    } catch (error) {
      throw new Error(`Schedule message failed: ${error.message}`)
    }
  }

  async updateMessage(accessToken, { channel, timestamp, text, blocks, attachments }) {
    try {
      const payload = {
        channel,
        ts: timestamp,
        text,
        ...(blocks && { blocks }),
        ...(attachments && { attachments }),
      }

      const response = await this.axiosInstance.post("/chat.update", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to update message")
      }

      return {
        channel: response.data.channel,
        timestamp: response.data.ts,
        text: response.data.text,
      }
    } catch (error) {
      throw new Error(`Update message failed: ${error.message}`)
    }
  }

  async deleteMessage(accessToken, { channel, timestamp }) {
    try {
      const response = await this.axiosInstance.post(
        "/chat.delete",
        {
          channel,
          ts: timestamp,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to delete message")
      }

      return {
        channel: response.data.channel,
        timestamp: response.data.ts,
      }
    } catch (error) {
      throw new Error(`Delete message failed: ${error.message}`)
    }
  }

  async getMessages(accessToken, { channel, latest, oldest, limit = 100 }) {
    try {
      const params = {
        channel,
        limit,
        ...(latest && { latest }),
        ...(oldest && { oldest }),
      }

      const response = await this.axiosInstance.get("/conversations.history", {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to get messages")
      }

      return {
        messages: response.data.messages,
        hasMore: response.data.has_more,
        responseMetadata: response.data.response_metadata,
      }
    } catch (error) {
      throw new Error(`Get messages failed: ${error.message}`)
    }
  }

  async getChannels(accessToken, { types = "public_channel,private_channel", limit = 100 }) {
    try {
      const response = await this.axiosInstance.get("/conversations.list", {
        params: {
          types,
          limit,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to get channels")
      }

      return {
        channels: response.data.channels,
        responseMetadata: response.data.response_metadata,
      }
    } catch (error) {
      throw new Error(`Get channels failed: ${error.message}`)
    }
  }

  async getMessagePermalink(accessToken, { channel, messageTs }) {
    try {
      const response = await this.axiosInstance.get("/chat.getPermalink", {
        params: {
          channel,
          message_ts: messageTs,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.data.ok) {
        throw new Error(response.data.error || "Failed to get permalink")
      }

      return {
        permalink: response.data.permalink,
      }
    } catch (error) {
      throw new Error(`Get permalink failed: ${error.message}`)
    }
  }
}

module.exports = new SlackService()

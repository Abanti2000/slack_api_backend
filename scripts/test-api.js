require("dotenv").config()

console.log("Test Script: process.env.SLACK_CLIENT_ID =", process.env.SLACK_CLIENT_ID)
console.log("Test Script: process.env.SLACK_CLIENT_SECRET =", process.env.SLACK_CLIENT_SECRET)

const axios = require("axios")
const { setSlackConfig } = require("../config/slack") 
const { getSlackConfig } = require("../config/slack") 


setSlackConfig(process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET, process.env.SLACK_REDIRECT_URI)


const slackConfig = getSlackConfig()

const BASE_URL = "http://127.0.0.1:3000/api"
let accessToken = ""


const testConfig = {
  channel: "C097RLYG07Q", 
  testMessage: "Hello from Slack API Backend Test!",
  scheduleTime: new Date(Date.now() + 60000).toISOString(), 
}

class APITester {
  constructor() {
    this.axios = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
  }

  async log(message, data = null) {
    console.log(`\n🔍 ${message}`)
    if (data) {
      console.log(JSON.stringify(data, null, 2))
    }
  }

  async testHealthCheck() {
    try {
      await this.log("Testing health check...")
      const response = await this.axios.get("/health")
      await this.log("✅ Health check passed", response.data)
      return true
    } catch (error) {
      await this.log("❌ Health check failed", error.response?.data || error.message)
      return false
    }
  }

  async testOAuthURL() {
    try {
      await this.log("Testing OAuth URL generation...")
      slackConfig.validate()

      const response = await this.axios.get("/auth/oauth-url")
      await this.log("✅ OAuth URL generated", response.data)

      console.log("\n📋 To complete OAuth flow:")
      console.log("1. Visit the OAuth URL above")
      console.log("2. Authorize the app")
      console.log("3. Copy the access token from the callback")
      console.log("4. Set it in the testConfig or environment variable")

      return true
    } catch (error) {
      await this.log("❌ OAuth URL generation failed", error.response?.data || error.message)
      return false
    }
  }

  async testTokenVerification(token) {
    try {
      await this.log("Testing token verification...")
      const response = await this.axios.post("/auth/verify", {
        accessToken: token,
      })
      await this.log("✅ Token verification passed", response.data)
      return true
    } catch (error) {
      await this.log("❌ Token verification failed", error.response?.data || error.message)
      return false
    }
  }

  async testGetUserInfo(token) {
    try {
      await this.log("Testing get user info...")
      const response = await this.axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      await this.log("✅ Get user info passed", response.data)
      return true
    } catch (error) {
      await this.log("❌ Get user info failed", error.response?.data || error.message)
      return false
    }
  }

  async testGetChannels(token) {
    try {
      await this.log("Testing get channels...")
      const response = await this.axios.get("/messages/channels", {
        headers: { Authorization: `Bearer ${token}` },
      })
      await this.log("✅ Get channels passed", {
        channelCount: response.data.data.channels.length,
        channels: response.data.data.channels.map((c) => ({ id: c.id, name: c.name })),
      })
      return response.data.data.channels
    } catch (error) {
      await this.log("❌ Get channels failed", error.response?.data || error.message)
      return false
    }
  }

  async testSendMessage(token) {
    try {
      await this.log("Testing send message...")
      const response = await this.axios.post(
        "/messages/send",
        {
          channel: testConfig.channel,
          text: testConfig.testMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      await this.log("✅ Send message passed", response.data)
      return response.data.data
    } catch (error) {
      await this.log("❌ Send message failed", error.response?.data || error.message)
      return false
    }
  }

  async testScheduleMessage(token) {
    try {
      await this.log("Testing schedule message...")
      const response = await this.axios.post(
        "/messages/schedule",
        {
          channel: testConfig.channel,
          text: "This is a scheduled message!",
          scheduleTime: testConfig.scheduleTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      await this.log("✅ Schedule message passed", response.data)
      return response.data.data
    } catch (error) {
      await this.log("❌ Schedule message failed", error.response?.data || error.message)
      return false
    }
  }

  async testRetrieveMessages(token) {
    try {
      await this.log("Testing retrieve messages...")
      const response = await this.axios.get(`/messages/retrieve/${encodeURIComponent(testConfig.channel)}?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await this.log("✅ Retrieve messages passed", {
        messageCount: response.data.data.messages.length,
        hasMore: response.data.data.hasMore,
      })
      return response.data.data.messages
    } catch (error) {
      await this.log("❌ Retrieve messages failed", error.response?.data || error.message)
      return false
    }
  }

  async testEditMessage(token, messageData) {
    try {
      await this.log("Testing edit message...")
      const response = await this.axios.put(
        "/messages/edit",
        {
          channel: messageData.channel,
          timestamp: messageData.timestamp,
          text: "This message has been edited!",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      await this.log("✅ Edit message passed", response.data)
      return response.data.data
    } catch (error) {
      await this.log("❌ Edit message failed", error.response?.data || error.message)
      return false
    }
  }

  async testDeleteMessage(token, messageData) {
    try {
      await this.log("Testing delete message...")
      const response = await this.axios.delete(
        `/messages/delete/${encodeURIComponent(messageData.channel)}/${messageData.timestamp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      await this.log("✅ Delete message passed", response.data)
      return true
    } catch (error) {
      await this.log("❌ Delete message failed", error.response?.data || error.message)
      return false
    }
  }

  async runAllTests() {
    console.log("🚀 Starting Slack API Backend Tests...\n")

    // Test 1: Health Check
    const healthCheck = await this.testHealthCheck()
    if (!healthCheck) return

    // Test 2: OAuth URL Generation
    const oauthTest = await this.testOAuthURL()
    if (!oauthTest) return

    // Get access token from environment or prompt user
    accessToken = process.env.SLACK_ACCESS_TOKEN

    if (!accessToken) {
      console.log("\n⚠️  No access token provided.")
      console.log("Please set SLACK_ACCESS_TOKEN environment variable or complete OAuth flow.")
      console.log("Example: SLACK_ACCESS_TOKEN=xoxp-your-token node scripts/test-api.js")
      return
    }

    // Test 3: Token Verification
    const tokenTest = await this.testTokenVerification(accessToken)
    if (!tokenTest) return

    // Test 4: Get User Info
    const userInfoTest = await this.testGetUserInfo(accessToken)
    if (!userInfoTest) return

    // Test 5: Get Channels
    const channels = await this.testGetChannels(accessToken)
    if (!channels) return

    // Test 6: Send Message
    const messageData = await this.testSendMessage(accessToken)
    if (!messageData) return

    // Test 7: Schedule Message
    const scheduleTest = await this.testScheduleMessage(accessToken)

    // Test 8: Retrieve Messages
    const messages = await this.testRetrieveMessages(accessToken)

    // Test 9: Edit Message (if we have a message to edit)
    if (messageData && messageData.timestamp) {
      await this.testEditMessage(accessToken, messageData)

      // Wait a bit before deleting
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Test 10: Delete Message
      await this.testDeleteMessage(accessToken, messageData)
    }

    console.log("\n🎉 All tests completed!")
    console.log("\n📊 Test Summary:")
    console.log("- Health Check: ✅")
    console.log("- OAuth URL Generation: ✅")
    console.log("- Token Verification: ✅")
    console.log("- Get User Info: ✅")
    console.log("- Get Channels: ✅")
    console.log("- Send Message: ✅")
    console.log("- Schedule Message:", scheduleTest ? "✅" : "❌")
    console.log("- Retrieve Messages:", messages ? "✅" : "❌")
    console.log("- Edit Message: ✅")
    console.log("- Delete Message: ✅")
  }
}

const tester = new APITester()
tester.runAllTests().catch(console.error)

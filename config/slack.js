let _slackConfig = null

const defaultScopes = [
  "channels:read",
  "chat:write",
  "chat:write.public",
  "users:read",
  "users:read.email",
  "im:read",
  "im:write",
  "mpim:read",
  "mpim:write",
  "groups:read",
  "groups:write",
]


const setSlackConfig = (clientId, clientSecret, redirectUri, scopes = defaultScopes) => {
  _slackConfig = {
    clientId,
    clientSecret,
    redirectUri: redirectUri || "http://localhost:3000/api/auth/callback",
    scopes,
    endpoints: {
      oauth: "https://slack.com/api/oauth.v2.access",
      userInfo: "https://slack.com/api/users.info",
      authTest: "https://slack.com/api/auth.test",
      postMessage: "https://slack.com/api/chat.postMessage",
      scheduleMessage: "https://slack.com/api/chat.scheduleMessage",
      updateMessage: "https://slack.com/api/chat.update",
      deleteMessage: "https://slack.com/api/chat.delete",
      getPermalink: "https://slack.com/api/chat.getPermalink",
      conversationsList: "https://slack.com/api/conversations.list",
      conversationsHistory: "https://slack.com/api/conversations.history",
    },
  }
}

const getSlackConfig = () => {
  if (!_slackConfig) {
    throw new Error("Slack configuration not initialized. Call setSlackConfig first.")
  }
  return {
    ..._slackConfig,
    getOAuthUrl: (state) => {
      const params = new URLSearchParams({
        client_id: _slackConfig.clientId,
        scope: _slackConfig.scopes.join(","),
        redirect_uri: _slackConfig.redirectUri,
        state: state,
        response_type: "code",
      })
      return `https://slack.com/oauth/v2/authorize?${params.toString()}`
    },
    validate: () => {
      const required = ["clientId", "clientSecret", "redirectUri"]
      const missing = required.filter((key) => !_slackConfig[key])

      if (missing.length > 0) {
        throw new Error(`Missing required Slack configuration: ${missing.join(", ")}`)
      }
      return true
    },
  }
}

module.exports = { setSlackConfig, getSlackConfig }

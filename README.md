# Slack API Backend
A comprehensive Node.js backend application for integrating with the Slack API, designed for MERN stack developers. This project provides robust OAuth authentication and complete messaging operations with enterprise-grade security.

## 🚀 Quick Start
1. **Clone and install dependencies**
    
    git clone https://github.com/Abanti2000/slack_api_backend.git
    cd slack-api-backend
    npm install
    
2. **Set up your Slack App** (Requires a pre-configured Slack App with appropriate OAuth permissions and redirect URLs.)
3. **Configure environment variables** (Sensitive credentials are managed via environment variables, not directly in code.)
4. **Start the server**
   Choose one of the following commands based on your environment:
   - **Development Mode (with hot-reloading):**
     
     npm run dev
     npm start
    
## ✨ Features
### Authentication
- 🔐 Slack OAuth 2.0 integration
- 🛡️ CSRF protection with state parameters
- 👤 User profile management
- 🔑 Token verification and validation

### Messaging Operations
- 📤 Send messages to channels
- ⏰ Schedule messages for future delivery
- 📜 Retrieve message history
- ✏️ Edit existing messages
- 🗑️ Delete messages
- 📋 List channels and workspaces
- 🔗 Generate message permalinks

### Security & Performance
- 🚦 Rate limiting
- 🌐 CORS configuration
- 🛡️ Helmet security headers
- ✅ Input validation with Joi
- 🚨 Centralized error handling

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit
- **Development**: Nodemon, dotenv

## 📁 Project Structure

├── config/           # Configuration files
├── middleware/       # Express middleware
├── routes/           # API route definitions
├── services/         # Business logic & external API calls
├── scripts/          # Utility scripts
├── .env.example      # Environment variables template
├── package.json      # Dependencies and scripts
└── server.js         # Application entry point


## 📚 API Documentation
Base URL: `http://localhost:3000/api`

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/oauth-url` | Get Slack OAuth URL | No |
| GET | `/auth/callback` | OAuth callback handler | No |
| POST | `/auth/verify` | Verify access token | No |
| GET | `/auth/me` | Get current user info | ✅ |
| POST | `/auth/logout` | Logout user | ✅ |

### Messaging Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages/send` | Send message to channel | ✅ |
| POST | `/messages/schedule` | Schedule future message | ✅ |
| GET | `/messages/retrieve/:channel` | Get channel messages | ✅ |
| GET | `/messages/retrieve/:channel/:timestamp` | Get specific message | ✅ |
| PUT | `/messages/edit` | Edit existing message | ✅ |
| DELETE | `/messages/delete/:channel/:timestamp` | Delete message | ✅ |
| GET | `/messages/channels` | List available channels | ✅ |
| GET | `/messages/permalink/:channel/:timestamp` | Get message permalink | ✅ |

### Example Requests
*Note: Full `curl` examples are omitted for brevity and security when sharing with external parties. These endpoints are designed to be consumed by a frontend application or other services.*

#### Start OAuth Flow
Initiates the Slack OAuth flow to authorize the application.

#### OAuth Callback
Handles the redirect from Slack after user authorization, exchanging the temporary code for an access token.

#### Verify Access Token
Verifies the validity of an existing access token.

#### Get Current User Info
Retrieves information about the currently authenticated user.

#### Logout User
Invalidates the current user's session.

#### Send Message
Sends a message to a specified Slack channel.

#### Schedule Message
Schedules a message to be sent to a channel at a future time.

#### Get Channel Messages
Retrieves a list of messages from a specified channel.

#### Get Specific Message
Retrieves a single message by its channel and timestamp.

#### Edit Existing Message
Modifies the text of an already sent message.

#### Delete Message
Removes a message from a channel.

#### List Available Channels
Retrieves a list of channels the bot has access to.

#### Get Message Permalink
Generates a direct link to a specific message in Slack.

## 🔒 Security Features
- **OAuth 2.0**: Secure authentication flow with Slack
- **CSRF Protection**: State parameter validation
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation
- **Security Headers**: Helmet middleware
- **CORS**: Controlled cross-origin access
- **Environment Variables**: Sensitive data protection

## 📋 Response Format
### Success Response
json
{
  "success": true,
  "data": {
    // Response data here
  }
}

### Error Response
json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error description"
}

### Common Error Codes
| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `AUTHENTICATION_FAILED` | Invalid or missing token |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

## 🔧 Development
### Available Scripts

npm run dev
npm start
npm run test

### Environment Variables
*Note: Specific environment variables are required for configuration, but their details are omitted here for security.*

**Built with ❤️**

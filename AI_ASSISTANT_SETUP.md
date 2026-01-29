# AI Assistant Setup Guide

## Overview
The AI Assistant is a chat-based feature that helps users with rental property queries, property searches, and general platform assistance. It's available on all pages via a floating chat button.

## Features
- ✅ **Full-Featured Chatbot** with advanced capabilities
- ✅ Floating chat button (bottom-right corner) with pulse animation
- ✅ Real-time AI-powered responses with typing indicators
- ✅ **Conversation Persistence** - Saves chat history locally (last 10 conversations)
- ✅ **Quick Reply Suggestions** - Pre-defined helpful questions
- ✅ **Message Actions** - Copy, regenerate responses
- ✅ **Conversation Management** - Clear chat, export conversations
- ✅ **Minimize/Maximize** - Collapsible chat window
- ✅ **User Context Awareness** - Personalized responses based on user type (tenant/landlord)
- ✅ Conversation history context (last 10 messages)
- ✅ Fallback responses when AI API is unavailable
- ✅ Beautiful, responsive UI with smooth animations
- ✅ Available on all pages
- ✅ Multi-line text input support (Shift+Enter)
- ✅ Error handling with user-friendly messages

## Backend Setup

### 1. Environment Variables
Add the following to your `server/.env` file:

```env
# OpenAI API Configuration (Optional - for enhanced AI responses)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# If OPENAI_API_KEY is not set, the system will use intelligent fallback responses
```

### 2. API Endpoint
The AI chat endpoint is available at:
```
POST /api/ai/chat
```

**Request Body:**
```json
{
  "message": "What properties are available?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ],
  "userId": "user-id-optional",
  "userType": "tenant",
  "userName": "John Doe"
}
```

**Response:**
```json
{
  "response": "I can help you find rental properties...",
  "model": "gpt-3.5-turbo" // or "fallback" if using fallback mode
}
```

## Frontend Setup

### 1. Environment Variables
Add to your `client/.env` file (or deployment environment):

```env
# Backend API URL (optional - defaults to http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

For production, set this to your deployed backend URL:
```env
VITE_API_URL=https://your-backend-api.com
```

### 2. Component Location
The AI Assistant component is automatically included in `App.tsx` and is available on all pages.

## Usage

### For Users
1. Click the floating chat button (bottom-right corner)
2. Type your question or message (use Shift+Enter for new lines)
3. Press Enter or click Send
4. The AI will respond with helpful information
5. Use quick reply buttons for common questions
6. Right-click messages for copy/regenerate options
7. Use the menu (⋮) to export or clear conversations
8. Minimize the chat to keep it open while browsing

### Example Questions
- "What properties are available?"
- "How do I search for apartments?"
- "What's the rental process?"
- "Show me properties in [location]"
- "What are the prices like?"

## How It Works

### With OpenAI API (Recommended)
If `OPENAI_API_KEY` is configured:
- Uses GPT-3.5-turbo or specified model
- Provides intelligent, context-aware responses
- Maintains conversation context (last 10 messages)
- Personalizes responses based on user type (tenant/landlord)
- Uses user name and context for better assistance

### Without OpenAI API (Fallback Mode)
If `OPENAI_API_KEY` is not set:
- Uses intelligent rule-based responses
- Still provides helpful information
- Works offline/without API costs
- Perfect for development and testing

## Customization

### Changing the System Prompt
Edit `server/controllers/aiController.js`:
```javascript
const systemPrompt = `Your custom prompt here...`;
```

### Styling
The component uses Tailwind CSS and shadcn/ui components. Customize in `client/src/components/AIAssistant.tsx`.

### Position
Change the floating button position by modifying the `fixed` classes:
```tsx
className="fixed bottom-6 right-6" // Change to left-6 for left side
```

## Troubleshooting

### AI Not Responding
1. Check that the backend server is running on port 5000
2. Verify `VITE_API_URL` is set correctly in frontend
3. Check browser console for errors
4. Verify CORS is configured in `server/server.js`

### Fallback Mode Always Active
- This is normal if `OPENAI_API_KEY` is not set
- Fallback mode still provides helpful responses
- To enable full AI, add your OpenAI API key to `server/.env`

### CORS Errors
Ensure your `server/server.js` includes the frontend URL in CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'your-production-url'],
  credentials: true
}));
```

## API Costs (OpenAI)
- GPT-3.5-turbo: ~$0.0015 per 1K tokens (very affordable)
- Average conversation: ~500-1000 tokens
- Consider rate limiting for production use

## Security Notes
- Never expose `OPENAI_API_KEY` in frontend code
- Keep API keys in `.env` files (already in `.gitignore`)
- Consider adding authentication middleware for production
- Rate limiting recommended for public APIs

## New Features in Full Chatbot

### Conversation Persistence
- Conversations are automatically saved to localStorage
- Last 10 conversations are preserved
- Conversations persist across browser sessions
- Each conversation has a unique ID and timestamp

### Quick Reply Suggestions
- Pre-defined helpful questions appear when starting a chat
- One-click access to common queries
- Automatically hidden after first message

### Message Actions
- **Copy**: Copy any message to clipboard
- **Regenerate**: Regenerate the last AI response
- Access via right-click or hover menu on messages

### Conversation Management
- **Export**: Download conversation as text file
- **Clear**: Clear current conversation and history
- **Minimize**: Collapse chat window while keeping it accessible

### Enhanced UI/UX
- Smooth animations and transitions
- Typing indicators with animated dots
- Loading states for better feedback
- Error messages with retry suggestions
- Responsive design for all screen sizes
- Multi-line text input support

### User Context Integration
- Personalized greetings using user name
- Context-aware responses based on user type
- Better assistance for tenants vs landlords
- User information passed to backend for enhanced responses

## Future Enhancements
- [x] Add conversation persistence ✅
- [x] Add message actions ✅
- [x] Add user context awareness ✅
- [ ] Implement rate limiting
- [ ] Support for property-specific queries with real data
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] File/image upload support
- [ ] Rich message formatting (markdown, links)
- [ ] Conversation search functionality


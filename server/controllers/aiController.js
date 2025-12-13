import dotenv from "dotenv";
dotenv.config();

/**
 * AI Chat Controller
 * Handles AI chat requests and responses
 * Supports OpenAI API or compatible services
 */

export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory = [], userId, userType, userName } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    // Build personalized system prompt based on user context
    let userContext = '';
    if (userName) {
      userContext += `The user's name is ${userName}. `;
    }
    if (userType) {
      userContext += `The user is a ${userType}. `;
      if (userType === 'tenant') {
        userContext += 'They are looking for rental properties. ';
      } else if (userType === 'landlord') {
        userContext += 'They are listing or managing properties. ';
      }
    }

    // Enhanced system prompt for rental property assistance
    const systemPrompt = `You are a helpful, friendly, and knowledgeable AI assistant for Kasi-Rent, a rental property platform in South Africa. 
    ${userContext}
    
    Your role is to help users with:
    - Finding and searching for rental properties (apartments, houses, studios, townhouses)
    - Understanding the rental process and requirements
    - Answering questions about properties, landlords, tenants, and the platform
    - Providing rental advice and guidance
    - Helping with property searches, filters, and recommendations
    - Explaining rental terms, deposits, and agreements
    - Assisting with property listings and management (for landlords)
    - General questions about Kasi-Rent platform features
    
    Guidelines:
    - Be friendly, professional, and conversational
    - Keep responses concise but informative (2-4 sentences typically)
    - Use South African context when relevant (e.g., Rands for currency)
    - Provide actionable advice when possible
    - If asked about specific properties, guide users to browse the properties page
    - Be empathetic and understanding about rental concerns
    - Maintain context from the conversation history
    
    Always be helpful and aim to provide value to the user's rental journey.`;

    // Prepare messages for API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message.trim() }
    ];

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback: Simple rule-based responses for development
      return res.json({
        response: getFallbackResponse(message, userType),
        model: 'fallback'
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      
      // Fallback response on API error
      return res.json({
        response: getFallbackResponse(message, userType),
        model: 'fallback',
        error: 'AI service temporarily unavailable, using fallback responses'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    res.json({
      response: aiResponse,
      model: data.model || 'gpt-3.5-turbo'
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      response: getFallbackResponse(req.body.message || '', req.body.userType)
    });
  }
};

/**
 * Fallback response generator for when AI API is not available
 */
function getFallbackResponse(message, userType = null) {
  const lowerMessage = message.toLowerCase();
  
  // Property search related
  if (lowerMessage.includes('property') || lowerMessage.includes('rent') || lowerMessage.includes('apartment') || 
      lowerMessage.includes('house') || lowerMessage.includes('studio') || lowerMessage.includes('townhouse')) {
    if (userType === 'tenant') {
      return "I can help you find the perfect rental property! Browse our properties page to see available listings. You can filter by type, location, price, and amenities. What kind of property are you looking for?";
    } else if (userType === 'landlord') {
      return "I can help you with property listings! You can add new properties through your landlord dashboard. Need help with listing details, pricing, or property management?";
    }
    return "I can help you find rental properties! You can browse our properties page to see available listings. Would you like to know about specific property types, locations, or pricing?";
  }
  
  // Pricing related
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive') || 
      lowerMessage.includes('rent') || lowerMessage.includes('afford') || lowerMessage.includes('budget')) {
    return "Property prices vary based on location, size, and amenities. On our properties page, you can filter by price range to find options within your budget. What's your price range?";
  }
  
  // Location related
  if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('area') || 
      lowerMessage.includes('address') || lowerMessage.includes('neighborhood')) {
    return "We have properties in various locations across South Africa. Use the search and filter features on our properties page to find properties in specific areas. What location are you interested in?";
  }
  
  // Rental process related
  if (lowerMessage.includes('process') || lowerMessage.includes('apply') || lowerMessage.includes('application') || 
      lowerMessage.includes('deposit') || lowerMessage.includes('lease') || lowerMessage.includes('agreement')) {
    return "The rental process typically involves: 1) Finding a property you like, 2) Contacting the landlord, 3) Submitting an application, 4) Paying a deposit, and 5) Signing a lease agreement. Would you like more details on any specific step?";
  }
  
  // Dashboard or account related
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('account') || lowerMessage.includes('profile') || 
      lowerMessage.includes('settings')) {
    if (userType === 'tenant') {
      return "You can access your tenant dashboard to view your applications, saved properties, and rental history. Sign in to get started!";
    } else if (userType === 'landlord') {
      return "Your landlord dashboard lets you manage property listings, view applications, and track your rentals. Sign in to access it!";
    }
    return "You can access your dashboard after signing in. Tenants can view applications and saved properties, while landlords can manage their listings.";
  }
  
  // Search related
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('filter') || 
      lowerMessage.includes('browse')) {
    return "You can search and filter properties by type, location, price, bedrooms, and more on our properties page. What are you looking for?";
  }
  
  // General help
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what') || 
      lowerMessage.includes('guide') || lowerMessage.includes('assist')) {
    return "I'm here to help with your rental property needs! I can assist with finding properties, understanding the rental process, answering questions about our platform, or providing rental advice. What would you like to know?";
  }
  
  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
      lowerMessage.includes('greeting')) {
    return "Hello! I'm your AI assistant for Kasi-Rent. I can help you find rental properties, answer questions about our platform, or assist with your rental needs. How can I help you today?";
  }
  
  // Default response
  return "Thank you for your message! I'm an AI assistant for Kasi-Rent. I can help you find rental properties, answer questions about our platform, or assist with your rental needs. Could you tell me more about what you're looking for?";
}


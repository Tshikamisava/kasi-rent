import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Generate compelling property descriptions using AI
 */
export const generatePropertyDescription = async (req, res) => {
  try {
    const { title, property_type, bedrooms, bathrooms, price, location, amenities } = req.body;

    // Validate required fields
    if (!property_type || !bedrooms || !bathrooms || !price || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: property_type, bedrooms, bathrooms, price, location",
      });
    }

    let description;

    if (openai) {
      description = await generateWithAI(req.body);
    } else {
      description = generateWithTemplate(req.body);
    }

    return res.status(200).json({
      success: true,
      description,
      method: openai ? "ai" : "template",
    });
  } catch (error) {
    console.error("Description generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate description",
      error: error.message,
    });
  }
};

/**
 * Generate description using OpenAI
 */
async function generateWithAI(propertyData) {
  const { title, property_type, bedrooms, bathrooms, price, location, amenities } = propertyData;

  const amenitiesList = amenities ? `\nAmenities: ${amenities}` : "";

  const prompt = `You are a professional real estate copywriter specializing in South African township rentals. 
  
Create a compelling, engaging property description for this listing. The description should:
- Be 150-200 words
- Highlight key features and benefits
- Use emotional language to appeal to renters
- Mention location advantages
- Be honest and accurate
- Include practical details
- Encourage property viewings

Property Details:
- Type: ${property_type}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Monthly Rent: R${price}
- Location: ${location}
${amenitiesList}

Write only the property description, no titles or additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional real estate copywriter. Create engaging, honest property descriptions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI description generation error:", error);
    return generateWithTemplate(propertyData);
  }
}

/**
 * Generate description using template (fallback)
 */
function generateWithTemplate(propertyData) {
  const { property_type, bedrooms, bathrooms, price, location, amenities } = propertyData;

  const templates = {
    Apartment: `Beautiful ${bedrooms}-bedroom, ${bathrooms}-bathroom apartment in ${location}. 
Perfect for modern living with great access to local amenities and transport. 
This spacious unit features well-designed spaces and plenty of natural light. 
Located in a secure, family-friendly area with nearby schools, shops, and services.
Monthly rent: R${price}. ${amenities ? `Amenities include: ${amenities}.` : ""} 
Don't miss this opportunity - arrange a viewing today!`,

    House: `Stunning ${bedrooms}-bedroom, ${bathrooms}-bathroom house in desirable ${location}. 
This well-maintained property offers comfortable living with great potential. 
The home features quality finishes, good outdoor space, and proximity to essential services.
Perfect for families looking for a safe, convenient location.
Monthly rent: R${price}. ${amenities ? `Features: ${amenities}.` : ""} 
Schedule your viewing now and make this house your home!`,

    Townhouse: `Modern ${bedrooms}-bedroom, ${bathrooms}-bathroom townhouse in ${location}. 
Ideal for those seeking contemporary urban living with convenience.
This property offers stylish design, secure parking, and excellent neighborhood amenities.
Close to shopping centers, schools, and transport hubs.
Monthly rent: R${price}. ${amenities ? `Includes: ${amenities}.` : ""} 
Contact us today for a private showing!`,

    Studio: `Cozy studio apartment in ${location}, perfect for professionals and students. 
This efficient space offers modern comfort in a prime location.
Great access to local amenities, transport, and vibrant neighborhood.
Monthly rent: R${price}. ${amenities ? `Amenities: ${amenities}.` : ""} 
Ideal for independent living - book your viewing today!`,

    Room: `Comfortable room in ${location}, perfect for a single tenant or couple.
Located in a friendly, secure residential area with excellent access to services.
Monthly rent: R${price}. ${amenities ? `Amenities include: ${amenities}.` : ""} 
Contact us to arrange a viewing!`,
  };

  return (
    templates[property_type] ||
    `${bedrooms}-bedroom, ${bathrooms}-bathroom ${property_type} in ${location}.
Monthly rent: R${price}. ${amenities ? `Amenities: ${amenities}.` : ""} 
Contact for viewing!`
  );
}

/**
 * Generate optimized title for property
 */
export const generatePropertyTitle = async (req, res) => {
  try {
    const { property_type, bedrooms, bathrooms, location, price } = req.body;

    if (!property_type || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: property_type, location",
      });
    }

    let title;

    if (openai) {
      title = await generateTitleWithAI(req.body);
    } else {
      title = generateTitleWithTemplate(req.body);
    }

    return res.status(200).json({
      success: true,
      title,
      method: openai ? "ai" : "template",
    });
  } catch (error) {
    console.error("Title generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate title",
      error: error.message,
    });
  }
};

/**
 * Generate title using OpenAI
 */
async function generateTitleWithAI(propertyData) {
  const { property_type, bedrooms, bathrooms, location, price } = propertyData;

  const prompt = `Create a compelling, SEO-friendly real estate title (max 60 characters) for this property:
- Type: ${property_type}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Location: ${location}
- Price: R${price}/month

The title should:
- Include key details (beds/baths)
- Be catchy and appealing
- Maximize search visibility
- Stay under 60 characters

Return ONLY the title, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating compelling real estate titles. Return only the title.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 30,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI title generation error:", error);
    return generateTitleWithTemplate(propertyData);
  }
}

/**
 * Generate title using template
 */
function generateTitleWithTemplate(propertyData) {
  const { property_type, bedrooms, bathrooms, location } = propertyData;

  const titles = {
    Apartment: `${bedrooms}BR Apartment in ${location}`,
    House: `${bedrooms}BR House in ${location}`,
    Townhouse: `${bedrooms}BR Townhouse in ${location}`,
    Studio: `Modern Studio in ${location}`,
    Room: `Room in ${location}`,
  };

  return titles[property_type] || `${property_type} in ${location}`;
}

/**
 * Suggest optimal price based on property details and location
 */
export const suggestOptimalPrice = async (req, res) => {
  try {
    const { property_type, bedrooms, bathrooms, location, amenities } = req.body;

    if (!property_type || !bedrooms || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let priceSuggestion;

    if (openai) {
      priceSuggestion = await suggestPriceWithAI(req.body);
    } else {
      priceSuggestion = suggestPriceWithRules(req.body);
    }

    return res.status(200).json({
      success: true,
      suggestion: priceSuggestion,
      method: openai ? "ai" : "rule-based",
    });
  } catch (error) {
    console.error("Price suggestion error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to suggest price",
      error: error.message,
    });
  }
};

/**
 * Suggest price using AI
 */
async function suggestPriceWithAI(propertyData) {
  const { property_type, bedrooms, bathrooms, location, amenities } = propertyData;

  const prompt = `You are a real estate pricing expert for South African townships. 
Based on this property, suggest a competitive monthly rental price range.

Property Details:
- Type: ${property_type}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Location: ${location}
${amenities ? `- Amenities: ${amenities}` : ""}

Respond with JSON format:
{
  "minPrice": number,
  "maxPrice": number,
  "recommendedPrice": number,
  "reasoning": "brief explanation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a real estate pricing expert. Respond only with valid JSON in South African Rand.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const suggestion = JSON.parse(response.choices[0].message.content);
    return suggestion;
  } catch (error) {
    console.error("OpenAI price suggestion error:", error);
    return suggestPriceWithRules(propertyData);
  }
}

/**
 * Suggest price using rules
 */
function suggestPriceWithRules(propertyData) {
  const { property_type, bedrooms, bathrooms, location } = propertyData;

  // Base prices per bed for common locations
  const baseLocationPrices = {
    Riverside: 3500,
    Fourways: 4000,
    Sandton: 4500,
    Bryanston: 4200,
    Midrand: 3800,
    default: 3500,
  };

  const locationKey = Object.keys(baseLocationPrices).find((key) =>
    location.toLowerCase().includes(key.toLowerCase())
  );

  const basePricePerBed = baseLocationPrices[locationKey] || baseLocationPrices.default;

  // Calculate base price
  let basePrice = basePricePerBed * bedrooms;

  // Adjust for bathrooms
  basePrice += bathrooms * 500;

  // Adjust for property type
  const typeMultipliers = {
    Apartment: 0.9,
    House: 1.2,
    Townhouse: 1.0,
    Studio: 0.6,
    Room: 0.4,
  };

  const multiplier = typeMultipliers[property_type] || 1.0;
  basePrice = Math.round(basePrice * multiplier / 50) * 50;

  return {
    minPrice: Math.round(basePrice * 0.9 / 50) * 50,
    maxPrice: Math.round(basePrice * 1.2 / 50) * 50,
    recommendedPrice: basePrice,
    reasoning: `Based on ${property_type}, ${bedrooms}BR/${bathrooms}BA in ${location}. Adjust based on condition, amenities, and demand.`,
  };
}

import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Generate compelling property descriptions using AI
 */
export const generatePropertyDescription = async (req, res) => {
  try {
    const { title, property_type, bedrooms, bathrooms, price, location, amenities } = req.body;

    // Validate required fields
    if (!property_type) {
      return res.status(400).json({
        success: false,
        message: "Property type is required",
      });
    }

    // Use default values for missing fields
    const propertyData = {
      title: title || '',
      property_type: property_type,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      price: price || 0,
      location: location || 'Location not specified',
      amenities: amenities || ''
    };

    let description;
    let method = 'template';

    // Try AI generation if API key is configured
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        description = await generateWithAI(propertyData);
        method = 'ai';
      } catch (aiError) {
        console.warn("AI generation failed, falling back to template:", aiError.message);
        description = generateWithTemplate(propertyData);
      }
    } else {
      // Use template if no API key
      console.log("Using template method - OpenAI API key not configured");
      description = generateWithTemplate(propertyData);
    }

    return res.status(200).json({
      success: true,
      description,
      method,
    });
  } catch (error) {
    console.error("Description generation error:", error);
    
    // Fallback to template on any error
    try {
      const description = generateWithTemplate(req.body);
      return res.status(200).json({
        success: true,
        description,
        method: 'template-fallback',
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate description",
        error: error.message,
      });
    }
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
  
  const beds = bedrooms || 1;
  const baths = bathrooms || 1;
  const loc = location || 'prime location';
  const rent = price || 'Competitive';
  const amenitiesText = amenities ? `Amenities include: ${amenities}.` : "Contact for more details about amenities.";

  const templates = {
    Apartment: `Beautiful ${beds}-bedroom, ${baths}-bathroom apartment in ${loc}. 
Perfect for modern living with great access to local amenities and transport. 
This spacious unit features well-designed spaces and plenty of natural light. 
Located in a secure, family-friendly area with nearby schools, shops, and services.
Monthly rent: R${typeof rent === 'number' ? rent.toLocaleString() : rent}. ${amenitiesText} 
Don't miss this opportunity - arrange a viewing today!`,

    House: `Stunning ${beds}-bedroom, ${baths}-bathroom house in desirable ${loc}. 
This well-maintained property offers comfortable living with great potential. 
The home features quality finishes, good outdoor space, and proximity to essential services.
Perfect for families looking for a safe, convenient location.
Monthly rent: R${typeof rent === 'number' ? rent.toLocaleString() : rent}. ${amenitiesText} 
Schedule your viewing now and make this house your home!`,

    Townhouse: `Modern ${beds}-bedroom, ${baths}-bathroom townhouse in ${loc}. 
Ideal for those seeking contemporary urban living with convenience.
This property offers stylish design, secure parking, and excellent neighborhood amenities.
Close to shopping centers, schools, and transport hubs.
Monthly rent: R${typeof rent === 'number' ? rent.toLocaleString() : rent}. ${amenitiesText} 
Contact us today for a private showing!`,

    Studio: `Cozy studio apartment in ${loc}, perfect for professionals and students. 
This efficient space offers modern comfort in a prime location.
Great access to local amenities, transport, and vibrant neighborhood.
Monthly rent: R${typeof rent === 'number' ? rent.toLocaleString() : rent}. ${amenitiesText} 
Ideal for independent living - book your viewing today!`,

    Room: `Comfortable room in ${loc}, perfect for a single tenant or couple.
Located in a friendly, secure residential area with excellent access to services.
Monthly rent: R${typeof rent === 'number' ? rent.toLocaleString() : rent}. ${amenitiesText} 
Contact us to arrange a viewing!`,
  };

  return (
    templates[property_type] ||
    `${beds}-bedroom, ${baths}-bathroom ${property_type} in ${loc}.
Monthly rent: R${typeof rent === 'number' ? rent.toLocaleString() : rent}. ${amenitiesText} 
Contact for viewing!`
  );
}

/**
 * Generate optimized title for property
 */
export const generatePropertyTitle = async (req, res) => {
  try {
    const { property_type, bedrooms, bathrooms, location, price } = req.body;

    if (!property_type) {
      return res.status(400).json({
        success: false,
        message: "Property type is required",
      });
    }

    // Use default values
    const propertyData = {
      property_type,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      location: location || 'Great Location',
      price: price || 0
    };

    let title;
    let method = 'template';

    // Try AI generation if available
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        title = await generateTitleWithAI(propertyData);
        method = 'ai';
      } catch (aiError) {
        console.warn("AI title generation failed, using template:", aiError.message);
        title = generateTitleWithTemplate(propertyData);
      }
    } else {
      title = generateTitleWithTemplate(propertyData);
    }

    return res.status(200).json({
      success: true,
      title,
      method,
    });
  } catch (error) {
    console.error("Title generation error:", error);
    
    // Fallback
    try {
      const title = generateTitleWithTemplate(req.body);
      return res.status(200).json({
        success: true,
        title,
        method: 'template-fallback',
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate title",
        error: error.message,
      });
    }
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
  
  const beds = bedrooms || 1;
  const baths = bathrooms || 1;
  const loc = location || 'Great Location';

  const titles = {
    Apartment: `${beds}BR Apartment in ${loc}`,
    House: `${beds}BR ${baths}BA House in ${loc}`,
    Townhouse: `${beds}BR Townhouse in ${loc}`,
    Studio: `Modern Studio in ${loc}`,
    Room: `Room for Rent in ${loc}`,
  };

  return titles[property_type] || `${property_type} in ${loc}`;
}

/**
 * Suggest optimal price based on property details and location
 */
export const suggestOptimalPrice = async (req, res) => {
  try {
    const { property_type, bedrooms, bathrooms, location, amenities } = req.body;

    if (!property_type) {
      return res.status(400).json({
        success: false,
        message: "Property type is required",
      });
    }

    // Use default values
    const propertyData = {
      property_type,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      location: location || 'General Area',
      amenities: amenities || ''
    };

    let priceSuggestion;
    let method = 'rule-based';

    // Try AI if available
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        priceSuggestion = await suggestPriceWithAI(propertyData);
        method = 'ai';
      } catch (aiError) {
        console.warn("AI price suggestion failed, using rules:", aiError.message);
        priceSuggestion = suggestPriceWithRules(propertyData);
      }
    } else {
      priceSuggestion = suggestPriceWithRules(propertyData);
    }

    return res.status(200).json({
      success: true,
      suggestion: priceSuggestion,
      method,
    });
  } catch (error) {
    console.error("Price suggestion error:", error);
    
    // Fallback
    try {
      const priceSuggestion = suggestPriceWithRules(req.body);
      return res.status(200).json({
        success: true,
        suggestion: priceSuggestion,
        method: 'rule-based-fallback',
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        message: "Failed to suggest price",
        error: error.message,
      });
    }
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
  
  const beds = bedrooms || 1;
  const baths = bathrooms || 1;
  const loc = location || '';

  // Base prices per bed for common locations
  const baseLocationPrices = {
    Riverside: 3500,
    Fourways: 4000,
    Sandton: 4500,
    Bryanston: 4200,
    Midrand: 3800,
    Johannesburg: 3600,
    Pretoria: 3400,
    Centurion: 3700,
    default: 3500,
  };

  const locationKey = Object.keys(baseLocationPrices).find((key) =>
    loc.toLowerCase().includes(key.toLowerCase())
  );

  const basePricePerBed = baseLocationPrices[locationKey] || baseLocationPrices.default;

  // Calculate base price
  let basePrice = basePricePerBed * beds;

  // Adjust for bathrooms
  basePrice += baths * 500;

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
    minPrice: Math.round(basePrice * 0.85 / 50) * 50,
    maxPrice: Math.round(basePrice * 1.15 / 50) * 50,
    recommendedPrice: basePrice,
    reasoning: `Based on ${property_type} with ${beds} bedroom(s) and ${baths} bathroom(s) in ${loc || 'your area'}. Prices may vary based on property condition, amenities, and market demand.`,
  };
}

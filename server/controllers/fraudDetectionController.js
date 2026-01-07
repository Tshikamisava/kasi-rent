import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * AI-powered fraud detection for property listings
 * Analyzes property details for potential scams or suspicious content
 */
export const analyzePropertyForFraud = async (req, res) => {
  try {
    const { title, description = "", price, location, property_type, bedrooms, bathrooms } = req.body;

    // Validate required fields (description is optional)
    if (!title || !price || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, price, and location are required",
      });
    }

    let fraudAnalysis;

    // Use OpenAI if available
    if (openai) {
      fraudAnalysis = await analyzeWithAI(req.body);
    } else {
      // Fallback to rule-based detection
      fraudAnalysis = analyzeWithRules(req.body);
    }

    return res.status(200).json({
      success: true,
      analysis: fraudAnalysis,
      method: openai ? "ai" : "rule-based",
    });
  } catch (error) {
    console.error("Fraud detection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze property for fraud",
      error: error.message,
    });
  }
};

/**
 * AI-powered fraud detection using OpenAI
 */
async function analyzeWithAI(propertyData) {
  const { title, description, price, location, property_type, bedrooms, bathrooms } = propertyData;

  const prompt = `You are a fraud detection AI for a South African township rental platform. Analyze this property listing for potential scams or fraud indicators.

Property Details:
- Title: ${title}
- Description: ${description}
- Price: R${price}/month
- Location: ${location}
- Type: ${property_type || "N/A"}
- Bedrooms: ${bedrooms || "N/A"}
- Bathrooms: ${bathrooms || "N/A"}

Analyze for:
1. Unrealistic pricing (too cheap or expensive for South African townships)
2. Scam keywords (urgent, wire money, send deposit first, etc.)
3. Poor grammar or suspicious language patterns
4. Vague or misleading descriptions
5. Missing important details
6. Duplicate or copy-pasted content

Respond in JSON format:
{
  "isSuspicious": boolean,
  "riskLevel": "low" | "medium" | "high",
  "confidenceScore": number (0-100),
  "flags": array of specific issues found,
  "recommendations": array of suggestions to improve listing,
  "reason": brief explanation
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fraud detection expert for South African rental listings. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error("OpenAI fraud detection error:", error);
    // Fallback to rule-based if AI fails
    return analyzeWithRules(propertyData);
  }
}

/**
 * Rule-based fraud detection (fallback when no OpenAI)
 */
function analyzeWithRules(propertyData) {
  const { title, description, price, location, property_type, bedrooms } = propertyData;

  const flags = [];
  let riskLevel = "low";
  const recommendations = [];

  // Check 1: Suspicious pricing
  if (price < 500) {
    flags.push("Price is unusually low (under R500/month) - possible scam");
    riskLevel = "high";
  } else if (price > 50000) {
    flags.push("Price is extremely high - verify accuracy");
    riskLevel = "medium";
  } else if (price > 20000) {
    recommendations.push("Consider verifying high-end property details");
  }

  // Check 2: Scam keywords
  const scamKeywords = [
    "wire money",
    "send deposit",
    "urgent",
    "must pay now",
    "western union",
    "moneygram",
    "bitcoin",
    "cryptocurrency",
    "advance payment",
    "pay before viewing",
    "guaranteed",
    "100% legit",
    "no questions asked",
  ];

  const combinedText = `${title} ${description}`.toLowerCase();
  scamKeywords.forEach((keyword) => {
    if (combinedText.includes(keyword)) {
      flags.push(`Contains suspicious keyword: "${keyword}"`);
      riskLevel = "high";
    }
  });

  // Check 3: Description quality
  if (description.length < 50) {
    flags.push("Description is too short (under 50 characters)");
    recommendations.push("Add more details about the property");
    if (riskLevel === "low") riskLevel = "medium";
  }

  if (description.length > 2000) {
    flags.push("Description is unusually long - may be copied");
    if (riskLevel === "low") riskLevel = "medium";
  }

  // Check 4: Title quality
  if (title.length < 10) {
    flags.push("Title is too short");
    recommendations.push("Use a more descriptive title");
  }

  if (title.toUpperCase() === title && title.length > 10) {
    flags.push("Title is all caps - unprofessional");
    recommendations.push("Use proper capitalization");
  }

  // Check 5: Excessive punctuation
  const exclamationCount = (combinedText.match(/!/g) || []).length;
  if (exclamationCount > 5) {
    flags.push("Excessive use of exclamation marks - suspicious");
    if (riskLevel === "low") riskLevel = "medium";
  }

  // Check 6: Missing key information
  if (!property_type || property_type === "") {
    recommendations.push("Specify property type (house, apartment, room, etc.)");
  }

  if (!bedrooms || bedrooms === 0) {
    recommendations.push("Specify number of bedrooms");
  }

  if (!location || location.length < 3) {
    flags.push("Location is missing or too vague");
    if (riskLevel === "low") riskLevel = "medium";
  }

  // Check 7: Contact info in description (should use platform)
  const contactPatterns = [
    /\b\d{10}\b/, // Phone number
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone with separators
    /[\w.-]+@[\w.-]+\.\w+/, // Email
    /whatsapp/i,
    /call me/i,
    /contact me at/i,
  ];

  contactPatterns.forEach((pattern) => {
    if (pattern.test(combinedText)) {
      flags.push("Contains direct contact information - should use platform chat");
      recommendations.push("Remove contact details and use platform messaging");
      if (riskLevel === "low") riskLevel = "medium";
    }
  });

  // Calculate confidence score
  const totalChecks = 7;
  const flagCount = flags.length;
  const confidenceScore = Math.max(0, Math.min(100, 100 - (flagCount * 15)));

  // Determine if suspicious
  const isSuspicious = riskLevel === "high" || flags.length >= 3;

  return {
    isSuspicious,
    riskLevel,
    confidenceScore,
    flags: flags.length > 0 ? flags : ["No major issues detected"],
    recommendations: recommendations.length > 0 ? recommendations : ["Listing looks good!"],
    reason: isSuspicious
      ? `Found ${flags.length} potential issue(s). Please review and address the flagged concerns.`
      : "Property listing appears legitimate with no major red flags.",
  };
}

/**
 * Analyze multiple properties in batch
 */
export const batchAnalyzeProperties = async (req, res) => {
  try {
    const { properties } = req.body;

    if (!Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid properties array",
      });
    }

    const analyses = [];

    for (const property of properties.slice(0, 10)) {
      // Limit to 10 at a time
      const analysis = openai ? await analyzeWithAI(property) : analyzeWithRules(property);
      analyses.push({
        propertyId: property.id,
        analysis,
      });
    }

    return res.status(200).json({
      success: true,
      analyses,
      method: openai ? "ai" : "rule-based",
    });
  } catch (error) {
    console.error("Batch fraud detection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze properties",
      error: error.message,
    });
  }
};

import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Helper function to safely parse JSON from OpenAI response
 */
function parseOpenAIResponse(content: string | null): any {
  if (!content) {
    throw new Error("No content in OpenAI response");
  }
  return JSON.parse(content);
}

/**
 * Generate a personalized lesson based on the child's age, interests, and learning level
 */
export async function generateLesson(params: {
  subject: string;
  childAge: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  title?: string;
}) {
  const { subject, childAge, difficulty, interests = [], title } = params;
  
  const prompt = `
    Create an educational lesson for a ${childAge}-year-old child at a ${difficulty} level about ${subject}.
    ${title ? `The lesson title is: ${title}.` : ''}
    ${interests.length > 0 ? `The child is interested in: ${interests.join(', ')}.` : ''}
    
    Format the lesson with:
    1. A brief introduction that captures attention
    2. 2-3 key concepts explained in simple terms
    3. A fun activity or experiment related to the topic
    4. A short summary of what was learned
    
    The content should be educational, engaging, and age-appropriate.
    Respond with JSON in this format:
    {
      "title": "Lesson Title",
      "introduction": "Attention-grabbing introduction...",
      "key_concepts": [
        {"heading": "First Concept", "content": "Explanation..."},
        {"heading": "Second Concept", "content": "Explanation..."}
      ],
      "activity": {"title": "Fun Activity", "instructions": "Step-by-step instructions..."},
      "summary": "Brief recap of what was covered..."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return parseOpenAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating lesson:", error);
    throw new Error("Failed to generate lesson content");
  }
}

/**
 * Generate quiz questions based on a specific topic or lesson
 */
export async function generateQuestions(params: {
  topic: string;
  childAge: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  count: number;
  previousQuestionsTopics?: string[];
}) {
  const { topic, childAge, difficulty, count, previousQuestionsTopics = [] } = params;
  
  const prompt = `
    Create ${count} multiple-choice educational questions about ${topic} for a ${childAge}-year-old child at a ${difficulty} level.
    ${previousQuestionsTopics.length > 0 ? `Avoid these previously covered topics: ${previousQuestionsTopics.join(', ')}.` : ''}
    
    Each question should have:
    1. A clear question text
    2. Four possible answer choices (A, B, C, D)
    3. The correct answer identified
    4. An optional hint that helps guide the child to the answer without giving it away
    
    Make the questions engaging, educational, and appropriate for the child's age and difficulty level.
    
    Respond with JSON in this format:
    [
      {
        "text": "Question text?",
        "choices": [
          {"id": "A", "text": "First choice"},
          {"id": "B", "text": "Second choice"},
          {"id": "C", "text": "Third choice"},
          {"id": "D", "text": "Fourth choice"}
        ],
        "correctAnswerId": "B",
        "hint": "Optional hint text",
        "difficulty": 2,
        "tags": ["science", "planets"]
      }
    ]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return parseOpenAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}

/**
 * Generate a magical item description based on rarity and stat boosts
 */
export async function generateMagicalItem(params: {
  itemType: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  primaryStat: 'magicPower' | 'wisdom' | 'agility';
  theme?: string;
}) {
  const { itemType, rarity, primaryStat, theme = 'magical' } = params;
  
  const prompt = `
    Create a ${theme}-themed ${rarity.toLowerCase()} ${itemType} for an educational adventure game for children.
    This item primarily boosts the ${primaryStat} stat.
    
    Generate a creative name, an engaging description that hints at its magical properties,
    and appropriate stat boosts based on its rarity (higher rarity = higher stat values).
    
    Respond with JSON in this format:
    {
      "name": "Item Name",
      "description": "Magical and educational description...",
      "rarity": "${rarity}",
      "price": 100,
      "statBoosts": {
        "magicPower": 3,
        "wisdom": 1,
        "agility": 0
      }
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return parseOpenAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating magical item:", error);
    throw new Error("Failed to generate magical item");
  }
}

/**
 * Generate a map zone description with educational theme
 */
export async function generateMapZone(params: {
  zoneName: string;
  educationalTheme: string;
  previousZones?: string[];
}) {
  const { zoneName, educationalTheme, previousZones = [] } = params;
  
  const prompt = `
    Create a detailed description for a map zone named "${zoneName}" in an educational adventure game.
    The educational theme of this zone is: ${educationalTheme}.
    ${previousZones.length > 0 ? `This zone comes after: ${previousZones.join(', ')}.` : ''}
    
    Generate a vivid description of the zone's appearance, atmosphere, and educational elements.
    Include suggestions for 3-5 learning nodes (mini-games or tasks) that would fit within this zone.
    
    Respond with JSON in this format:
    {
      "name": "${zoneName}",
      "description": "Vivid description of the zone...",
      "educationalTheme": "${educationalTheme}",
      "atmosphere": "Description of how the zone feels...",
      "suggestedNodes": [
        {"name": "Node Name", "type": "mini-game", "concept": "Educational concept covered"},
        {"name": "Node Name", "type": "lesson", "concept": "Educational concept covered"}
      ],
      "landmarks": ["Notable landmark 1", "Notable landmark 2"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return parseOpenAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating map zone:", error);
    throw new Error("Failed to generate map zone");
  }
}

/**
 * Generate personalized feedback based on a child's performance
 */
export async function generateFeedback(params: {
  childName: string;
  childAge: number;
  performance: 'excellent' | 'good' | 'average' | 'needs improvement';
  subject: string;
  specificAreas?: string[];
}) {
  const { childName, childAge, performance, subject, specificAreas = [] } = params;
  
  const prompt = `
    Create encouraging, educational feedback for ${childName}, a ${childAge}-year-old child who has ${performance} performance in ${subject}.
    ${specificAreas.length > 0 ? `Focus on these specific areas: ${specificAreas.join(', ')}.` : ''}
    
    The feedback should be:
    1. Positive and encouraging
    2. Specific to their performance level
    3. Include practical tips for improvement
    4. Age-appropriate in tone and language
    
    Respond with JSON in this format:
    {
      "greeting": "Personalized greeting...",
      "praise": "Recognition of what they did well...",
      "areas_for_growth": "Gentle identification of improvement areas...",
      "tips": ["Practical tip 1", "Practical tip 2"],
      "encouragement": "Final encouraging message..."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return parseOpenAIResponse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw new Error("Failed to generate feedback");
  }
}
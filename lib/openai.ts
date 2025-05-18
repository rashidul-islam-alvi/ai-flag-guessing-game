export async function getAIResponse(
  hiddenFlag: string,
  userInput: string
): Promise<string> {
  try {
    console.log("Calling Groq API with:", { hiddenFlag, userInput });

    const prompt = `You are the host of a flag guessing game. The hidden flag is from ${hiddenFlag}.

    GAME RULES:
    - The player can ask questions about the flag's appearance, colors, symbols, or design
    - The player can make direct guesses of country names
    - You must be helpful but not give away the answer too easily
    
    USER INPUT: "${userInput}"
    
    RESPONSE GUIDELINES:
    
    If it's a QUESTION:
    - Answer truthfully about the flag's visual characteristics
    - Be descriptive but don't reveal the country name
    - Examples: "How many colors?" → "It has three colors"
    - Examples: "What shape?" → "It's rectangular with three vertical stripes"
    - Examples: "Any symbols?" → "No symbols, just colored sections"
    
    If it's a GUESS:
    - If correct: "🎉 Correct! It's the flag of ${hiddenFlag}!"
    - If incorrect: "❌ Wrong guess. That's not the right country. Try asking about the flag's features!"
    
    If it's unclear or general:
    - Encourage them to ask specific questions about colors, patterns, symbols, or shapes
    - Example: "Ask me about the colors, patterns, or symbols you'd like to know about!"
    
    Keep responses concise and engaging. Never reveal the country name unless they guess correctly.`;

    // Alternative advanced prompt with more game mechanics:
    const advancedPrompt = `You are an AI game master for a flag guessing game. The secret flag belongs to ${hiddenFlag}.
    
    🎯 GAME CONTEXT:
    - Player needs to identify the country by asking about flag characteristics
    - You provide helpful clues without revealing the answer
    - Make the game fun and educational
    
    📝 USER INPUT: "${userInput}"
    
    🎮 RESPONSE STRATEGY:
    
    For QUESTIONS about flag features:
    • Colors: Describe them accurately (e.g., "red, white, and blue")
    • Pattern: Explain the layout (e.g., "three horizontal stripes", "cross design")
    • Symbols: Mention any emblems, stars, etc. (e.g., "no symbols", "a maple leaf")
    • Position: Describe where elements are located
    
    For COUNTRY GUESSES:
    • Correct: "🏆 Excellent! Yes, it's ${hiddenFlag}! [Add interesting flag fact]"
    • Incorrect: "🚫 Not quite! That flag looks different. Try asking about [suggest aspect]"
    
    For VAGUE/UNCLEAR input:
    • Guide them: "Try asking about specific features like 'What colors are on the flag?' or 'Are there any symbols?'"
    
    🎨 RESPONSE STYLE:
    - Be encouraging and enthusiastic
    - Use emojis sparingly for emphasis
    - Give educational hints when helpful
    - Keep responses under 50 words unless providing detailed descriptions
    
    Remember: Be accurate about the flag but never say the country name unless they guess correctly!`;

    // Simple but effective prompt:
    const simplePrompt = `You're helping someone guess a flag. The answer is ${hiddenFlag}.
    
    User said: "${userInput}"
    
    Rules:
    - If they ask about the flag (colors, design, etc.), answer honestly but don't name the country
    - If they guess a country, say "Correct!" or "Wrong, try again!"
    - Be encouraging and helpful
    
    Keep it short and friendly!`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Fast and good model
          messages: [
            {
              role: "user",
              content: simplePrompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      throw new Error(
        `Groq API error: ${data.error?.message || response.statusText}`
      );
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response content received from Groq");
    }

    return content.trim();
  } catch (error: any) {
    console.error("Groq API Error:", error);

    // Handle specific errors
    if (error.message.includes("401")) {
      throw new Error("Invalid Groq API key. Please check your GROQ_API_KEY.");
    }

    if (error.message.includes("429")) {
      throw new Error("Groq rate limit exceeded. Please try again later.");
    }

    throw new Error(`Groq API error: ${error.message || "Unknown error"}`);
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { hiddenFlag, userInput } = body;

    // Input validation
    if (!hiddenFlag || typeof hiddenFlag !== "string") {
      console.log("Invalid hiddenFlag");
      return NextResponse.json(
        { error: "hiddenFlag is required and must be a string" },
        { status: 400 }
      );
    }

    if (!userInput || typeof userInput !== "string") {
      console.log("Invalid userInput");
      return NextResponse.json(
        { error: "userInput is required and must be a string" },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error("OPENAI_API_KEY not found");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Dynamic import of the AI function
    const { getAIResponse } = await import("../../../lib/openai");

    // Call the AI service
    const reply = await getAIResponse(hiddenFlag.trim(), userInput.trim());

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Detailed API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("authentication")
      ) {
        console.error("OpenAI API key error:", error.message);
        return NextResponse.json(
          { error: "AI service configuration error" },
          { status: 500 }
        );
      }

      if (error.message.includes("rate limit")) {
        console.error("Rate limit exceeded:", error.message);
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please try again later." },
          { status: 429 }
        );
      }

      if (
        error.message.includes("quota") ||
        error.message.includes("billing")
      ) {
        console.error("OpenAI quota/billing error:", error.message);
        return NextResponse.json(
          { error: "Service temporarily unavailable due to quota limits" },
          { status: 503 }
        );
      }

      if (error.message.includes("insufficient_quota")) {
        console.error("Insufficient quota:", error.message);
        return NextResponse.json(
          { error: "Service quota exceeded. Please try again later." },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

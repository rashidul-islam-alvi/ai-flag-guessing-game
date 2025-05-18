// app/api/test-groq/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        error: "GROQ_API_KEY not found in environment variables",
        hasKey: false,
      });
    }

    // Test actual API call
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: "Say 'Groq API test successful'",
            },
          ],
          max_tokens: 10,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: "Groq API test failed",
        details: data,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Groq API is working correctly",
      response: data.choices[0]?.message?.content,
    });
  } catch (error: any) {
    console.error("Test Groq Error:", error);

    return NextResponse.json({
      error: "Groq API test failed",
      details: {
        message: error.message,
      },
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { Flashcard, Question } from "@/types";
import { saveDeck } from "@/lib/db";

// ============ Mock Mode ============

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

// Import mock data if in mock mode
async function getMockData() {
  if (!USE_MOCK) return null;
  const { mockStudyData } = await import("@/mocks/data");
  return mockStudyData;
}

// ============ Validation Schemas ============

// Request schema
export const GenerateRequestSchema = z.object({
  sourceText: z.string().min(200, "Source text must be at least 200 characters").max(10000, "Source text must not exceed 10000 characters"),
  topicName: z.string().max(100).optional(),
});

// Flashcard schema
const FlashcardSchema = z.object({
  id: z.string().optional(), // Will be generated
  front: z.string().max(200, "Flashcard front must not exceed 200 characters"),
  back: z.string().max(500, "Flashcard back must not exceed 500 characters"),
});

// Question schema
const QuestionSchema = z.object({
  id: z.string().optional(), // Will be generated
  question: z.string().max(500, "Question must not exceed 500 characters"),
  options: z.array(z.string().max(200)).length(4, "Question must have exactly 4 options"),
  answer: z.number().int().min(0).max(3, "Answer must be between 0 and 3"),
});

// Response schema
const GenerateResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(10, "Must generate at least 10 flashcards").max(10, "Must generate exactly 10 flashcards"),
  quiz: z.array(QuestionSchema).min(5, "Must generate at least 5 questions").max(5, "Must generate exactly 5 questions"),
});

// ============ Prompts ============

const FLASHCARD_SYSTEM_PROMPT = `You are an expert study assistant. Your task is to create flashcards from educational content.

Rules:
1. Return ONLY valid JSON, no markdown formatting, no preamble, no explanation
2. Generate exactly 10 flashcards as a JSON array
3. Each flashcard must have:
   - "front": The concept, term, or question (max 15 words)
   - "back": A clear, concise explanation (max 50 words)
4. Focus on the most important concepts, definitions, and relationships
5. Make the front side specific and testable
6. Make the back side informative but concise
7. Use simple, clear language appropriate for the target audience

Output format:
[
  {"front": "What is X?", "back": "X is..."},
  ...
]`;

const QUIZ_SYSTEM_PROMPT = `You are an expert study assistant. Your task is to create multiple-choice questions from educational content.

Rules:
1. Return ONLY valid JSON, no markdown formatting, no preamble, no explanation
2. Generate exactly 5 multiple-choice questions as a JSON array
3. Each question must have:
   - "question": A clear, specific question
   - "options": Exactly 4 answer choices (distractors should be plausible but clearly incorrect)
   - "answer": The index (0-3) of the correct option
4. Questions should test understanding, not just memorization
5. Make distractors common misconceptions or related but incorrect concepts
6. Ensure only one option is clearly correct

Output format:
[
  {"question": "What is X?", "options": ["A", "B", "C", "D"], "answer": 1},
  ...
]`;

// ============ Helper Functions ============

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTitle(sourceText: string): string {
  const words = sourceText.trim().split(/\s+/).slice(0, 5);
  return words.join(" ") + "...";
}

function cleanJSONResponse(text: string): string {
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "");
  
  // Try to find JSON array in the response
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    cleaned = arrayMatch[0];
  }
  
  return cleaned.trim();
}

async function callClaudeWithRetry(
  client: Anthropic,
  messages: Anthropic.MessageCreateParams["messages"],
  maxRetries = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages,
      });

      const content = response.content[0];
      if (content.type === "text") {
        return content.text;
      }

      throw new Error("Unexpected response format from Claude");
    } catch (error) {
      lastError = error as Error;
      console.error(`Claude API attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error("Failed to call Claude API after multiple retries");
}

// ============ Main Handler ============

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate request
    const validated = GenerateRequestSchema.parse(body);

    // 3. Check if using mock mode
    if (USE_MOCK) {
      console.log("Using mock data mode");
      const mockData = await getMockData();

      if (!mockData) {
        return NextResponse.json(
          { error: { code: "MOCK_DATA_ERROR", message: "Mock data not available" } },
          { status: 500 }
        );
      }

      // Add IDs to mock data
      const flashcardsWithIds = mockData.flashcards.map(fc => ({
        ...fc,
        id: fc.id || generateId("fc"),
      }));

      const questionsWithIds = mockData.quiz.map(q => ({
        ...q,
        id: q.id || generateId("q"),
      }));

      // Generate title and save to Supabase
      const deckTitle = validated.topicName || generateTitle(validated.sourceText);
      const savedDeck = await saveDeck({
        title: deckTitle,
        source_text: validated.sourceText,
        topic_name: validated.topicName,
        flashcards: flashcardsWithIds,
        quiz_questions: questionsWithIds,
      });
      console.log("Mock deck saved with ID:", savedDeck.id);

      return NextResponse.json({
        deckId: savedDeck.id,
        deckTitle: savedDeck.title,
        flashcards: flashcardsWithIds,
        quiz: questionsWithIds,
      });
    }

    // 4. Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "sk-ant-your-key-here") {
      return NextResponse.json(
        {
          error: {
            code: "NO_API_KEY",
            message: "Anthropic API key not configured. Please set ANTHROPIC_API_KEY in .env.local or set USE_MOCK_DATA=true"
          }
        },
        { status: 500 }
      );
    }

    // 5. Initialize Claude client
    const anthropic = new Anthropic({ apiKey });

    // 6. Generate flashcards
    console.log("Generating flashcards...");
    const flashcardResponse = await callClaudeWithRetry(anthropic, [
      { role: "user", content: `${FLASHCARD_SYSTEM_PROMPT}\n\nGenerate exactly 10 flashcards from the following content:\n\n${validated.sourceText}` }
    ]);

    // Log raw response for debugging
    console.log("Raw flashcard response:", flashcardResponse.substring(0, 500));

    const cleanedFlashcards = cleanJSONResponse(flashcardResponse);
    console.log("Cleaned flashcard response:", cleanedFlashcards.substring(0, 500));

    let parsedFlashcards;

    try {
      parsedFlashcards = JSON.parse(cleanedFlashcards);
    } catch (parseError) {
      console.error("Failed to parse flashcard JSON:", cleanedFlashcards);
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse flashcard JSON from Claude response");
    }

    // Validate flashcards
    const validatedFlashcards = z.array(FlashcardSchema).safeParse(parsedFlashcards);
    if (!validatedFlashcards.success) {
      console.error("Flashcard validation failed:", validatedFlashcards.error);
      throw new Error("Generated flashcards do not match required schema");
    }

    // Add IDs
    const flashcards: Flashcard[] = validatedFlashcards.data.map((fc, index) => ({
      id: generateId("fc"),
      front: fc.front,
      back: fc.back,
    }));

    // 7. Generate quiz
    console.log("Generating quiz...");
    const quizResponse = await callClaudeWithRetry(anthropic, [
      { role: "user", content: `${QUIZ_SYSTEM_PROMPT}\n\nGenerate exactly 5 multiple-choice questions from the following content:\n\n${validated.sourceText}` }
    ]);

    const cleanedQuiz = cleanJSONResponse(quizResponse);
    let parsedQuiz;

    try {
      parsedQuiz = JSON.parse(cleanedQuiz);
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", cleanedQuiz);
      throw new Error("Failed to parse quiz JSON from Claude response");
    }

    // Validate quiz
    const validatedQuiz = z.array(QuestionSchema).safeParse(parsedQuiz);
    if (!validatedQuiz.success) {
      console.error("Quiz validation failed:", validatedQuiz.error);
      throw new Error("Generated quiz does not match required schema");
    }

    // Add IDs
    const quiz: Question[] = validatedQuiz.data.map((q, index) => ({
      id: generateId("q"),
      question: q.question,
      options: q.options,
      answer: q.answer,
    }));

    // 8. Save to Supabase
    console.log("Saving deck to Supabase...");
    const deckTitle = validated.topicName || generateTitle(validated.sourceText);
    const savedDeck = await saveDeck({
      title: deckTitle,
      source_text: validated.sourceText,
      topic_name: validated.topicName,
      flashcards: flashcards,
      quiz_questions: quiz,
    });
    console.log("Deck saved with ID:", savedDeck.id);

    // 9. Return response with deck ID
    return NextResponse.json({
      deckId: savedDeck.id,
      deckTitle: savedDeck.title,
      flashcards,
      quiz,
    });

  } catch (error) {
    console.error("Generate API error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
          }
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: {
          code: "GENERATION_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate flashcards and quiz",
        }
      },
      { status: 500 }
    );
  }
}

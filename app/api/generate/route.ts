import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { Flashcard, Question } from "@/types";
import { saveDeck } from "@/lib/db";

// Extend Vercel serverless function timeout to 60 seconds
export const maxDuration = 60;

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
  sourceText: z.string().min(100, "Content must be at least 100 characters").max(75000, "Content must not exceed 75,000 characters"),
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

// Response schemas
const GenerateResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(10, "Must generate at least 10 flashcards").max(10, "Must generate exactly 10 flashcards"),
  quiz: z.array(QuestionSchema).min(5, "Must generate at least 5 questions").max(5, "Must generate exactly 5 questions"),
});

const FlashcardResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(10, "Must generate at least 10 flashcards").max(10, "Must generate exactly 10 flashcards"),
  tags: z.array(z.string()).max(3).default([]),
});

// ============ Prompts ============

const FLASHCARD_SYSTEM_PROMPT = `You are an expert study assistant. Your task is to create flashcards from educational content.

Rules:
1. Return ONLY valid JSON, no markdown formatting, no preamble, no explanation
2. Generate exactly 10 flashcards
3. Each flashcard must have:
   - "front": The concept, term, or question (max 15 words)
   - "back": A clear, concise explanation (max 50 words)
4. Focus on the most important concepts, definitions, and relationships
5. Make the front side specific and testable
6. Make the back side informative but concise
7. Use simple, clear language appropriate for the target audience
8. Also suggest up to 3 tags that best describe the topic of this content.
   Prefer tags from this predefined list:
   JavaScript, TypeScript, React, CSS, HTML, Node.js, System Design,
   Performance, Accessibility, Testing, Git, Browser APIs.
   Only add a tag not from this list if none of the predefined tags fit.
   New tags must be short (1–3 words, title case).
   Return tags as a JSON array of strings in the "tags" field.
   If unsure, return an empty array.

Output format:
{
  "flashcards": [
    {"front": "What is X?", "back": "X is..."},
    ...
  ],
  "tags": ["Tag1", "Tag2"]
}`;

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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), ms)
  );
  return Promise.race([promise, timeout]);
}

function cleanJSONResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "");

  const objIdx = cleaned.indexOf('{');
  const arrIdx = cleaned.indexOf('[');
  if (objIdx !== -1 && (arrIdx === -1 || objIdx < arrIdx)) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return match[0];
  }
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];

  return cleaned.trim();
}

function titleCase(str: string): string {
  return str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

async function callClaudeWithRetry<T>(
  client: Anthropic,
  system: string,
  userMessage: string,
  parseAndValidate: (parsed: unknown) => T,
  maxRetries = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await withTimeout(
        client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system,
          messages: [{ role: "user", content: userMessage }],
        }),
        25000
      );

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Unexpected response format from Claude");

      const parsed = JSON.parse(cleanJSONResponse(content.text));
      return parseAndValidate(parsed);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
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

      return NextResponse.json({
        deckId: savedDeck.id,
        deckTitle: savedDeck.title,
        flashcards: flashcardsWithIds,
        quiz: questionsWithIds,
        tags: [],
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

    // 6. Generate flashcards and quiz in parallel
    const [flashcardData, quizData] = await Promise.all([
      callClaudeWithRetry(
        anthropic,
        FLASHCARD_SYSTEM_PROMPT,
        `Generate exactly 10 flashcards from the following content:\n\n${validated.sourceText}`,
        (parsed) => {
          const result = FlashcardResponseSchema.safeParse(parsed);
          if (!result.success) throw new Error("Generated flashcards do not match required schema");
          return result.data;
        }
      ),
      callClaudeWithRetry(
        anthropic,
        QUIZ_SYSTEM_PROMPT,
        `Generate exactly 5 multiple-choice questions from the following content:\n\n${validated.sourceText}`,
        (parsed) => {
          const result = z.array(QuestionSchema).min(5).max(5).safeParse(parsed);
          if (!result.success) throw new Error("Generated quiz does not match required schema");
          return result.data;
        }
      ),
    ]);

    const flashcards: Flashcard[] = flashcardData.flashcards.map((fc) => ({
      id: generateId("fc"),
      front: fc.front,
      back: fc.back,
    }));

    const tags = flashcardData.tags.slice(0, 3).map(titleCase);

    const quiz: Question[] = quizData.map((q) => ({
      id: generateId("q"),
      question: q.question,
      options: q.options,
      answer: q.answer,
    }));

    // 7. Save to Supabase
    const deckTitle = validated.topicName || generateTitle(validated.sourceText);
    const savedDeck = await saveDeck({
      title: deckTitle,
      source_text: validated.sourceText,
      topic_name: validated.topicName,
      flashcards: flashcards,
      quiz_questions: quiz,
    }, tags);

    // 9. Return response with deck ID
    return NextResponse.json({
      deckId: savedDeck.id,
      deckTitle: savedDeck.title,
      flashcards,
      quiz,
      tags,
    });

  } catch (error) {
    console.error("Generate API error:", error);

    // Handle timeout
    if (error instanceof Error && error.message === "REQUEST_TIMEOUT") {
      return NextResponse.json(
        {
          error: {
            code: "TIMEOUT_ERROR",
            message: "Generation timed out. The AI is taking too long — please try again.",
          },
        },
        { status: 408 }
      );
    }

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

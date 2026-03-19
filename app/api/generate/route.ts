import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { Flashcard, Question } from "@/types";
import { saveDeck } from "@/lib/db";

export const maxDuration = 60;

// ============ Mock Mode ============

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

async function getMockData() {
  if (!USE_MOCK) return null;
  const { mockStudyData } = await import("@/mocks/data");
  return mockStudyData;
}

// ============ Validation Schemas ============

export const GenerateRequestSchema = z.object({
  sourceText: z.string().min(100, "Content must be at least 100 characters").max(75000, "Content must not exceed 75,000 characters"),
  topicName: z.string().max(100).optional(),
});

const FlashcardSchema = z.object({
  id: z.string().optional(),
  front: z.string().max(200, "Flashcard front must not exceed 200 characters"),
  back: z.string().max(500, "Flashcard back must not exceed 500 characters"),
});

const QuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().max(500, "Question must not exceed 500 characters"),
  options: z.array(z.string().max(200)).length(4, "Question must have exactly 4 options"),
  answer: z.number().int().min(0).max(3, "Answer must be between 0 and 3"),
});

const FlashcardResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema),
  tags: z.array(z.string()).max(3).default([]),
});

// ============ Generation Counts ============

function getGenerationCounts(wordCount: number): { flashcardCount: number; quizCount: number } {
  if (wordCount < 500)  return { flashcardCount: 5,  quizCount: 3  };
  if (wordCount < 1500) return { flashcardCount: 8,  quizCount: 5  };
  if (wordCount < 3000) return { flashcardCount: 12, quizCount: 7  };
  return                       { flashcardCount: 15, quizCount: 10 };
}

// ============ Prompts ============

const FLASHCARD_SYSTEM_PROMPT = `You are an expert study assistant. Your task is to create flashcards from educational content that comprehensively cover the entire text.

Rules:
1. Return ONLY valid JSON, no markdown formatting, no preamble, no explanation
2. Before generating flashcards, mentally divide the content into major sections or themes. Distribute flashcards proportionally across ALL sections — do not cluster on the beginning of the text or on a single topic
3. Generate exactly {flashcardCount} flashcards
4. Each flashcard must have:
   - "front": The concept, term, or question (max 15 words)
   - "back": A clear, concise explanation (max 50 words)
5. Cover a broad range of concepts across the full text — if the content has 4 distinct sections, each section must contribute at least 1 flashcard
6. Prioritise concepts that are: defined explicitly, contrasted with something else, or stated as important by the author
7. Make the front side specific and testable
8. Make the back side informative but concise
9. Use simple, clear language appropriate for the target audience
10. Also suggest up to 3 tags that best describe the topic of this content.
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

const QUIZ_SYSTEM_PROMPT = `You are an expert study assistant. Your task is to create multiple-choice questions from educational content that test understanding across the entire text.

Rules:
1. Return ONLY valid JSON, no markdown formatting, no preamble, no explanation
2. Before generating questions, mentally divide the content into major sections or themes. Distribute questions proportionally across ALL sections — do not cluster on the beginning of the text or on a single topic
3. Generate exactly {quizCount} multiple-choice questions as a JSON array
4. Each question must have:
   - "question": A clear, specific question
   - "options": Exactly 4 answer choices (distractors should be plausible but clearly incorrect)
   - "answer": The index (0–3) of the correct option
5. Cover different sections of the content — if the content has 4 distinct sections, each section must contribute at least 1 question
6. Questions should test understanding and application, not just memorisation or recall of surface details
7. Make distractors common misconceptions or related but incorrect concepts
8. Ensure only one option is clearly correct
9. Do not repeat concepts already covered — each question should test a distinct idea

Output format:
[
  {"question": "What is X?", "options": ["A", "B", "C", "D"], "answer": 1},
  ...
]`;

function buildFlashcardSystemPrompt(flashcardCount: number): string {
  return FLASHCARD_SYSTEM_PROMPT.replace("{flashcardCount}", String(flashcardCount));
}

function buildQuizSystemPrompt(quizCount: number): string {
  return QUIZ_SYSTEM_PROMPT.replace("{quizCount}", String(quizCount));
}

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
    const body = await request.json();
    const validated = GenerateRequestSchema.parse(body);

    if (USE_MOCK) {
      const mockData = await getMockData();

      if (!mockData) {
        return NextResponse.json(
          { error: { code: "MOCK_DATA_ERROR", message: "Mock data not available" } },
          { status: 500 }
        );
      }

      const flashcardsWithIds = mockData.flashcards.map(fc => ({
        ...fc,
        id: fc.id || generateId("fc"),
      }));

      const questionsWithIds = mockData.quiz.map(q => ({
        ...q,
        id: q.id || generateId("q"),
      }));

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

    const anthropic = new Anthropic({ apiKey });

    const wordCount = validated.sourceText.trim().split(/\s+/).filter(Boolean).length;
    const { flashcardCount, quizCount } = getGenerationCounts(wordCount);

    const flashcardValidator = FlashcardResponseSchema.extend({
      flashcards: z.array(FlashcardSchema).min(flashcardCount).max(flashcardCount),
    });
    const quizValidator = z.array(QuestionSchema).min(quizCount).max(quizCount);

    const [flashcardData, quizData] = await Promise.all([
      callClaudeWithRetry(
        anthropic,
        buildFlashcardSystemPrompt(flashcardCount),
        `Generate exactly ${flashcardCount} flashcards from the following content:\n\n${validated.sourceText}`,
        (parsed) => {
          const result = flashcardValidator.safeParse(parsed);
          if (!result.success) throw new Error("Generated flashcards do not match required schema");
          return result.data;
        }
      ),
      callClaudeWithRetry(
        anthropic,
        buildQuizSystemPrompt(quizCount),
        `Generate exactly ${quizCount} multiple-choice questions from the following content:\n\n${validated.sourceText}`,
        (parsed) => {
          const result = quizValidator.safeParse(parsed);
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

    const deckTitle = validated.topicName || generateTitle(validated.sourceText);
    const savedDeck = await saveDeck({
      title: deckTitle,
      source_text: validated.sourceText,
      topic_name: validated.topicName,
      flashcards: flashcards,
      quiz_questions: quiz,
    }, tags);

    return NextResponse.json({
      deckId: savedDeck.id,
      deckTitle: savedDeck.title,
      flashcards,
      quiz,
      tags,
    });

  } catch (error) {
    console.error("Generate API error:", error);

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

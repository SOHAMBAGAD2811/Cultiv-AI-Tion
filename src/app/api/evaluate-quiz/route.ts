import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GOOGLE_API_KEY;

if (!geminiApiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

interface EvaluateQuizRequest {
  videoTitle: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  userAnswers: number[];
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateQuizRequest = await request.json();

    const { videoTitle, questions, userAnswers } = body;

    // Validate input
    if (
      !questions ||
      !Array.isArray(questions) ||
      !userAnswers ||
      !Array.isArray(userAnswers)
    ) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    if (questions.length !== userAnswers.length) {
      return NextResponse.json(
        { error: "Number of answers doesn't match number of questions" },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    const correctAnswers = questions.map((q) => q.correctAnswer);

    userAnswers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        score++;
      }
    });

    // Prepare detailed evaluation
    const evaluations = [];

    // Collect incorrect questions and request feedback in a single batched call to reduce latency
    const incorrectIndices: number[] = [];
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] !== questions[i].correctAnswer) incorrectIndices.push(i);
    }

    // Prepare placeholder evaluations for all questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const isCorrect = userAnswers[i] === question.correctAnswer;
      const feedback = isCorrect
        ? `Correct! "${question.options[userAnswers[i]]}" is the right answer.`
        : '';

      evaluations.push({
        questionId: question.id,
        isCorrect,
        userAnswer: question.options[userAnswers[i]],
        correctAnswer: question.options[question.correctAnswer],
        feedback,
      });
    }

    if (incorrectIndices.length > 0) {
      // Limit batch size to avoid extremely long prompts
      const indicesToAsk = incorrectIndices.slice(0, 12);

      const batchedPromptParts = indicesToAsk.map((idx, idxPos) => {
        const q = questions[idx];
        return `Q${idxPos + 1} ID:${q.id}\nQuestion: ${q.question}\nOptions:\n${q.options
          .map((opt, i) => `${i + 1}. ${opt}`)
          .join('\n')}\nUser's Answer: ${q.options[userAnswers[idx]]}\nCorrect Answer: ${q.options[q.correctAnswer]}\n`;
      });

      const batchedPrompt = `You are an educational assistant. For each labeled question below (Q1, Q2...), provide a concise, constructive 1-2 sentence explanation of why the correct answer is right and what the user might have misunderstood. Return the answers labeled in the same order: Q1:, Q2:, etc.\n\n${batchedPromptParts.join('\n---\n')}`;

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(batchedPrompt);
        const responseText = result.response.text();

        // Split responses by Q labels
        const parts = responseText.split(/Q\d+:/).map((p) => p.trim()).filter(Boolean);

        for (let i = 0; i < indicesToAsk.length; i++) {
          const origIdx = indicesToAsk[i];
          const part = parts[i] || '';
          evaluations[origIdx].feedback = part.substring(0, 500) || `The correct answer is "${questions[origIdx].options[questions[origIdx].correctAnswer]}".`;
        }
      } catch (error) {
        console.error('Error calling Gemini for batched feedback:', error);
        // Fallback: provide generic feedback for incorrect answers
        for (const origIdx of indicesToAsk) {
          evaluations[origIdx].feedback = `The correct answer is "${questions[origIdx].options[questions[origIdx].correctAnswer]}". Please review the video to understand this concept better.`;
        }
      }
    }

    return NextResponse.json({
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      evaluations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error evaluating quiz:", error);
    return NextResponse.json(
      { error: "Failed to evaluate quiz" },
      { status: 500 }
    );
  }
}

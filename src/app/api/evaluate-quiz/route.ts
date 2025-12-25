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

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = userAnswers[i];
      const isCorrect = userAnswer === question.correctAnswer;

      let feedback = "";

      if (isCorrect) {
        feedback = `Correct! "${question.options[userAnswer]}" is the right answer.`;
      } else {
        // Use Gemini to provide feedback on incorrect answers
        const prompt = `
Question: ${question.question}

Options:
${question.options.map((opt, idx) => `${idx + 1}. ${opt}`).join("\n")}

User's Answer: ${question.options[userAnswer]}
Correct Answer: ${question.options[question.correctAnswer]}

Video Topic: ${videoTitle}

Please provide a brief, educational explanation (2-3 sentences) of why the correct answer is right and what the user might have misunderstood. Be constructive and helpful.
`;

        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const result = await model.generateContent(prompt);
          feedback =
            result.response
              .text()
              .substring(0, 500) || "See correct answer above.";
        } catch (error) {
          console.error("Error calling Gemini API:", error);
          feedback = `The correct answer is "${question.options[question.correctAnswer]}". Please review the video to understand this concept better.`;
        }
      }

      evaluations.push({
        questionId: question.id,
        isCorrect,
        userAnswer: question.options[userAnswer],
        correctAnswer: question.options[question.correctAnswer],
        feedback,
      });
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

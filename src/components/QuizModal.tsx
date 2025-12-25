"use client";
import React, { useState } from "react";
import { X, ChevronRight, Loader } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: number[]) => Promise<any>;
}

export default function QuizModal({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  questions,
  onSubmitQuiz,
}: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestionIndex] !== -1;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsEvaluating(true);
    try {
      const result = await onSubmitQuiz(answers);
      setFeedback(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCloseModal = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(-1));
    setFeedback(null);
    onClose();
  };

  // Feedback View
  if (feedback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Quiz Feedback</h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              <strong>Video:</strong> {videoTitle}
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              Score: {feedback.score}/{questions.length}
            </p>
          </div>

          <div className="space-y-4">
            {feedback.evaluations?.map((evaluation: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  evaluation.isCorrect
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <p className="font-semibold text-gray-900 mb-2">
                  Q{index + 1}: {questions[index].question}
                </p>
                <p className="text-sm mb-2">
                  <strong>Your Answer:</strong> {questions[index].options[answers[index]]}
                </p>
                <p className="text-sm mb-2">
                  <strong>Correct Answer:</strong>{" "}
                  {questions[index].options[questions[index].correctAnswer]}
                </p>
                {evaluation.feedback && (
                  <div className="mt-2 p-2 bg-white rounded text-sm text-gray-700">
                    <strong>Feedback from AI:</strong>
                    <p className="mt-1">{evaluation.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleCloseModal}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quiz: {videoTitle}</h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  answers[currentQuestionIndex] === optionIndex
                    ? "bg-green-100 border-green-500"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  checked={answers[currentQuestionIndex] === optionIndex}
                  onChange={() => handleSelectAnswer(optionIndex)}
                  className="w-4 h-4 text-green-500 cursor-pointer"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              currentQuestionIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition ${
                !isAnswered
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              {isEvaluating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Submit Quiz"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

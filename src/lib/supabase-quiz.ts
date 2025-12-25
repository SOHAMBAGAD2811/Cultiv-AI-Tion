import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuizAttempt {
  user_id: string;
  video_id: string;
  video_title: string;
  answers: number[];
  correct_answers: number[];
  score: number;
  total_questions: number;
  feedback: any;
  attempted_at: string;
}

/**
 * Save quiz attempt to Supabase
 */
export async function saveQuizAttempt(attempt: QuizAttempt) {
  try {
    const { data, error } = await supabase.from("quiz_attempts").insert([
      {
        user_id: attempt.user_id,
        video_id: attempt.video_id,
        video_title: attempt.video_title,
        answers: attempt.answers,
        correct_answers: attempt.correct_answers,
        score: attempt.score,
        total_questions: attempt.total_questions,
        feedback: attempt.feedback,
        attempted_at: attempt.attempted_at,
      },
    ]);

    if (error) {
      console.error("Error saving quiz attempt:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in saveQuizAttempt:", err);
    return null;
  }
}

/**
 * Get quiz attempts for a specific video
 */
export async function getQuizAttempts(userId: string, videoId?: string) {
  try {
    // Select only required columns to reduce payload and latency
    let query = supabase
      .from("quiz_attempts")
      .select("user_id,video_id,video_title,score,total_questions,attempted_at")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false });

    if (videoId) {
      query = query.eq("video_id", videoId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching quiz attempts:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getQuizAttempts:", err);
    return [];
  }
}

/**
 * Get user's best score for a video
 */
export async function getUserBestScore(userId: string, videoId: string) {
  try {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("score, total_questions")
      .eq("user_id", userId)
      .eq("video_id", videoId)
      .order("score", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching best score:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in getUserBestScore:", err);
    return null;
  }
}

/**
 * Get quiz statistics for a user
 */
export async function getUserQuizStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("score, total_questions")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching quiz stats:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const totalAttempts = data.length;
    const totalScore = data.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalQuestions = data.reduce(
      (sum, attempt) => sum + attempt.total_questions,
      0
    );
    const averageScore =
      totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    return {
      totalAttempts,
      totalScore,
      totalQuestions,
      averageScore: Math.round(averageScore * 100) / 100,
    };
  } catch (err) {
    console.error("Error in getUserQuizStats:", err);
    return null;
  }
}

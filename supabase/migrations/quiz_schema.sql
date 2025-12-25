-- Quiz Attempts Table
-- Run this SQL in your Supabase dashboard to create the table

CREATE TABLE quiz_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id VARCHAR(255) NOT NULL,
  video_title TEXT NOT NULL,
  answers INTEGER[] NOT NULL,
  correct_answers INTEGER[] NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  feedback JSONB,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_video_id ON quiz_attempts(video_id);
CREATE INDEX idx_quiz_attempts_user_video ON quiz_attempts(user_id, video_id);
CREATE INDEX idx_quiz_attempts_attempted_at ON quiz_attempts(attempted_at);

-- Enable RLS (Row Level Security)
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy: Users can insert their own attempts
CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can update their own attempts
CREATE POLICY "Users can update their own quiz attempts"
  ON quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

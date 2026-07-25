-- QuizMind AI - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up tables, indexes, and real-time subscriptions.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  access_code VARCHAR(6) UNIQUE NOT NULL,
  document_url TEXT,
  time_limit_mins INT NOT NULL DEFAULT 10,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by 6-digit access code
CREATE INDEX IF NOT EXISTS idx_quizzes_access_code ON public.quizzes (access_code);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings e.g. ["Option A", "Option B", ...]
  correct_option_index INT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for questions by quiz_id
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions (quiz_id);

-- 4. ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  time_spent_seconds INT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for attempt leaderboards by quiz_id and score
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_score ON public.attempts (quiz_id, score DESC, time_spent_seconds ASC);

-- Enable Realtime for live Leaderboards
ALTER PUBLICATION supabase_realtime ADD TABLE public.attempts;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published quizzes and their questions (for students)
CREATE POLICY "Public read published quizzes" ON public.quizzes
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public read questions for quizzes" ON public.questions
  FOR SELECT USING (true);

-- Allow student quiz submissions & reading attempts for leaderboard
CREATE POLICY "Public create attempts" ON public.attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read attempts for leaderboard" ON public.attempts
  FOR SELECT USING (true);

-- Admin policies (Full CRUD)
CREATE POLICY "Admins full control on quizzes" ON public.quizzes
  FOR ALL USING (true);

CREATE POLICY "Admins full control on questions" ON public.questions
  FOR ALL USING (true);

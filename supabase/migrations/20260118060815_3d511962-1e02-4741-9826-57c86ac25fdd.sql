-- Create leaderboard table for global rankings
CREATE TABLE public.leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
  score integer NOT NULL CHECK (score > 0),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view leaderboard (public game)
CREATE POLICY "Anyone can view leaderboard" 
  ON public.leaderboard FOR SELECT 
  USING (true);

-- Allow anyone to submit scores (public game, no auth required)
CREATE POLICY "Anyone can submit scores" 
  ON public.leaderboard FOR INSERT 
  WITH CHECK (true);

-- Index for fast time-based and score queries
CREATE INDEX idx_leaderboard_created_at ON public.leaderboard(created_at DESC);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);

-- Composite index for time-filtered score queries
CREATE INDEX idx_leaderboard_score_created ON public.leaderboard(score DESC, created_at DESC);
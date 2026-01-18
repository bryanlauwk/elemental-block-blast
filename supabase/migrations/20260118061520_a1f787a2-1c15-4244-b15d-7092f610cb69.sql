-- Create daily challenge scores table
CREATE TABLE public.daily_challenge_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
  score integer NOT NULL CHECK (score > 0),
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Unique constraint: one score per player per day (best score wins)
  UNIQUE (player_name, challenge_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_challenge_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view daily challenge scores
CREATE POLICY "Anyone can view daily challenge scores" 
  ON public.daily_challenge_scores FOR SELECT 
  USING (true);

-- Allow anyone to submit daily challenge scores
CREATE POLICY "Anyone can submit daily challenge scores" 
  ON public.daily_challenge_scores FOR INSERT 
  WITH CHECK (true);

-- Allow updating own score (for improving score)
CREATE POLICY "Anyone can update their daily score" 
  ON public.daily_challenge_scores FOR UPDATE 
  USING (true);

-- Indexes for fast queries
CREATE INDEX idx_daily_challenge_date ON public.daily_challenge_scores(challenge_date DESC);
CREATE INDEX idx_daily_challenge_score ON public.daily_challenge_scores(challenge_date, score DESC);
CREATE INDEX idx_daily_challenge_player ON public.daily_challenge_scores(player_name, challenge_date);
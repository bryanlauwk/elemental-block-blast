-- Add maximum score constraints to prevent impossibly high scores
-- A reasonable maximum for a block puzzle game is 10,000,000 points
-- Also add minimum score constraint to ensure score > 0

-- Add score range constraint to leaderboard table
ALTER TABLE public.leaderboard 
ADD CONSTRAINT leaderboard_score_range 
CHECK (score > 0 AND score <= 10000000);

-- Add score range constraint to daily_challenge_scores table  
ALTER TABLE public.daily_challenge_scores 
ADD CONSTRAINT daily_challenge_scores_score_range 
CHECK (score > 0 AND score <= 10000000);

-- Add player_name length constraint to prevent excessively long names
ALTER TABLE public.leaderboard 
ADD CONSTRAINT leaderboard_player_name_length 
CHECK (char_length(player_name) >= 1 AND char_length(player_name) <= 20);

-- Add player_name length constraint to daily_challenge_scores
ALTER TABLE public.daily_challenge_scores 
ADD CONSTRAINT daily_challenge_scores_player_name_length 
CHECK (char_length(player_name) >= 1 AND char_length(player_name) <= 20);
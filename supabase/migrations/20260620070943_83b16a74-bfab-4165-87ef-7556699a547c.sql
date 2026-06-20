
-- 1. Harden has_role against admin enumeration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS DISTINCT FROM auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 2. Remove unrestricted UPDATE & INSERT policies on daily_challenge_scores
DROP POLICY IF EXISTS "Anyone can update their daily score" ON public.daily_challenge_scores;
DROP POLICY IF EXISTS "Anyone can submit daily challenge scores" ON public.daily_challenge_scores;

-- 3. Create a SECURITY DEFINER RPC that validates and upserts daily scores
CREATE OR REPLACE FUNCTION public.submit_daily_score(
  _player_name text,
  _score integer,
  _challenge_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(success boolean, is_new_best boolean, rank bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _clean_name text;
  _existing_score integer;
  _existing_id uuid;
  _saved boolean := false;
BEGIN
  -- Sanitize name: strip dangerous chars, trim, cap length
  _clean_name := regexp_replace(coalesce(_player_name, ''), '[<>''"&\\\x00-\x1F\x7F]', '', 'g');
  _clean_name := btrim(_clean_name);
  _clean_name := left(_clean_name, 20);

  IF length(_clean_name) = 0 THEN
    RAISE EXCEPTION 'Invalid player name';
  END IF;

  IF _score IS NULL OR _score < 1 OR _score > 10000000 THEN
    RAISE EXCEPTION 'Invalid score';
  END IF;

  IF _challenge_date <> CURRENT_DATE THEN
    RAISE EXCEPTION 'Scores can only be submitted for today';
  END IF;

  SELECT id, score INTO _existing_id, _existing_score
  FROM public.daily_challenge_scores
  WHERE player_name = _clean_name AND challenge_date = _challenge_date
  LIMIT 1;

  IF _existing_id IS NULL THEN
    INSERT INTO public.daily_challenge_scores (player_name, score, challenge_date)
    VALUES (_clean_name, _score, _challenge_date);
    _saved := true;
  ELSIF _score > _existing_score THEN
    UPDATE public.daily_challenge_scores
    SET score = _score
    WHERE id = _existing_id;
    _saved := true;
  END IF;

  RETURN QUERY
  SELECT
    true,
    _saved,
    (SELECT count(*) + 1 FROM public.daily_challenge_scores
     WHERE challenge_date = _challenge_date AND score > _score);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_daily_score(text, integer, date) TO anon, authenticated;


CREATE OR REPLACE FUNCTION public.submit_leaderboard_score(_player_name text, _score integer)
RETURNS TABLE(success boolean, rank bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _clean_name text;
BEGIN
  _clean_name := regexp_replace(coalesce(_player_name, ''), '[<>''"&\\\x00-\x1F\x7F]', '', 'g');
  _clean_name := btrim(_clean_name);
  _clean_name := left(_clean_name, 20);

  IF length(_clean_name) = 0 THEN
    RAISE EXCEPTION 'Invalid player name';
  END IF;

  IF _score IS NULL OR _score < 1 OR _score > 10000000 THEN
    RAISE EXCEPTION 'Invalid score';
  END IF;

  INSERT INTO public.leaderboard (player_name, score)
  VALUES (_clean_name, _score);

  RETURN QUERY
  SELECT
    true,
    (SELECT count(*) + 1 FROM public.leaderboard WHERE score > _score);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_leaderboard_score(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_leaderboard_score(text, integer) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit scores" ON public.leaderboard;


REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_daily_score(text, integer, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_daily_score(text, integer, date) TO anon, authenticated;

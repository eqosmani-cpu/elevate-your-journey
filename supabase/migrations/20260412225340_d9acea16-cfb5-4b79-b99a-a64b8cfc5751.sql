
-- Badges definition table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '🏅',
  category text NOT NULL DEFAULT 'achievement',
  threshold integer DEFAULT 1
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are publicly readable"
  ON public.badges FOR SELECT
  USING (true);

-- User badges (earned)
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges for user"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add streak freeze and leaderboard opt-out to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_freeze_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS show_on_leaderboard boolean NOT NULL DEFAULT true;

-- Seed badges
INSERT INTO public.badges (slug, name, description, emoji, category, threshold) VALUES
  ('streak_7', '7-Tage Streak', '7 Tage in Folge trainiert', '🔥', 'streak', 7),
  ('streak_30', '30-Tage Streak', '30 Tage in Folge trainiert', '🔥', 'streak', 30),
  ('streak_100', '100-Tage Streak', '100 Tage in Folge trainiert', '🔥', 'streak', 100),
  ('block_breaker', 'Block Breaker', 'Ein Block Breaker Programm abgeschlossen', '🧠', 'achievement', 1),
  ('helpful', 'Hilfreich', '10+ positiv bewertete Forum-Antworten', '💬', 'community', 10),
  ('community_star', 'Community-Star', '50+ Upvotes insgesamt erhalten', '⭐', 'community', 50),
  ('elite_player', 'Elite-Spieler', 'Elite-Tier erreicht', '🏆', 'tier', 1),
  ('focus_king', 'Fokus-König', '5 Fokus-Aufgaben abgeschlossen', '🎯', 'category', 5),
  ('unbreakable', 'Unerschütterlich', '5 Druck-Aufgaben abgeschlossen', '💪', 'category', 5),
  ('streak_3', '3-Tage Streak', '3 Tage in Folge trainiert', '🔥', 'streak', 3),
  ('streak_14', '14-Tage Streak', '14 Tage in Folge trainiert', '🔥', 'streak', 14),
  ('streak_60', '60-Tage Streak', '60 Tage in Folge trainiert', '🔥', 'streak', 60);

-- Award badge function (idempotent)
CREATE OR REPLACE FUNCTION public.award_badge(_user_id uuid, _badge_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _badge_id uuid;
BEGIN
  SELECT id INTO _badge_id FROM public.badges WHERE slug = _badge_slug;
  IF _badge_id IS NULL THEN RETURN false; END IF;

  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (_user_id, _badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RETURN true;
END;
$$;

-- Update add_xp with new level thresholds
CREATE OR REPLACE FUNCTION public.add_xp(_user_id uuid, _points integer, _reason text, _source xp_source)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_xp INT;
  _new_level INT;
  _old_level INT;
BEGIN
  SELECT level INTO _old_level FROM public.profiles WHERE id = _user_id;

  INSERT INTO public.xp_log (user_id, points, reason, source)
  VALUES (_user_id, _points, _reason, _source);

  UPDATE public.profiles
  SET xp_points = xp_points + _points
  WHERE id = _user_id
  RETURNING xp_points INTO _new_xp;

  -- New level thresholds
  IF _new_xp > 2000 THEN _new_level := 5;
  ELSIF _new_xp > 1000 THEN _new_level := 4;
  ELSIF _new_xp > 500 THEN _new_level := 3;
  ELSIF _new_xp > 200 THEN _new_level := 2;
  ELSE _new_level := 1;
  END IF;

  UPDATE public.profiles SET level = _new_level WHERE id = _user_id;
END;
$$;

-- Weekly leaderboard function
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, user_name text, weekly_xp bigint, rank bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    x.user_id,
    COALESCE(p.name, 'Anonym') as user_name,
    SUM(x.points) as weekly_xp,
    ROW_NUMBER() OVER (ORDER BY SUM(x.points) DESC) as rank
  FROM public.xp_log x
  JOIN public.profiles p ON p.id = x.user_id AND p.show_on_leaderboard = true
  WHERE x.created_at >= date_trunc('week', now())
  GROUP BY x.user_id, p.name
  ORDER BY weekly_xp DESC
  LIMIT _limit;
$$;

-- Get user rank function
CREATE OR REPLACE FUNCTION public.get_user_rank(_user_id uuid)
RETURNS TABLE(rank bigint, weekly_xp bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rank, weekly_xp FROM (
    SELECT
      x.user_id,
      SUM(x.points) as weekly_xp,
      ROW_NUMBER() OVER (ORDER BY SUM(x.points) DESC) as rank
    FROM public.xp_log x
    WHERE x.created_at >= date_trunc('week', now())
    GROUP BY x.user_id
  ) ranked
  WHERE user_id = _user_id;
$$;

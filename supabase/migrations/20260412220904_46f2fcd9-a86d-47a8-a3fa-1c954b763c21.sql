-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'striker', 'other');
CREATE TYPE public.tier_level AS ENUM ('free', 'pro', 'elite');
CREATE TYPE public.task_category AS ENUM ('focus', 'confidence', 'pressure', 'team', 'recovery', 'visualization');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.block_category AS ENUM ('form_loss', 'fear_of_failure', 'external_pressure', 'injury_return', 'concentration', 'identity_crisis');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.forum_category AS ENUM ('question', 'experience', 'motivation', 'tip', 'challenge');
CREATE TYPE public.reaction_type AS ENUM ('upvote', 'fire', 'helpful', 'relatable');
CREATE TYPE public.xp_source AS ENUM ('task', 'block_step', 'coaching', 'forum_post', 'forum_answer', 'streak_bonus', 'login');
CREATE TYPE public.notification_type AS ENUM ('task_reminder', 'streak', 'new_reply', 'coaching_reminder', 'achievement');

-- =============================================
-- HELPER: updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- TABLE: profiles
-- =============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INT,
  position player_position,
  tier tier_level NOT NULL DEFAULT 'free',
  xp_points INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  streak_current INT NOT NULL DEFAULT 0,
  streak_longest INT NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TABLE: tasks
-- =============================================
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL,
  duration_min INT NOT NULL,
  difficulty difficulty_level NOT NULL,
  tier_required tier_level NOT NULL DEFAULT 'free',
  instructions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are publicly readable"
  ON public.tasks FOR SELECT
  USING (true);

-- =============================================
-- TABLE: task_completions
-- =============================================
CREATE TABLE public.task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reflection_note TEXT,
  mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INT CHECK (mood_after BETWEEN 1 AND 5)
);

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TABLE: block_programs
-- =============================================
CREATE TABLE public.block_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  block_category block_category NOT NULL,
  steps JSONB NOT NULL,
  tier_required tier_level NOT NULL DEFAULT 'pro'
);

ALTER TABLE public.block_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block programs are publicly readable"
  ON public.block_programs FOR SELECT
  USING (true);

-- =============================================
-- TABLE: block_progress
-- =============================================
CREATE TABLE public.block_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.block_programs(id) ON DELETE CASCADE,
  current_step INT NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  diagnosis_result JSONB
);

ALTER TABLE public.block_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own block progress"
  ON public.block_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own block progress"
  ON public.block_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own block progress"
  ON public.block_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- TABLE: coaches
-- =============================================
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  specialization TEXT[],
  price_eur INT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  avatar_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  calendly_url TEXT
);

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches are publicly readable"
  ON public.coaches FOR SELECT
  USING (true);

-- =============================================
-- TABLE: bookings
-- =============================================
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  duration_min INT NOT NULL DEFAULT 45,
  status booking_status NOT NULL DEFAULT 'pending',
  meeting_link TEXT,
  notes TEXT,
  price_paid INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- TABLE: forum_posts
-- =============================================
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category forum_category NOT NULL,
  tags TEXT[],
  upvotes INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Forum posts are publicly readable"
  ON public.forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own forum posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLE: forum_comments
-- =============================================
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INT NOT NULL DEFAULT 0,
  is_coach_reply BOOLEAN NOT NULL DEFAULT false,
  is_accepted_answer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Forum comments are publicly readable"
  ON public.forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own comments"
  ON public.forum_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.forum_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.forum_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TABLE: forum_reactions
-- =============================================
CREATE TABLE public.forum_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  type reaction_type NOT NULL,
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id, comment_id, type)
);

ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are publicly readable"
  ON public.forum_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reactions"
  ON public.forum_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.forum_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TABLE: xp_log
-- =============================================
CREATE TABLE public.xp_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INT NOT NULL,
  reason TEXT,
  source xp_source NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own xp log"
  ON public.xp_log FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- TABLE: notifications
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION: add_xp
-- =============================================
CREATE OR REPLACE FUNCTION public.add_xp(
  _user_id UUID,
  _points INT,
  _reason TEXT,
  _source xp_source
)
RETURNS void AS $$
DECLARE
  _new_xp INT;
  _new_level INT;
BEGIN
  INSERT INTO public.xp_log (user_id, points, reason, source)
  VALUES (_user_id, _points, _reason, _source);

  UPDATE public.profiles
  SET xp_points = xp_points + _points
  WHERE id = _user_id
  RETURNING xp_points INTO _new_xp;

  _new_level := GREATEST(1, (_new_xp / 500) + 1);

  UPDATE public.profiles
  SET level = _new_level
  WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- FUNCTION: check_and_update_streak
-- =============================================
CREATE OR REPLACE FUNCTION public.check_and_update_streak(_user_id UUID)
RETURNS void AS $$
DECLARE
  _last_active TIMESTAMPTZ;
  _current_streak INT;
  _longest_streak INT;
BEGIN
  SELECT last_active, streak_current, streak_longest
  INTO _last_active, _current_streak, _longest_streak
  FROM public.profiles
  WHERE id = _user_id;

  IF _last_active IS NULL OR _last_active::date < (now() - INTERVAL '1 day')::date THEN
    _current_streak := 1;
  ELSIF _last_active::date = (now() - INTERVAL '1 day')::date THEN
    _current_streak := _current_streak + 1;
  END IF;

  IF _current_streak > _longest_streak THEN
    _longest_streak := _current_streak;
  END IF;

  UPDATE public.profiles
  SET
    streak_current = _current_streak,
    streak_longest = _longest_streak,
    last_active = now()
  WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- FUNCTION: get_user_stats
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_stats(_user_id UUID)
RETURNS JSON AS $$
DECLARE
  _result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p)
      FROM (SELECT id, name, tier, xp_points, level, streak_current, streak_longest, last_active
            FROM public.profiles WHERE id = _user_id) p
    ),
    'tasks_completed', (
      SELECT COUNT(*) FROM public.task_completions WHERE user_id = _user_id
    ),
    'tasks_this_week', (
      SELECT COUNT(*) FROM public.task_completions
      WHERE user_id = _user_id
        AND completed_at >= date_trunc('week', now())
    ),
    'total_xp', (
      SELECT COALESCE(SUM(points), 0) FROM public.xp_log WHERE user_id = _user_id
    ),
    'forum_posts', (
      SELECT COUNT(*) FROM public.forum_posts WHERE user_id = _user_id
    ),
    'bookings_count', (
      SELECT COUNT(*) FROM public.bookings WHERE user_id = _user_id
    ),
    'active_blocks', (
      SELECT COUNT(*) FROM public.block_progress
      WHERE user_id = _user_id AND completed_at IS NULL
    )
  ) INTO _result;

  RETURN _result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_task_completions_user ON public.task_completions(user_id);
CREATE INDEX idx_task_completions_task ON public.task_completions(task_id);
CREATE INDEX idx_block_progress_user ON public.block_progress(user_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_forum_posts_user ON public.forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX idx_xp_log_user ON public.xp_log(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE read = false;
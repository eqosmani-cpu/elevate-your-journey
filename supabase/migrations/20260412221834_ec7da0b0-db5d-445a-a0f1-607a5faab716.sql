
-- Add anonymous posting support
ALTER TABLE public.forum_posts ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;

-- Add comment count for quick display
ALTER TABLE public.forum_posts ADD COLUMN comment_count integer NOT NULL DEFAULT 0;

-- Create reports table
CREATE TABLE public.forum_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL,
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.forum_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.forum_reports FOR SELECT
USING (auth.uid() = reporter_id);

-- Function to increment comment count
CREATE OR REPLACE FUNCTION public.increment_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_comment
AFTER INSERT ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.increment_comment_count();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;

-- Add onboarding-specific fields to profiles
CREATE TYPE public.skill_level AS ENUM ('amateur', 'aspiring', 'semi_pro', 'pro');

ALTER TABLE public.profiles
  ADD COLUMN challenges TEXT[],
  ADD COLUMN four_week_goal TEXT,
  ADD COLUMN skill_level skill_level;
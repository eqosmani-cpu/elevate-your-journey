# Project Memory

## Core
MindPitch: Mental coaching app for football players. Dark theme default.
Primary: Electric green (#00FF87/oklch 0.85 0.22 155). BG: #0A0E1A.
Space Grotesk headings, Inter body. German UI, English code.
Nike-meets-Headspace sports-tech aesthetic. Rounded corners 12px/20px cards.
Bottom nav mobile, sidebar desktop. Routes: /, /community, /training, /coaching, /profile, /onboarding, /login, /blocks, /progress.
Lovable Cloud enabled. Auth with email/password. Profile auto-created on signup.

## Memories
- [Design tokens](mem://design/tokens) — Full color palette, glow effects, glass surfaces, tier colors
- [Components](mem://design/components) — GreenButton, TaskCard, UserAvatar, StreakBadge, TierBadge, ProgressRing
- [Navigation](mem://design/navigation) — BottomNav (mobile), DesktopSidebar, AppShell layout
- [DB Schema](mem://features/db-schema) — 14 tables (badges, user_badges added), RLS, enums, add_xp/check_streak/get_stats/award_badge/get_weekly_leaderboard functions
- [Onboarding](mem://features/onboarding) — 6-step animated flow, saves to profiles, awards 50 XP
- [Dashboard](mem://features/dashboard) — Header, TodayCard, StatsRow, CommunityHighlight, Quote, QuickActions, XpLevelBar
- [Forum](mem://features/forum) — Community page with filters/sort/pagination, post detail with reactions/comments, new post dialog, XP rewards, coach badges, anonymous posting, realtime comments
- [Tier system](mem://features/tier-system) — Free/Pro/Elite tiers. UpgradeModal component, useTierGate hook. Free: 3 tasks/wk, 1 post/wk, 1 AI/wk. Pro: unlimited + Block Breaker + coaching. Elite: priority coaching + check-ins.
- [Gamification](mem://features/gamification) — 5-level system (Rookie→Legend), 12 badges, streak milestones (3/7/14/30/60/100), weekly leaderboard, XP chart, heatmap, LevelUpOverlay animation, daily login XP

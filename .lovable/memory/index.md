# Project Memory

## Core
MindPitch: Mental coaching app for football players. Light theme (Apple-inspired).
Primary: Deep forest green (#3A5C4A). BG: #F5F4F0 (warm off-white). Cards: #FFFFFF.
DM Serif Display headings, DM Sans body (300-500 weight). German UI, English code.
Apple "Clarity, Deference, Depth" aesthetic. Rounded corners 16px cards, 24px large, 28px modals.
Bottom nav mobile, sidebar desktop. No neon, no gradients, no glow effects. Subtle shadows only.
Lovable Cloud enabled. Auth with email/password. Profile auto-created on signup.
Admin role via user_roles table + has_role() security definer function.

## Memories
- [Design tokens](mem://design/tokens) — Apple palette: #F5F4F0 bg, #3A5C4A accent, #B8976A gold, subtle shadows, 8pt grid
- [Components](mem://design/components) — GreenButton, TaskCard, UserAvatar, StreakBadge, TierBadge, ProgressRing
- [Navigation](mem://design/navigation) — BottomNav (mobile), DesktopSidebar, AppShell layout
- [DB Schema](mem://features/db-schema) — 15 tables (user_roles added), RLS, enums, add_xp/check_streak/get_stats/award_badge/get_weekly_leaderboard/has_role functions
- [Onboarding](mem://features/onboarding) — 6-step animated flow, saves to profiles, awards 50 XP
- [Dashboard](mem://features/dashboard) — Header, TodayCard, StatsRow, CommunityHighlight, Quote, QuickActions, XpLevelBar
- [Forum](mem://features/forum) — Community page with filters/sort/pagination, post detail with reactions/comments
- [Tier system](mem://features/tier-system) — Free/Pro/Elite tiers. UpgradeModal, useTierGate hook
- [Gamification](mem://features/gamification) — 5-level system, 12 badges, streak milestones, weekly leaderboard
- [Admin panel](mem://features/admin) — /admin route, role-protected dashboard/users/content/forum/coaches/analytics

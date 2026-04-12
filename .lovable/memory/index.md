# Project Memory

## Core
MindPitch: Mental coaching app for football players. Dark theme default.
Primary: Electric green (#00FF87/oklch 0.85 0.22 155). BG: #0A0E1A.
Space Grotesk headings, Inter body. German UI, English code.
Nike-meets-Headspace sports-tech aesthetic. Rounded corners 12px/20px cards.
Bottom nav mobile, sidebar desktop. Routes: /, /community, /community/$postId, /training, /coaching, /profile, /onboarding, /login.
Lovable Cloud enabled. Auth with email/password. Profile auto-created on signup.

## Memories
- [Design tokens](mem://design/tokens) — Full color palette, glow effects, glass surfaces, tier colors
- [Components](mem://design/components) — GreenButton, TaskCard, UserAvatar, StreakBadge, TierBadge, ProgressRing
- [Navigation](mem://design/navigation) — BottomNav (mobile), DesktopSidebar, AppShell layout
- [DB Schema](mem://features/db-schema) — 12 tables + forum_reports, RLS, enums, add_xp/check_streak/get_stats functions
- [Onboarding](mem://features/onboarding) — 6-step animated flow, saves to profiles, awards 50 XP
- [Dashboard](mem://features/dashboard) — Header, TodayCard, StatsRow, CommunityHighlight, Quote, QuickActions, XpLevelBar
- [Forum](mem://features/forum) — Community page with filters/sort/pagination, post detail with reactions/comments, new post dialog, XP rewards, coach badges, anonymous posting, realtime comments

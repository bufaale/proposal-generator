# AI Proposal Generator - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-powered proposal generator for freelancers — generate, customize, export, share, and track professional proposals.

**Architecture:** Clone app-09-saas-boilerplate, replace domain models with proposals/clients/templates, add AI generation via `generateObject()`, client portal at `/p/[token]`, PDF export via `@react-pdf/renderer`, and proposal event tracking.

**Tech Stack:** Next.js 16, Tailwind CSS 4, shadcn/ui, Supabase (PostgreSQL + Auth + RLS), Vercel AI SDK 6, Claude Sonnet 4.5/Haiku 4.5, Stripe, `@react-pdf/renderer`, Resend

---

## Task 1: Clone Boilerplate & Rebrand

**Files:**
- Copy: entire `app-09-saas-boilerplate/` → `app-05-proposal-generator/`
- Modify: `package.json`
- Modify: `src/config/site.ts`
- Modify: `src/app/layout.tsx`
- Modify: `README.md`
- Modify: `.env.example`
- Delete: `src/app/(dashboard)/ai-chat/page.tsx`
- Delete: `src/components/ai/chat.tsx`
- Delete: `src/app/api/chat/route.ts`
- Delete: `src/app/api/ai/structured/route.ts`
- Delete: `src/app/(dashboard)/settings/api-keys/page.tsx`
- Delete: `src/app/(dashboard)/admin/page.tsx`
- Delete: `supabase/migrations/00001_initial_schema.sql`
- Delete: `supabase/migrations/00002_admin_rls_policy.sql`

**Step 1: Copy boilerplate to app-05**

The app-05 directory already has `docs/` and `.git/`. We need to copy the boilerplate files without overwriting these.

```bash
cd c:/Projects/apps-portfolio
# Copy everything except .git from boilerplate
cd app-09-saas-boilerplate
tar -cf - --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.env.local' . | (cd ../app-05-proposal-generator && tar -xf -)
```

**Step 2: Update package.json**

```json
{
  "name": "app-05-proposal-generator",
  "version": "0.1.0",
  "private": true
}
```

Add new dependency (keep all existing deps):
```bash
cd c:/Projects/apps-portfolio/app-05-proposal-generator
npm install @react-pdf/renderer
```

**Step 3: Update site config**

`src/config/site.ts`:
```typescript
export const siteConfig = {
  name: "ProposalAI",
  description:
    "AI-powered proposal generator for freelancers. Create, customize, and send professional proposals in minutes.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/bufaale/proposal-generator",
    twitter: "https://twitter.com/yourusername",
  },
} as const;
```

**Step 4: Update root layout metadata**

`src/app/layout.tsx` — change metadata only:
```typescript
export const metadata: Metadata = {
  title: "ProposalAI - AI Proposal Generator for Freelancers",
  description:
    "Create professional proposals in minutes with AI. Generate, customize, export PDF, share with clients, and track engagement.",
};
```

**Step 5: Delete boilerplate-specific files**

```bash
rm src/app/\(dashboard\)/ai-chat/page.tsx
rm src/components/ai/chat.tsx
rm src/app/api/chat/route.ts
rm src/app/api/ai/structured/route.ts
rm src/app/\(dashboard\)/settings/api-keys/page.tsx
rm src/app/\(dashboard\)/admin/page.tsx
rm supabase/migrations/00001_initial_schema.sql
rm supabase/migrations/00002_admin_rls_policy.sql
```

Remove the `ai-chat` directory and `ai/` directory and empty parents:
```bash
rmdir src/app/\(dashboard\)/ai-chat
rmdir src/components/ai
rmdir src/app/api/ai
rmdir src/app/\(dashboard\)/settings/api-keys
rmdir src/app/\(dashboard\)/admin
```

**Step 6: Update .env.example**

Replace the env example with proposal-generator-specific env vars:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PORTAL_CONFIG_ID=bpc_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 7: Install dependencies and verify build**

```bash
cd c:/Projects/apps-portfolio/app-05-proposal-generator
npm install
npm run build
```

Expected: Build may have import errors from deleted files. That's OK — we'll fix in Step 8.

**Step 8: Fix any broken imports**

Remove references to deleted files:
- `src/app/(dashboard)/layout.tsx` — remove ai-chat sidebar link
- `src/components/dashboard/app-sidebar.tsx` — remove AI Chat and Admin nav items
- `src/lib/supabase/middleware.ts` — remove `/ai-chat` and `/admin` from protected routes
- `src/middleware.ts` — remove `/admin/:path*` from matcher
- `src/lib/ai/rate-limit.ts` — keep for now (used by proposal generation later)
- `src/lib/ai/providers.ts` — keep for now

**Step 9: Verify clean build**

```bash
npm run build
```

Expected: Build passes with zero errors.

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: clone boilerplate and rebrand as ProposalAI

Clone app-09-saas-boilerplate, rename to app-05-proposal-generator,
remove boilerplate-specific features (ai-chat, admin, api-keys),
rebrand to ProposalAI, add @react-pdf/renderer dependency.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Database Schema — Supabase Migrations

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`
- Create: `supabase/migrations/00002_app_tables.sql`
- Create: `supabase/migrations/00003_admin_rls.sql`
- Create: `supabase/migrations/00004_system_templates.sql`

**Step 1: Create base schema migration (profiles + subscriptions from boilerplate)**

`supabase/migrations/00001_initial_schema.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles (extended from boilerplate with brand fields)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  company_name text,
  company_logo_url text,
  primary_color text not null default '#2563eb',
  secondary_color text not null default '#1e40af',
  stripe_customer_id text unique,
  subscription_status text not null default 'free'
    check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'free')),
  subscription_plan text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- Subscriptions
-- ============================================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  status text not null default 'incomplete'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();
```

**Step 2: Create app-specific tables migration**

`supabase/migrations/00002_app_tables.sql`:
```sql
-- ============================================================
-- Clients (CRM lite)
-- ============================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  company text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Users can manage own clients" on public.clients
  for all using (auth.uid() = user_id);

-- ============================================================
-- Templates
-- ============================================================
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  description text,
  industry text check (industry in ('technology', 'design', 'marketing', 'consulting', 'content')),
  sections_schema jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;
-- Users see system templates (user_id IS NULL) + their own
create policy "Users can view accessible templates" on public.templates
  for select using (user_id is null or auth.uid() = user_id);
create policy "Users can manage own templates" on public.templates
  for insert with check (auth.uid() = user_id);
create policy "Users can update own templates" on public.templates
  for update using (auth.uid() = user_id);
create policy "Users can delete own templates" on public.templates
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Proposals
-- ============================================================
create table public.proposals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  template_id uuid references public.templates(id) on delete set null,
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'viewed', 'accepted', 'declined')),
  sections jsonb not null default '[]'::jsonb,
  pricing_type text check (pricing_type in ('fixed', 'hourly', 'milestone')),
  pricing_data jsonb not null default '{}'::jsonb,
  share_token text unique,
  share_password text,
  brand_settings jsonb not null default '{}'::jsonb,
  valid_until date,
  brief jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposals enable row level security;
create policy "Users can manage own proposals" on public.proposals
  for all using (auth.uid() = user_id);

create trigger proposals_updated_at
  before update on public.proposals
  for each row execute procedure public.update_updated_at();

-- Index for share token lookups (public portal)
create index idx_proposals_share_token on public.proposals(share_token)
  where share_token is not null;

-- ============================================================
-- Proposal Events (tracking)
-- ============================================================
create table public.proposal_events (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references public.proposals(id) on delete cascade not null,
  event_type text not null
    check (event_type in ('viewed', 'accepted', 'declined', 'commented')),
  viewer_ip text,
  viewer_ua text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.proposal_events enable row level security;
-- Owner of the proposal can view events
create policy "Proposal owners can view events" on public.proposal_events
  for select using (
    exists (
      select 1 from public.proposals
      where proposals.id = proposal_events.proposal_id
        and proposals.user_id = auth.uid()
    )
  );

-- ============================================================
-- Proposal Comments
-- ============================================================
create table public.proposal_comments (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references public.proposals(id) on delete cascade not null,
  author_name text not null,
  author_email text,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.proposal_comments enable row level security;
-- Owner of the proposal can view comments
create policy "Proposal owners can view comments" on public.proposal_comments
  for select using (
    exists (
      select 1 from public.proposals
      where proposals.id = proposal_comments.proposal_id
        and proposals.user_id = auth.uid()
    )
  );
```

**Step 3: Create admin RLS migration**

`supabase/migrations/00003_admin_rls.sql`:
```sql
-- SECURITY DEFINER function to check admin role without RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Admin policies for key tables
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Admins can view all subscriptions" on public.subscriptions
  for select using (public.is_admin());
create policy "Admins can view all proposals" on public.proposals
  for select using (public.is_admin());
```

**Step 4: Create system templates seed migration**

`supabase/migrations/00004_system_templates.sql`:
```sql
-- 5 system templates (user_id = NULL)
insert into public.templates (user_id, name, description, industry, sections_schema, is_public) values
(
  null,
  'Web Development Project',
  'Complete proposal for web development projects with phases, tech stack, and milestone pricing.',
  'technology',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize the project goals, approach, and expected outcomes"},
    {"type": "scope", "title": "Project Scope", "prompt_hint": "Define what is included and excluded from the project"},
    {"type": "tech_stack", "title": "Technology Stack", "prompt_hint": "List and justify the technologies, frameworks, and tools"},
    {"type": "deliverables", "title": "Deliverables", "prompt_hint": "List all tangible deliverables with descriptions"},
    {"type": "timeline", "title": "Project Timeline", "prompt_hint": "Break down the project into phases with durations"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Present pricing with milestone-based payment schedule"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Standard terms: revisions, IP, payment terms, warranties"}
  ]'::jsonb,
  true
),
(
  null,
  'Graphic Design Package',
  'Creative proposal for graphic design work including brief, revisions, and deliverable formats.',
  'design',
  '[
    {"type": "executive_summary", "title": "Creative Brief", "prompt_hint": "Summarize the design challenge, brand context, and creative direction"},
    {"type": "scope", "title": "Design Scope", "prompt_hint": "Define deliverables, dimensions, formats, and usage rights"},
    {"type": "process", "title": "Creative Process", "prompt_hint": "Outline the design process: research, concepts, revisions, delivery"},
    {"type": "deliverables", "title": "Deliverables & Formats", "prompt_hint": "List all files, formats (AI, PSD, PNG, SVG), and dimensions"},
    {"type": "timeline", "title": "Timeline", "prompt_hint": "Timeline with revision rounds and approval checkpoints"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Fixed pricing with breakdown per deliverable"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Revision policy, IP transfer, usage rights, payment terms"}
  ]'::jsonb,
  true
),
(
  null,
  'Digital Marketing Campaign',
  'Strategic proposal for digital marketing with channels, KPIs, and monthly retainer structure.',
  'marketing',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize marketing goals, target audience, and proposed strategy"},
    {"type": "audit", "title": "Current State Analysis", "prompt_hint": "Brief analysis of current marketing efforts and opportunities"},
    {"type": "strategy", "title": "Marketing Strategy", "prompt_hint": "Define channels, tactics, content strategy, and ad spend allocation"},
    {"type": "kpis", "title": "KPIs & Success Metrics", "prompt_hint": "Measurable goals: traffic, conversions, ROI, engagement rates"},
    {"type": "timeline", "title": "Campaign Timeline", "prompt_hint": "Monthly breakdown of activities and milestones"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Monthly retainer with breakdown: management fee, ad spend, tools"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Contract length, reporting frequency, cancellation policy"}
  ]'::jsonb,
  true
),
(
  null,
  'Business Consulting Engagement',
  'Professional consulting proposal with problem statement, methodology, and recommendations.',
  'consulting',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize the business challenge and proposed consulting approach"},
    {"type": "problem", "title": "Problem Statement", "prompt_hint": "Define the core business problem, impact, and urgency"},
    {"type": "methodology", "title": "Methodology & Approach", "prompt_hint": "Describe the consulting framework, research methods, and analysis approach"},
    {"type": "deliverables", "title": "Deliverables", "prompt_hint": "List reports, presentations, recommendations, and implementation guides"},
    {"type": "timeline", "title": "Engagement Timeline", "prompt_hint": "Phases: discovery, analysis, recommendations, implementation support"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Fee structure: fixed project fee or hourly with estimated hours"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Confidentiality, IP, engagement scope, travel expenses, payment terms"}
  ]'::jsonb,
  true
),
(
  null,
  'Content & Copywriting',
  'Content strategy proposal with deliverables, revision rounds, and content calendar.',
  'content',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize content goals, target audience, and brand voice direction"},
    {"type": "strategy", "title": "Content Strategy", "prompt_hint": "Define content pillars, formats, distribution channels, and SEO approach"},
    {"type": "deliverables", "title": "Content Deliverables", "prompt_hint": "List all content pieces: blog posts, emails, social, landing pages"},
    {"type": "process", "title": "Writing Process", "prompt_hint": "Outline: brief, outline, draft, revisions, final delivery"},
    {"type": "timeline", "title": "Content Calendar", "prompt_hint": "Publishing schedule with deadlines and review checkpoints"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Per-piece or retainer pricing with revision rounds included"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Revision rounds, content ownership, usage rights, kill fee"}
  ]'::jsonb,
  true
);
```

**Step 5: Apply migrations to Supabase**

This will be done via the Supabase MCP tool `apply_migration` for each file, or manually in the Supabase SQL editor.

**Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add database schema for proposals, clients, templates, events

Tables: profiles (extended with brand fields), clients, templates,
proposals, proposal_events, proposal_comments.
Includes RLS policies, admin function, and 5 system templates.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: TypeScript Types & Stripe Plans

**Files:**
- Modify: `src/types/database.ts`
- Modify: `src/lib/stripe/plans.ts`

**Step 1: Replace database types**

`src/types/database.ts` — replace entire file:
```typescript
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  stripe_customer_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "free";
  subscription_plan: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface TemplateSection {
  type: string;
  title: string;
  prompt_hint: string;
}

export interface Template {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  industry: "technology" | "design" | "marketing" | "consulting" | "content" | null;
  sections_schema: TemplateSection[];
  is_public: boolean;
  created_at: string;
}

export interface ProposalSection {
  type: string;
  title: string;
  content: string;
  order: number;
}

export interface PricingData {
  amount?: number;
  currency?: string;
  hourly_rate?: number;
  estimated_hours?: number;
  milestones?: { name: string; amount: number; due: string }[];
}

export interface BrandSettings {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface ProposalBrief {
  project_description: string;
  client_name?: string;
  client_company?: string;
  industry?: string;
  budget_range?: string;
  timeline?: string;
  special_requirements?: string;
}

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string | null;
  template_id: string | null;
  title: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined";
  sections: ProposalSection[];
  pricing_type: "fixed" | "hourly" | "milestone" | null;
  pricing_data: PricingData;
  share_token: string | null;
  share_password: string | null;
  brand_settings: BrandSettings;
  valid_until: string | null;
  brief: ProposalBrief | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalEvent {
  id: string;
  proposal_id: string;
  event_type: "viewed" | "accepted" | "declined" | "commented";
  viewer_ip: string | null;
  viewer_ua: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProposalComment {
  id: string;
  proposal_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & { user_id: string; stripe_subscription_id: string; stripe_price_id: string };
        Update: Partial<Subscription>;
      };
      clients: {
        Row: Client;
        Insert: Partial<Client> & { user_id: string; name: string };
        Update: Partial<Client>;
      };
      templates: {
        Row: Template;
        Insert: Partial<Template> & { name: string; sections_schema: TemplateSection[] };
        Update: Partial<Template>;
      };
      proposals: {
        Row: Proposal;
        Insert: Partial<Proposal> & { user_id: string; title: string };
        Update: Partial<Proposal>;
      };
      proposal_events: {
        Row: ProposalEvent;
        Insert: Partial<ProposalEvent> & { proposal_id: string; event_type: string };
        Update: Partial<ProposalEvent>;
      };
      proposal_comments: {
        Row: ProposalComment;
        Insert: Partial<ProposalComment> & { proposal_id: string; author_name: string; content: string };
        Update: Partial<ProposalComment>;
      };
    };
  };
}
```

**Step 2: Update Stripe plans**

`src/lib/stripe/plans.ts` — replace plan definitions:
```typescript
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  stripePriceId: { monthly: string; yearly: string };
  features: string[];
  limits: {
    proposals_per_month: number;
    clients_max: number;
    ai_model: "haiku" | "sonnet";
    templates: "basic" | "all" | "all_custom";
    client_portal: "view_only" | "full";
    tracking: boolean;
    brand_customization: boolean;
    pricing_calculator: boolean;
  };
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try it out with basic proposals",
    price: { monthly: 0, yearly: 0 },
    stripePriceId: { monthly: "", yearly: "" },
    features: [
      "2 proposals/month",
      "3 basic templates",
      "PDF export",
      "View-only client portal",
      "5 clients max",
    ],
    limits: {
      proposals_per_month: 2,
      clients_max: 5,
      ai_model: "haiku",
      templates: "basic",
      client_portal: "view_only",
      tracking: false,
      brand_customization: false,
      pricing_calculator: false,
    },
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For active freelancers",
    price: { monthly: 29, yearly: 290 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "").trim(),
    },
    features: [
      "20 proposals/month",
      "All templates",
      "PDF export",
      "Full client portal",
      "50 clients",
      "Proposal tracking",
      "Brand customization",
      "AI pricing calculator",
      "Sonnet 4.5 AI model",
    ],
    limits: {
      proposals_per_month: 20,
      clients_max: 50,
      ai_model: "sonnet",
      templates: "all",
      client_portal: "full",
      tracking: true,
      brand_customization: true,
      pricing_calculator: true,
    },
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "business",
    name: "Business",
    description: "For agencies and power users",
    price: { monthly: 99, yearly: 990 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID || "").trim(),
    },
    features: [
      "Unlimited proposals",
      "All templates + custom",
      "PDF export",
      "Full client portal",
      "Unlimited clients",
      "Proposal tracking",
      "Brand customization",
      "AI pricing calculator",
      "Sonnet 4.5 AI model",
      "Priority support",
    ],
    limits: {
      proposals_per_month: Infinity,
      clients_max: Infinity,
      ai_model: "sonnet",
      templates: "all_custom",
      client_portal: "full",
      tracking: true,
      brand_customization: true,
      pricing_calculator: true,
    },
    cta: "Go Business",
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(
    (p) =>
      p.stripePriceId.monthly === priceId ||
      p.stripePriceId.yearly === priceId,
  );
}

export function getUserPlan(subscriptionPlan: string | null): PricingPlan {
  return pricingPlans.find((p) => p.id === subscriptionPlan) || pricingPlans[0];
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/types/database.ts src/lib/stripe/plans.ts
git commit -m "feat: add proposal-specific types and pricing plans

Database types for proposals, clients, templates, events, comments.
Three-tier pricing: Free (2/mo), Pro $29 (20/mo), Business $99 (unlimited).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Usage Limits Helper

**Files:**
- Create: `src/lib/usage.ts`

**Step 1: Create usage limits helper**

`src/lib/usage.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";

export async function checkProposalLimit(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, used: 0, limit: 0, plan: "free" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  // Unlimited plan
  if (plan.limits.proposals_per_month === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, plan: plan.id };
  }

  // Count proposals created this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth);

  const used = count ?? 0;

  return {
    allowed: used < plan.limits.proposals_per_month,
    used,
    limit: plan.limits.proposals_per_month,
    plan: plan.id,
  };
}

export async function checkClientLimit(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, used: 0, limit: 0 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  if (plan.limits.clients_max === Infinity) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const used = count ?? 0;

  return {
    allowed: used < plan.limits.clients_max,
    used,
    limit: plan.limits.clients_max,
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/usage.ts
git commit -m "feat: add usage limit helpers for proposals and clients

Check monthly proposal count and client count against plan limits.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: AI Generation — Proposal Generator

**Files:**
- Create: `src/lib/ai/generate-proposal.ts`
- Create: `src/lib/ai/regenerate-section.ts`
- Create: `src/lib/ai/pricing-suggest.ts`
- Modify: `src/lib/ai/providers.ts` (keep, may need minor updates)

**Step 1: Create proposal generation with generateObject**

`src/lib/ai/generate-proposal.ts`:
```typescript
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ProposalBrief, TemplateSection } from "@/types/database";

const proposalSectionSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z.string().describe("Detailed, professional content for this section. Use markdown formatting."),
  order: z.number(),
});

const generatedProposalSchema = z.object({
  title: z.string().describe("Professional proposal title"),
  sections: z.array(proposalSectionSchema),
  pricing_type: z.enum(["fixed", "hourly", "milestone"]),
  pricing_data: z.object({
    amount: z.number().optional(),
    currency: z.string().default("USD"),
    hourly_rate: z.number().optional(),
    estimated_hours: z.number().optional(),
    milestones: z
      .array(
        z.object({
          name: z.string(),
          amount: z.number(),
          due: z.string(),
        }),
      )
      .optional(),
  }),
});

export type GeneratedProposal = z.infer<typeof generatedProposalSchema>;

export async function generateProposal(
  brief: ProposalBrief,
  templateSections: TemplateSection[],
  aiModel: "haiku" | "sonnet",
): Promise<GeneratedProposal> {
  const modelId =
    aiModel === "sonnet"
      ? "claude-sonnet-4-5-20250929"
      : "claude-haiku-4-5-20251001";

  const systemPrompt = `You are a professional proposal writer for freelancers and agencies.
Generate a complete, polished business proposal based on the project brief.
Write in a professional but approachable tone. Use markdown formatting in section content.
Be specific and detailed — avoid generic filler text.
Each section should be 150-400 words depending on complexity.`;

  const userPrompt = `Generate a complete proposal for the following project:

**Project Description:** ${brief.project_description}
${brief.client_name ? `**Client:** ${brief.client_name}` : ""}
${brief.client_company ? `**Company:** ${brief.client_company}` : ""}
${brief.industry ? `**Industry:** ${brief.industry}` : ""}
${brief.budget_range ? `**Budget Range:** ${brief.budget_range}` : ""}
${brief.timeline ? `**Timeline:** ${brief.timeline}` : ""}
${brief.special_requirements ? `**Special Requirements:** ${brief.special_requirements}` : ""}

The proposal must include these sections (in order):
${templateSections.map((s, i) => `${i + 1}. **${s.title}** (type: ${s.type}) — ${s.prompt_hint}`).join("\n")}

Generate pricing that matches the scope described. If budget range is provided, stay within it.`;

  const { object } = await generateObject({
    model: anthropic(modelId),
    schema: generatedProposalSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return object;
}
```

**Step 2: Create section regeneration**

`src/lib/ai/regenerate-section.ts`:
```typescript
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ProposalSection } from "@/types/database";

const sectionSchema = z.object({
  content: z.string().describe("Regenerated section content in markdown"),
});

export async function regenerateSection(
  sectionTitle: string,
  sectionType: string,
  promptHint: string,
  otherSections: ProposalSection[],
  userInstructions: string | undefined,
  aiModel: "haiku" | "sonnet",
): Promise<string> {
  const modelId =
    aiModel === "sonnet"
      ? "claude-sonnet-4-5-20250929"
      : "claude-haiku-4-5-20251001";

  const context = otherSections
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");

  const prompt = `Regenerate the "${sectionTitle}" section of a business proposal.

Context from other sections:
${context}

Section purpose: ${promptHint}
${userInstructions ? `\nUser instructions: ${userInstructions}` : ""}

Write 150-400 words in professional markdown. Be specific, not generic.`;

  const { object } = await generateObject({
    model: anthropic(modelId),
    schema: sectionSchema,
    system:
      "You are a professional proposal writer. Regenerate one section of an existing proposal, keeping it consistent with the other sections.",
    prompt,
  });

  return object.content;
}
```

**Step 3: Create AI pricing calculator**

`src/lib/ai/pricing-suggest.ts`:
```typescript
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const pricingSuggestionSchema = z.object({
  fixed_price: z.number().describe("Suggested fixed project price in USD"),
  hourly_rate: z.number().describe("Suggested hourly rate in USD"),
  estimated_hours: z.number().describe("Estimated total hours"),
  price_range: z.object({
    low: z.number(),
    high: z.number(),
  }),
  confidence: z
    .enum(["low", "medium", "high"])
    .describe("Confidence in the estimate based on available info"),
  reasoning: z.string().describe("Brief explanation of pricing rationale"),
});

export type PricingSuggestion = z.infer<typeof pricingSuggestionSchema>;

export async function suggestPricing(
  projectDescription: string,
  industry: string | undefined,
  scope: string | undefined,
): Promise<PricingSuggestion> {
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: pricingSuggestionSchema,
    system:
      "You are a freelance pricing expert. Suggest fair market pricing for freelance projects based on scope and industry. Use 2025 US market rates.",
    prompt: `Suggest pricing for this freelance project:

**Description:** ${projectDescription}
${industry ? `**Industry:** ${industry}` : ""}
${scope ? `**Scope Details:** ${scope}` : ""}

Provide fixed price, hourly rate, estimated hours, price range, and confidence level.`,
  });

  return object;
}
```

**Step 4: Commit**

```bash
git add src/lib/ai/
git commit -m "feat: add AI proposal generation, section regen, pricing calc

generateProposal() uses generateObject() with Zod schema.
regenerateSection() regenerates one section with context.
suggestPricing() provides AI-powered pricing estimates.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: API Routes — Proposals

**Files:**
- Create: `src/app/api/proposals/generate/route.ts`
- Create: `src/app/api/proposals/regenerate-section/route.ts`
- Create: `src/app/api/proposals/[id]/pricing-suggest/route.ts`
- Create: `src/app/api/proposals/[id]/share/route.ts`
- Create: `src/app/api/proposals/[id]/pdf/route.ts`
- Create: `src/lib/pdf/proposal-pdf.tsx`

**Step 1: Create proposal generation API**

`src/app/api/proposals/generate/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProposal } from "@/lib/ai/generate-proposal";
import { getUserPlan } from "@/lib/stripe/plans";
import { checkProposalLimit } from "@/lib/usage";
import { z } from "zod";

const briefSchema = z.object({
  project_description: z.string().min(20),
  client_name: z.string().optional(),
  client_company: z.string().optional(),
  industry: z.string().optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  special_requirements: z.string().optional(),
  template_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check proposal limit
  const limit = await checkProposalLimit();
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Monthly limit reached (${limit.used}/${limit.limit}). Upgrade your plan.` },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const brief = parsed.data;

  // Get user's plan for AI model selection
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, primary_color, secondary_color, company_logo_url")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  // Get template sections
  let templateSections = [
    { type: "executive_summary", title: "Executive Summary", prompt_hint: "Summarize the project" },
    { type: "scope", title: "Project Scope", prompt_hint: "Define scope" },
    { type: "deliverables", title: "Deliverables", prompt_hint: "List deliverables" },
    { type: "timeline", title: "Timeline", prompt_hint: "Project timeline" },
    { type: "pricing", title: "Investment", prompt_hint: "Pricing details" },
    { type: "terms", title: "Terms & Conditions", prompt_hint: "Standard terms" },
  ];

  if (brief.template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("sections_schema")
      .eq("id", brief.template_id)
      .single();

    if (template?.sections_schema) {
      templateSections = template.sections_schema as typeof templateSections;
    }
  }

  // Generate proposal via AI
  const generated = await generateProposal(
    brief,
    templateSections,
    plan.limits.ai_model,
  );

  // Save to database
  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      client_id: brief.client_id || null,
      template_id: brief.template_id || null,
      title: generated.title,
      status: "draft",
      sections: generated.sections,
      pricing_type: generated.pricing_type,
      pricing_data: generated.pricing_data,
      brand_settings: {
        logo_url: profile?.company_logo_url,
        primary_color: profile?.primary_color || "#2563eb",
        secondary_color: profile?.secondary_color || "#1e40af",
      },
      brief,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal });
}
```

**Step 2: Create section regeneration API**

`src/app/api/proposals/regenerate-section/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateSection } from "@/lib/ai/regenerate-section";
import { getUserPlan } from "@/lib/stripe/plans";
import { z } from "zod";

const schema = z.object({
  proposal_id: z.string().uuid(),
  section_index: z.number().int().min(0),
  instructions: z.string().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { proposal_id, section_index, instructions } = parsed.data;

  // Fetch proposal
  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", proposal_id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const sections = proposal.sections as { type: string; title: string; content: string; order: number }[];
  const target = sections[section_index];
  if (!target) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const newContent = await regenerateSection(
    target.title,
    target.type,
    "", // prompt_hint not stored on proposal, use empty
    sections.filter((_, i) => i !== section_index),
    instructions,
    plan.limits.ai_model,
  );

  // Update the section
  sections[section_index].content = newContent;

  const { error } = await supabase
    .from("proposals")
    .update({ sections })
    .eq("id", proposal_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ content: newContent });
}
```

**Step 3: Create pricing suggestion API**

`src/app/api/proposals/[id]/pricing-suggest/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestPricing } from "@/lib/ai/pricing-suggest";
import { getUserPlan } from "@/lib/stripe/plans";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user has pricing calculator access
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);
  if (!plan.limits.pricing_calculator) {
    return NextResponse.json(
      { error: "Pricing calculator requires Pro plan or higher" },
      { status: 403 },
    );
  }

  const { data: proposal } = await supabase
    .from("proposals")
    .select("brief, sections")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const brief = proposal.brief as { project_description: string; industry?: string } | null;
  const sections = proposal.sections as { title: string; content: string }[];
  const scopeSection = sections.find(
    (s) => s.title.toLowerCase().includes("scope") || s.title.toLowerCase().includes("deliverable"),
  );

  const suggestion = await suggestPricing(
    brief?.project_description || "",
    brief?.industry,
    scopeSection?.content,
  );

  return NextResponse.json({ suggestion });
}
```

**Step 4: Create share link API**

`src/app/api/proposals/[id]/share/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  password: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  // Check if proposal already has a share token
  const { data: proposal } = await supabase
    .from("proposals")
    .select("share_token, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const shareToken =
    proposal.share_token || crypto.randomBytes(16).toString("hex");

  const { error } = await supabase
    .from("proposals")
    .update({
      share_token: shareToken,
      share_password: parsed.data?.password || null,
      status: proposal.status === "draft" ? "sent" : proposal.status,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${shareToken}`;

  return NextResponse.json({ share_token: shareToken, share_url: shareUrl });
}
```

**Step 5: Create PDF generation**

`src/lib/pdf/proposal-pdf.tsx`:
```tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Proposal } from "@/types/database";

// Register a basic font (Inter from Google Fonts CDN)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
});

function createStyles(primaryColor: string, secondaryColor: string) {
  return StyleSheet.create({
    page: {
      fontFamily: "Inter",
      fontSize: 11,
      paddingTop: 60,
      paddingBottom: 60,
      paddingHorizontal: 50,
      color: "#1f2937",
    },
    coverPage: {
      fontFamily: "Inter",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      paddingHorizontal: 50,
    },
    coverTitle: {
      fontSize: 32,
      fontWeight: 700,
      color: primaryColor,
      textAlign: "center",
      marginBottom: 20,
    },
    coverSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 12,
      marginTop: 24,
      borderBottomWidth: 2,
      borderBottomColor: secondaryColor,
      paddingBottom: 6,
    },
    paragraph: {
      fontSize: 11,
      lineHeight: 1.6,
      marginBottom: 8,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 50,
      right: 50,
      fontSize: 9,
      color: "#9ca3af",
      textAlign: "center",
    },
    pricingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    pricingLabel: { fontSize: 11 },
    pricingValue: { fontSize: 11, fontWeight: 700 },
    validUntil: {
      fontSize: 10,
      color: "#6b7280",
      marginTop: 16,
    },
  });
}

export function ProposalPDF({ proposal }: { proposal: Proposal }) {
  const primaryColor = proposal.brand_settings?.primary_color || "#2563eb";
  const secondaryColor = proposal.brand_settings?.secondary_color || "#1e40af";
  const styles = createStyles(primaryColor, secondaryColor);

  const sections = proposal.sections || [];

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverTitle}>{proposal.title}</Text>
          <Text style={styles.coverSubtitle}>
            Prepared for {(proposal.brief as { client_name?: string })?.client_name || "Client"}
          </Text>
          {proposal.valid_until && (
            <Text style={styles.validUntil}>
              Valid until: {new Date(proposal.valid_until).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={styles.page}>
        {sections.map((section, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.split("\n").map((line, j) => (
              <Text key={j} style={styles.paragraph}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        {/* Pricing Summary */}
        {proposal.pricing_data && (
          <View>
            {proposal.pricing_type === "fixed" && proposal.pricing_data.amount && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Total Investment</Text>
                <Text style={styles.pricingValue}>
                  ${proposal.pricing_data.amount.toLocaleString()} {proposal.pricing_data.currency || "USD"}
                </Text>
              </View>
            )}
            {proposal.pricing_type === "hourly" && (
              <>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Hourly Rate</Text>
                  <Text style={styles.pricingValue}>
                    ${proposal.pricing_data.hourly_rate}/hr
                  </Text>
                </View>
                {proposal.pricing_data.estimated_hours && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Estimated Hours</Text>
                    <Text style={styles.pricingValue}>
                      {proposal.pricing_data.estimated_hours}h
                    </Text>
                  </View>
                )}
              </>
            )}
            {proposal.pricing_type === "milestone" &&
              proposal.pricing_data.milestones?.map((m, i) => (
                <View key={i} style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>{m.name}</Text>
                  <Text style={styles.pricingValue}>${m.amount.toLocaleString()}</Text>
                </View>
              ))}
          </View>
        )}

        <Text style={styles.footer}>
          Generated with ProposalAI
        </Text>
      </Page>
    </Document>
  );
}
```

**Step 6: Create PDF API route**

`src/app/api/proposals/[id]/pdf/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalPDF } from "@/lib/pdf/proposal-pdf";
import React from "react";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    React.createElement(ProposalPDF, { proposal: proposal as any }),
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${proposal.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
    },
  });
}
```

**Step 7: Update vercel.json for new API routes**

Add max durations for AI routes:
```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/stripe/webhook/route.ts": { "maxDuration": 30 },
    "src/app/api/proposals/generate/route.ts": { "maxDuration": 60 },
    "src/app/api/proposals/regenerate-section/route.ts": { "maxDuration": 30 },
    "src/app/api/proposals/*/pricing-suggest/route.ts": { "maxDuration": 30 },
    "src/app/api/proposals/*/pdf/route.ts": { "maxDuration": 30 }
  }
}
```

**Step 8: Commit**

```bash
git add src/app/api/proposals/ src/lib/pdf/ vercel.json
git commit -m "feat: add proposal API routes (generate, regen, pricing, share, PDF)

AI generation via generateObject(), section regeneration, pricing
calculator, share link generation, PDF export via @react-pdf/renderer.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: API Routes — Public Portal & CRUD

**Files:**
- Create: `src/app/api/public/proposals/[token]/route.ts`
- Create: `src/app/api/public/proposals/[token]/event/route.ts`
- Create: `src/app/api/public/proposals/[token]/comment/route.ts`
- Create: `src/app/api/clients/route.ts`
- Create: `src/app/api/clients/[id]/route.ts`
- Create: `src/app/api/templates/route.ts`

**Step 1: Create public proposal fetch (no auth)**

`src/app/api/public/proposals/[token]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, title, sections, pricing_type, pricing_data, brand_settings, valid_until, status, share_password, created_at")
    .eq("share_token", token)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Check password if set
  const url = new URL(req.url);
  const password = url.searchParams.get("password");
  if (proposal.share_password && proposal.share_password !== password) {
    return NextResponse.json(
      { error: "Password required", password_protected: true },
      { status: 401 },
    );
  }

  // Get comments
  const { data: comments } = await supabase
    .from("proposal_comments")
    .select("id, author_name, content, created_at")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: true });

  // Remove password from response
  const { share_password: _, ...safeProposal } = proposal;

  return NextResponse.json({ proposal: safeProposal, comments: comments || [] });
}
```

**Step 2: Create event tracking API (no auth)**

`src/app/api/public/proposals/[token]/event/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { headers } from "next/headers";
import { z } from "zod";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const schema = z.object({
  event_type: z.enum(["viewed", "accepted", "declined"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, status, user_id")
    .eq("share_token", token)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const hdrs = await headers();

  // Record event
  await supabase.from("proposal_events").insert({
    proposal_id: proposal.id,
    event_type: parsed.data.event_type,
    viewer_ip: hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip"),
    viewer_ua: hdrs.get("user-agent"),
  });

  // Update proposal status
  if (parsed.data.event_type === "accepted" || parsed.data.event_type === "declined") {
    await supabase
      .from("proposals")
      .update({ status: parsed.data.event_type })
      .eq("id", proposal.id);
  } else if (parsed.data.event_type === "viewed" && proposal.status === "sent") {
    await supabase
      .from("proposals")
      .update({ status: "viewed" })
      .eq("id", proposal.id);
  }

  // TODO: Send email notification to proposal owner (Task 14)

  return NextResponse.json({ success: true });
}
```

**Step 3: Create comment API (no auth)**

`src/app/api/public/proposals/[token]/comment/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const schema = z.object({
  author_name: z.string().min(1).max(100),
  author_email: z.string().email().optional(),
  content: z.string().min(1).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id")
    .eq("share_token", token)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Record comment event
  await supabase.from("proposal_events").insert({
    proposal_id: proposal.id,
    event_type: "commented",
    metadata: { author_name: parsed.data.author_name },
  });

  const { data: comment, error } = await supabase
    .from("proposal_comments")
    .insert({
      proposal_id: proposal.id,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email || null,
      content: parsed.data.content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment });
}
```

**Step 4: Create clients CRUD API**

`src/app/api/clients/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkClientLimit } from "@/lib/usage";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ clients: clients || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkClientLimit();
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Client limit reached (${limit.used}/${limit.limit}). Upgrade your plan.` },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({ user_id: user.id, ...parsed.data })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client }, { status: 201 });
}
```

`src/app/api/clients/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Get proposals for this client
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title, status, created_at, pricing_type, pricing_data")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ client, proposals: proposals || [] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: client, error } = await supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Step 5: Create templates API**

`src/app/api/templates/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  industry: z.enum(["technology", "design", "marketing", "consulting", "content"]).optional(),
  sections_schema: z.array(
    z.object({
      type: z.string(),
      title: z.string(),
      prompt_hint: z.string(),
    }),
  ),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RLS handles filtering: system templates (user_id IS NULL) + own templates
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ templates: templates || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only business plan can create custom templates
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);
  if (plan.limits.templates !== "all_custom") {
    return NextResponse.json(
      { error: "Custom templates require Business plan" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: template, error } = await supabase
    .from("templates")
    .insert({ user_id: user.id, ...parsed.data })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template }, { status: 201 });
}
```

**Step 6: Commit**

```bash
git add src/app/api/public/ src/app/api/clients/ src/app/api/templates/
git commit -m "feat: add public portal APIs, clients CRUD, templates API

Public APIs for proposal viewing, event tracking, and comments.
Clients CRUD with limit enforcement. Templates listing + creation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Dashboard Pages — Proposals

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/proposals/page.tsx`
- Create: `src/app/(dashboard)/proposals/new/page.tsx`
- Create: `src/app/(dashboard)/proposals/[id]/page.tsx`
- Create: `src/app/(dashboard)/proposals/[id]/preview/page.tsx`
- Modify: `src/components/dashboard/app-sidebar.tsx`
- Modify: `src/components/dashboard/stats-cards.tsx`

**Step 1: Update sidebar navigation**

Replace the boilerplate nav items in `src/components/dashboard/app-sidebar.tsx` with:
- Dashboard (home icon) → `/dashboard`
- Proposals (file-text icon) → `/dashboard/proposals`
- New Proposal (plus-circle icon) → `/dashboard/proposals/new`
- Clients (users icon) → `/dashboard/clients`
- Templates (layout-template icon) → `/dashboard/templates`
- Settings (settings icon) → `/settings`
- Billing (credit-card icon) → `/settings/billing`

**Step 2: Update dashboard page with proposal stats**

`src/app/(dashboard)/dashboard/page.tsx` — replace with:
- Stats cards: Total Proposals, Sent/Pending, Win Rate, Revenue
- Recent proposals table (last 5)
- Quick action: "Create Proposal" button

Fetch data server-side:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Count proposals by status
const { data: proposals } = await supabase
  .from("proposals")
  .select("id, status, pricing_data, created_at")
  .eq("user_id", user.id);

const total = proposals?.length ?? 0;
const accepted = proposals?.filter(p => p.status === "accepted").length ?? 0;
const sent = proposals?.filter(p => ["sent", "viewed"].includes(p.status)).length ?? 0;
const winRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
```

**Step 3: Create proposals list page**

`src/app/(dashboard)/proposals/page.tsx`:
- Server component fetching all user proposals
- Table with columns: Title, Client, Status (badge), Created, Actions
- Filters: status dropdown, search by title
- "Create Proposal" button top-right
- Status badges with colors: draft=gray, sent=blue, viewed=yellow, accepted=green, declined=red

**Step 4: Create new proposal wizard page**

`src/app/(dashboard)/proposals/new/page.tsx`:
- Client component with multi-step wizard
- **Step 1 - Brief**: Form with fields matching `ProposalBrief` type
  - Project description (textarea, required)
  - Client selector (dropdown from clients list, or quick-add)
  - Template selector (cards from templates list)
  - Budget range, timeline, special requirements (optional)
- **Step 2 - Generate**: Click "Generate Proposal" → loading state → AI generates
- **Step 3 - Edit**: Show generated sections in editable form
  - Each section: title + rich textarea
  - "Regenerate" button per section (with optional instructions)
  - Pricing editor (type selector + amount fields)
  - "AI Suggest Pricing" button (pro+ only)
- **Step 4 - Save**: Save as draft or send immediately

**Step 5: Create proposal detail page**

`src/app/(dashboard)/proposals/[id]/page.tsx`:
- Server component fetching proposal + events + comments
- Tabs: Content | Tracking | Settings
- **Content tab**: Read-only sections display, "Edit" button → inline editing
- **Tracking tab**: Event timeline (viewed, accepted, declined, comments), viewer info
- **Settings tab**: Share link management, password protection, validity date, delete

Action buttons:
- "Share" → generate share link dialog
- "Download PDF" → `/api/proposals/[id]/pdf`
- "Copy to Clipboard" → client-side rich text copy
- "Preview" → `/dashboard/proposals/[id]/preview`

**Step 6: Create proposal preview page**

`src/app/(dashboard)/proposals/[id]/preview/page.tsx`:
- Full-width, no sidebar layout
- Renders proposal exactly as client will see it
- Uses brand settings (colors, logo)
- "Back to Editor" button

**Step 7: Commit**

```bash
git add src/app/\(dashboard\)/ src/components/dashboard/
git commit -m "feat: add dashboard pages (proposals list, wizard, detail, preview)

Dashboard with stats, proposals list with filters, multi-step creation
wizard, proposal detail with tracking/sharing, preview mode.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Dashboard Pages — Clients & Templates

**Files:**
- Create: `src/app/(dashboard)/clients/page.tsx`
- Create: `src/app/(dashboard)/clients/[id]/page.tsx`
- Create: `src/app/(dashboard)/templates/page.tsx`

**Step 1: Create clients list page**

`src/app/(dashboard)/clients/page.tsx`:
- Server component fetching clients
- Table: Name, Company, Email, Proposals count, Created
- "Add Client" button → dialog with form
- Search by name/company
- Usage indicator: "3/5 clients" for free plan

**Step 2: Create client detail page**

`src/app/(dashboard)/clients/[id]/page.tsx`:
- Client info card (name, company, email, phone, notes) — editable
- Proposal history table for this client
- Stats: total proposals, accepted, win rate for this client
- "Create Proposal for Client" shortcut button

**Step 3: Create templates library page**

`src/app/(dashboard)/templates/page.tsx`:
- Grid of template cards
- System templates: icon, name, description, industry badge, section count
- Custom templates section (business plan only)
- "Use Template" button → redirects to `/dashboard/proposals/new?template={id}`
- "Create Template" button (business plan, dialog with section builder)

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/clients/ src/app/\(dashboard\)/templates/
git commit -m "feat: add clients CRM and templates library pages

Clients list with add/edit, client detail with proposal history,
templates library with system templates and custom template creation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Client Portal — Public Page

**Files:**
- Create: `src/app/p/[token]/page.tsx`
- Create: `src/app/p/[token]/layout.tsx`
- Create: `src/components/portal/proposal-view.tsx`
- Create: `src/components/portal/action-buttons.tsx`
- Create: `src/components/portal/comment-section.tsx`
- Create: `src/components/portal/password-gate.tsx`

**Step 1: Create portal layout**

`src/app/p/[token]/layout.tsx`:
- Minimal layout — no dashboard sidebar, no auth
- Brand-colored header bar using proposal's `brand_settings`
- Footer: "Powered by ProposalAI"

**Step 2: Create portal page**

`src/app/p/[token]/page.tsx`:
- Server component that fetches proposal via service role client
- If password-protected: render `PasswordGate` component
- If expired (valid_until < today): show expired message
- Otherwise: render full proposal view
- Fire "viewed" event on mount (client-side)

**Step 3: Create proposal view component**

`src/components/portal/proposal-view.tsx`:
- Renders sections with brand colors
- Pricing table
- Professional formatting matching PDF style

**Step 4: Create action buttons**

`src/components/portal/action-buttons.tsx`:
- "Accept Proposal" → confirmation dialog → POST event (accepted)
- "Request Changes" → opens comment form
- "Decline" → confirmation dialog → POST event (declined)
- Buttons respect proposal status (disabled if already accepted/declined)

**Step 5: Create comment section**

`src/components/portal/comment-section.tsx`:
- List of existing comments
- Form: name, email (optional), message
- POST to `/api/public/proposals/[token]/comment`

**Step 6: Create password gate**

`src/components/portal/password-gate.tsx`:
- Simple form: password input + submit
- On success: stores password in URL params and fetches proposal

**Step 7: Commit**

```bash
git add src/app/p/ src/components/portal/
git commit -m "feat: add client portal at /p/[token]

Public proposal view with brand customization, accept/decline/comment
functionality, view tracking, and optional password protection.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Settings — Profile & Brand

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`

**Step 1: Update settings page with brand customization**

Add brand settings section to existing settings page:
- Company name (text input)
- Company logo (file upload to Supabase Storage, show preview)
- Primary color (color picker input)
- Secondary color (color picker input)
- Preview card showing how brand looks on a mini proposal header

Save via direct Supabase update to profiles table (client-side).

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/settings/
git commit -m "feat: add brand customization to settings page

Company name, logo upload, primary/secondary color pickers with
live preview.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Update Stripe Integration

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`
- Modify: `src/app/api/stripe/checkout/route.ts`
- Modify: `src/app/(dashboard)/settings/billing/page.tsx`
- Modify: `src/app/(dashboard)/settings/billing/upgrade-buttons.tsx`

**Step 1: Update webhook for 3-tier plans**

The boilerplate webhook handles Pro + Enterprise. Rename Enterprise → Business:
- Update `getPlanByPriceId` usage (already works with new plans.ts)
- Ensure `subscription_plan` stores "pro" or "business"

**Step 2: Update checkout to handle 3 plans**

The checkout route reads `priceId` from request body. No changes needed — it already uses `getPlanByPriceId` for validation.

**Step 3: Update billing page**

Replace the plan comparison with proposal-specific features:
- Current plan card with usage stats (X/Y proposals this month, X/Y clients)
- Upgrade cards showing proposal-specific limits

**Step 4: Commit**

```bash
git add src/app/api/stripe/ src/app/\(dashboard\)/settings/billing/
git commit -m "feat: update Stripe billing for proposal-specific plans

Three-tier billing: Free, Pro ($29), Business ($99).
Billing page shows proposal/client usage against plan limits.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Landing Page

**Files:**
- Modify: `src/app/(marketing)/page.tsx`
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/features.tsx`
- Modify: `src/components/landing/pricing.tsx`
- Modify: `src/components/landing/testimonials.tsx`
- Modify: `src/components/landing/faq.tsx`
- Modify: `src/components/landing/navbar.tsx`
- Modify: `src/components/landing/footer.tsx`

**Step 1: Update hero**

- Headline: "Create Professional Proposals in Minutes with AI"
- Subheadline: "Generate, customize, and send stunning proposals. Track engagement and close more deals."
- CTA: "Start Creating Proposals — Free"
- Hero image: placeholder for proposal preview mockup

**Step 2: Update features**

6 feature cards:
1. AI-Powered Generation — Describe your project, get a complete proposal
2. Professional Templates — 5 industry-specific templates
3. Client Portal — Share via link, clients accept/decline/comment
4. PDF Export — Download branded PDF proposals
5. Engagement Tracking — Know when clients view and interact
6. CRM Lite — Manage clients and proposal history

**Step 3: Update pricing**

Use `pricingPlans` from plans.ts. Show feature comparison grid with proposal-specific features and limits.

**Step 4: Update FAQ**

Proposal-generator-specific questions:
- "How does AI generation work?"
- "Can I customize the proposals?"
- "How does the client portal work?"
- "What payment methods do you accept?"
- "Can I export to PDF?"
- "What happens when I reach my limit?"

**Step 5: Update testimonials**

Replace with freelancer-focused testimonials (placeholder content).

**Step 6: Commit**

```bash
git add src/app/\(marketing\)/ src/components/landing/
git commit -m "feat: update landing page for ProposalAI

Hero, features, pricing, testimonials, FAQ — all updated for
proposal generator use case targeting freelancers.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Middleware & Auth Updates

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/lib/supabase/middleware.ts`

**Step 1: Update middleware matchers**

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/proposals/:path*",
    "/clients/:path*",
    "/templates/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/auth/:path*",
    "/api/stripe/:path*",
  ],
};
```

Note: `/p/:path*` (client portal) is NOT in middleware — it's public.

**Step 2: Update middleware protected routes**

In `src/lib/supabase/middleware.ts`, update the protected route check:
```typescript
if (!user && (
  request.nextUrl.pathname.startsWith("/dashboard") ||
  request.nextUrl.pathname.startsWith("/proposals") ||
  request.nextUrl.pathname.startsWith("/clients") ||
  request.nextUrl.pathname.startsWith("/templates") ||
  request.nextUrl.pathname.startsWith("/settings")
)) {
```

**Step 3: Commit**

```bash
git add src/middleware.ts src/lib/supabase/middleware.ts
git commit -m "feat: update middleware for proposal generator routes

Add /proposals, /clients, /templates to protected routes.
Exclude /p/[token] (client portal) from auth checks.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 15: Email Notifications

**Files:**
- Create: `src/lib/email/proposal-notifications.ts`
- Modify: `src/app/api/public/proposals/[token]/event/route.ts`
- Modify: `src/app/api/public/proposals/[token]/comment/route.ts`

**Step 1: Create email notification helpers**

`src/lib/email/proposal-notifications.ts`:
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyProposalEvent(
  ownerEmail: string,
  proposalTitle: string,
  eventType: "viewed" | "accepted" | "declined" | "commented",
  metadata?: { author_name?: string; comment?: string },
) {
  const subjects: Record<string, string> = {
    viewed: `Your proposal "${proposalTitle}" was viewed`,
    accepted: `Your proposal "${proposalTitle}" was accepted!`,
    declined: `Your proposal "${proposalTitle}" was declined`,
    commented: `New comment on "${proposalTitle}"`,
  };

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "ProposalAI <noreply@proposalai.com>",
    to: ownerEmail,
    subject: subjects[eventType],
    text: `Your proposal "${proposalTitle}" received a new event: ${eventType}.${
      metadata?.comment ? `\n\nComment from ${metadata.author_name}:\n${metadata.comment}` : ""
    }\n\nView your proposal dashboard at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/proposals`,
  });
}
```

**Step 2: Wire notifications into event and comment routes**

Add email sending to the event route (after recording the event) and comment route. Fetch proposal owner email from profiles via service role client.

**Step 3: Commit**

```bash
git add src/lib/email/ src/app/api/public/
git commit -m "feat: add email notifications for proposal events

Notify proposal owner via Resend when clients view, accept, decline,
or comment on proposals.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 16: Supabase Storage for Logo Upload

**Files:**
- Create: `supabase/migrations/00005_storage_bucket.sql`

**Step 1: Create storage bucket migration**

```sql
-- Create logos storage bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true);

-- Allow authenticated users to upload to their own folder
create policy "Users can upload own logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
create policy "Public logo access"
on storage.objects for select
to public
using (bucket_id = 'logos');

-- Allow users to delete own logos
create policy "Users can delete own logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

**Step 2: Commit**

```bash
git add supabase/migrations/00005_storage_bucket.sql
git commit -m "feat: add Supabase storage bucket for company logos

Public read, authenticated upload to own user folder.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 17: Build Verification & Bug Fixes

**Step 1: Run full build**

```bash
cd c:/Projects/apps-portfolio/app-05-proposal-generator
npm run build
```

**Step 2: Fix any TypeScript errors**

Address all build errors. Common issues:
- Missing imports
- Type mismatches between database types and component props
- Unused variables

**Step 3: Fix any ESLint warnings**

```bash
npm run lint
```

**Step 4: Commit fixes**

```bash
git add -A
git commit -m "fix: resolve build and lint errors

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 18: Create Supabase Project & Apply Migrations

**Step 1: Pause an existing Supabase project**

Free tier allows max 2 active projects. Pause one:
```
Use Supabase MCP: pause_project (check which project to pause)
```

**Step 2: Create new Supabase project**

```
Use Supabase MCP: create_project
Name: app-05-proposal-generator
Region: us-east-1
Organization: (user's org)
```

**Step 3: Apply all migrations**

Apply each migration file via Supabase MCP `apply_migration`:
1. `00001_initial_schema.sql`
2. `00002_app_tables.sql`
3. `00003_admin_rls.sql`
4. `00004_system_templates.sql`
5. `00005_storage_bucket.sql`

**Step 4: Run Supabase auth setup script**

```bash
cd c:/Projects/apps-portfolio
./.shared/scripts/setup-supabase-auth.sh <new-project-ref> https://app-05-proposal-generator.vercel.app
```

**Step 5: Save Supabase keys to .env.keys**

Add to `.shared/.env.keys`:
```
APP05_SUPABASE_URL=https://<ref>.supabase.co
APP05_SUPABASE_ANON_KEY=<anon-key>
APP05_SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

**Step 6: Create .env.local for local dev**

```bash
# Copy from .env.example and fill with actual keys
cp .env.example .env.local
# Then fill with values from .env.keys
```

---

## Task 19: Create Stripe Products

**Step 1: Create Pro product via Stripe CLI or Dashboard**

```bash
# Pro plan
stripe products create --name="ProposalAI Pro" --description="20 proposals/month, all templates, full client portal"
# Pro monthly price
stripe prices create --product=<pro_product_id> --unit-amount=2900 --currency=usd --recurring[interval]=month
# Pro yearly price
stripe prices create --product=<pro_product_id> --unit-amount=29000 --currency=usd --recurring[interval]=year
```

**Step 2: Create Business product**

```bash
# Business plan
stripe products create --name="ProposalAI Business" --description="Unlimited proposals, custom templates, priority support"
# Business monthly price
stripe prices create --product=<biz_product_id> --unit-amount=9900 --currency=usd --recurring[interval]=month
# Business yearly price
stripe prices create --product=<biz_product_id> --unit-amount=99000 --currency=usd --recurring[interval]=year
```

**Step 3: Create webhook**

```bash
stripe webhooks create --url=https://app-05-proposal-generator.vercel.app/api/stripe/webhook \
  --events=checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_failed
```

**Step 4: Save Stripe IDs to .env.keys**

Add to `.shared/.env.keys`:
```
APP05_STRIPE_PRO_MONTHLY=price_...
APP05_STRIPE_PRO_YEARLY=price_...
APP05_STRIPE_BUSINESS_MONTHLY=price_...
APP05_STRIPE_BUSINESS_YEARLY=price_...
APP05_STRIPE_WEBHOOK_SECRET=whsec_...
APP05_STRIPE_WEBHOOK_ID=we_...
```

---

## Task 20: Deploy to Vercel

**Step 1: Create GitHub repo**

```bash
cd c:/Projects/apps-portfolio/app-05-proposal-generator
gh repo create bufaale/proposal-generator --private --source=. --push
```

**Step 2: Deploy to Vercel**

```
Use Vercel MCP: deploy_to_vercel
```

Or via CLI:
```bash
vercel
```

**Step 3: Set environment variables**

Use the setup script:
```bash
cd c:/Projects/apps-portfolio
./.shared/scripts/setup-vercel-env.sh APP05 https://app-05-proposal-generator.vercel.app
```

**Step 4: Redeploy with env vars**

```bash
cd c:/Projects/apps-portfolio/app-05-proposal-generator
vercel --prod
```

**Step 5: Verify deployment**

- Landing page loads
- Login/signup works
- Create a test proposal
- Check client portal link
- Download PDF
- Verify Stripe checkout

---

## Task 21: Update Memory

**Step 1: Update MEMORY.md**

Add app-05 entry to completed apps:
```markdown
- **app-05-proposal-generator**: Built + deployed. GitHub: `bufaale/proposal-generator`. Supabase: `<ref>`. Vercel: `app-05-proposal-generator.vercel.app`.
```

Add Stripe products:
```markdown
## App-05 Stripe Products
- Pro: prod_xxx (monthly=price_xxx, yearly=price_xxx)
- Business: prod_xxx (monthly=price_xxx, yearly=price_xxx)
- Webhook: we_xxx
```

**Step 2: Commit final state**

```bash
git add -A
git commit -m "chore: final deployment configuration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

---

## Verification Checklist

After all tasks complete, verify:

1. [ ] `npm run build` passes with zero errors
2. [ ] Landing page renders with correct branding
3. [ ] Signup → login → dashboard works
4. [ ] Create proposal via AI generation wizard
5. [ ] Edit individual sections
6. [ ] Regenerate a section via AI
7. [ ] Download PDF export
8. [ ] Copy to clipboard works
9. [ ] Generate share link
10. [ ] Client portal loads at `/p/[token]`
11. [ ] Client can accept/decline/comment
12. [ ] Proposal tracking shows events
13. [ ] Add/edit/delete clients
14. [ ] Templates library shows 5 system templates
15. [ ] Brand customization (logo, colors) works
16. [ ] Stripe checkout → subscription active
17. [ ] Plan limits enforced (proposal count, client count)
18. [ ] AI pricing calculator works (Pro+ only)
19. [ ] Email notifications fire on events
20. [ ] Password-protected portal works

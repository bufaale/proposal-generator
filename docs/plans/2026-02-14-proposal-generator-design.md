# App #5 - AI Proposal Generator Design

## Overview

AI-powered proposal generator for freelancers. Users describe a project, AI generates a complete professional proposal with sections (executive summary, scope, deliverables, timeline, pricing, terms). Proposals can be customized, exported as PDF, shared via a public client portal with accept/decline/comment capabilities, and tracked for analytics.

## Key Decisions

- **AI generation**: Hybrid approach - one-shot structured generation via `generateObject()`, then section-by-section editing/regeneration
- **Client portal**: Full portal at `/p/[token]` - client can view, accept, decline, comment. No auth required.
- **Export**: PDF via `@react-pdf/renderer` + "Copy to Clipboard" as formatted rich text (no DOCX)
- **Brand customization**: Logo upload + primary/secondary colors. Fixed layout.
- **Team feature**: Skipped for MVP. Business plan differentiates by unlimited proposals + priority.
- **Templates**: JSON schemas in DB. System templates + Pro users can create custom ones.

## Data Model

### profiles (extended from boilerplate)

Added fields:
- `company_name` text
- `company_logo_url` text
- `primary_color` text (hex, default #2563eb)
- `secondary_color` text (hex, default #1e40af)

### clients

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| name | text NOT NULL | |
| email | text | |
| company | text | |
| phone | text | |
| notes | text | |
| created_at | timestamptz | |

### templates

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK (nullable) | null = system template |
| name | text NOT NULL | |
| description | text | |
| industry | text | technology, design, marketing, consulting, content |
| sections_schema | jsonb | Array of {type, title, prompt_hint} |
| is_public | boolean | default false |
| created_at | timestamptz | |

### proposals

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| client_id | uuid FK → clients (nullable) | |
| template_id | uuid FK → templates (nullable) | |
| title | text NOT NULL | |
| status | text | draft, sent, viewed, accepted, declined |
| sections | jsonb | Array of {type, title, content, order} |
| pricing_type | text | fixed, hourly, milestone |
| pricing_data | jsonb | {amount, currency, hourly_rate, milestones[]} |
| share_token | text UNIQUE | Random token for public URL |
| share_password | text (nullable) | Optional password protection |
| brand_settings | jsonb | {logo_url, primary_color, secondary_color} |
| valid_until | date (nullable) | |
| brief | jsonb | Original input from user |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### proposal_events

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| proposal_id | uuid FK → proposals | |
| event_type | text | viewed, accepted, declined, commented |
| viewer_ip | text (nullable) | |
| viewer_ua | text (nullable) | |
| metadata | jsonb | |
| created_at | timestamptz | |

### proposal_comments

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| proposal_id | uuid FK → proposals | |
| author_name | text | |
| author_email | text | |
| content | text NOT NULL | |
| created_at | timestamptz | |

## Pages & Routes

### Public
- `/` - Landing page
- `/login`, `/signup`, `/forgot-password` - Auth
- `/p/[token]` - Client portal (view/accept/decline/comment)

### Dashboard
- `/dashboard` - Stats overview (proposals sent/viewed/accepted, win rate)
- `/dashboard/proposals` - Proposals list with filters
- `/dashboard/proposals/new` - Create wizard (brief → generate → edit → save)
- `/dashboard/proposals/[id]` - View/edit + tracking events + share link
- `/dashboard/proposals/[id]/preview` - Preview as client sees it
- `/dashboard/clients` - Clients list (CRM lite)
- `/dashboard/clients/[id]` - Client detail + proposal history
- `/dashboard/templates` - Templates library
- `/settings/billing` - Billing (boilerplate)
- `/settings/profile` - Profile + brand settings

### API Routes
- `POST /api/proposals/generate` - AI structured generation
- `POST /api/proposals/regenerate-section` - Regenerate one section
- `POST /api/proposals/[id]/pricing-suggest` - AI pricing calculator
- `GET /api/proposals/[id]/pdf` - PDF export
- `POST /api/proposals/[id]/share` - Generate share link
- `POST /api/public/proposals/[token]/event` - Track view/accept/decline
- `POST /api/public/proposals/[token]/comment` - Add comment
- CRUD: `/api/clients`, `/api/templates`
- Stripe: checkout, portal, webhook (boilerplate)

## AI Generation

### One-shot structured generation
- Uses Vercel AI SDK `generateObject()` with Zod schema
- Model: Sonnet 4.5 (paid), Haiku 4.5 (free)
- Input: project brief + template sections + brand context
- Output: JSON with typed sections array

### Section regeneration
- Regenerate individual section with context of other sections
- Same model selection by plan

### AI Pricing Calculator
- Input: scope, project type, market
- Output: suggested range, hourly rate, fixed price, confidence

## Client Portal

Public page at `/p/[token]`:
- Freelancer branding (logo + colors)
- Full proposal rendered
- Accept / Request Changes / Decline buttons
- Comment section
- Tracking pixel for view events
- Optional password protection
- Email notification to freelancer on events

## Export

### PDF
- `@react-pdf/renderer` with brand colors
- Cover page, sections, pricing table, terms, footer
- Download via `/api/proposals/[id]/pdf`

### Copy to Clipboard
- Client-side: copies proposal as rich HTML text
- User pastes into Google Docs/Word with formatting preserved

## Usage Limits

| Feature | Free (2/mo) | Pro $29/mo (20/mo) | Business $99/mo |
|---------|-------------|---------------------|-----------------|
| Proposals/month | 2 | 20 | Unlimited |
| AI model | Haiku | Sonnet | Sonnet |
| Templates | 3 basic | All | All + custom |
| PDF export | Yes | Yes | Yes |
| Client portal | View only | Full (accept/decline/comments) | Full |
| Tracking | No | Yes | Yes |
| CRM clients | 5 max | 50 | Unlimited |
| Brand customization | No | Yes | Yes |
| Pricing calculator | No | Yes | Yes |

## System Templates

5 built-in templates:
1. **Web Development** - Phases, tech stack, milestone pricing
2. **Graphic Design** - Creative brief, revisions, deliverable formats
3. **Digital Marketing** - Strategy, channels, KPIs, monthly retainer
4. **Consulting** - Problem statement, methodology, recommendations
5. **Content/Copywriting** - Content strategy, deliverables, revision rounds

## Tech Stack

From boilerplate:
- Next.js 16 (App Router), TypeScript strict
- Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- Vercel AI SDK 6 + Claude
- Stripe (subscriptions)
- Vercel (deploy)

Added:
- `@react-pdf/renderer` - PDF generation
- No additional major dependencies

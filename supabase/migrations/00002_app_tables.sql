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
create policy "Proposal owners can view comments" on public.proposal_comments
  for select using (
    exists (
      select 1 from public.proposals
      where proposals.id = proposal_comments.proposal_id
        and proposals.user_id = auth.uid()
    )
  );

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  company text,
  segment text,
  status text not null default 'novo',
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  project_type text not null,
  objective text,
  pages jsonb not null default '[]'::jsonb,
  style text,
  features jsonb not null default '[]'::jsonb,
  content_status jsonb not null default '{}'::jsonb,
  domain_status text,
  deadline text,
  estimated_total numeric(12,2),
  notes text,
  submission_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_site_quotes_lead_id on public.site_quotes(lead_id);
create index if not exists idx_site_quotes_created_at on public.site_quotes(created_at desc);

alter table public.leads enable row level security;
alter table public.site_quotes enable row level security;

revoke all on public.leads from anon, authenticated;
revoke all on public.site_quotes from anon, authenticated;

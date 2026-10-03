create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  company text,
  segment text,
  status text not null default 'novo' check (status in ('novo','contatado','reuniao','proposta','negociacao','fechado','perdido')),
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
create index if not exists idx_leads_phone on public.leads(phone);
create index if not exists idx_site_quotes_lead_id on public.site_quotes(lead_id);
create index if not exists idx_site_quotes_created_at on public.site_quotes(created_at desc);

alter table public.leads enable row level security;
alter table public.site_quotes enable row level security;

revoke all on public.leads from anon, authenticated;
revoke all on public.site_quotes from anon, authenticated;
grant insert on public.leads to anon;
grant insert on public.site_quotes to anon;

drop policy if exists "public_can_submit_leads" on public.leads;
create policy "public_can_submit_leads"
on public.leads
for insert
to anon
with check (
  char_length(name) between 2 and 120
  and char_length(phone) between 8 and 50
  and status = 'novo'
);

drop policy if exists "public_can_submit_site_quotes" on public.site_quotes;
create policy "public_can_submit_site_quotes"
on public.site_quotes
for insert
to anon
with check (
  char_length(project_type) between 2 and 120
  and submission_id is not null
  and char_length(submission_id) between 8 and 100
);

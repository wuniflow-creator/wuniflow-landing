alter table public.leads
  add column if not exists lead_score integer not null default 0 check (lead_score between 0 and 100),
  add column if not exists lead_temperature text not null default 'frio' check (lead_temperature in ('quente','morno','frio'));

create index if not exists idx_leads_temperature_created_at
  on public.leads(lead_temperature, created_at desc);
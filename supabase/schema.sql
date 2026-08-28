create table if not exists public.crisis_records (
  collection text not null check (collection in ('roads', 'facilities', 'zones', 'assets', 'routes', 'timeline_events', 'intelligence_reports')),
  record_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, record_id)
);

create index if not exists crisis_records_collection_idx on public.crisis_records (collection);

alter table public.crisis_records enable row level security;

create policy "Public crisis data is readable"
  on public.crisis_records for select
  to anon, authenticated
  using (true);

create table if not exists public.road_confidence (
  road_id text primary key,
  confidence_score integer not null check (confidence_score between 0 and 100),
  uncertainty_description text not null,
  sources jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.road_confidence enable row level security;
create policy "Public road confidence is readable"
  on public.road_confidence for select
  to anon, authenticated
  using (true);

create table if not exists public.road_simulations (
  id bigint generated always as identity primary key,
  road_id text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.road_simulations enable row level security;
create policy "Authenticated users can create simulations"
  on public.road_simulations for insert
  to authenticated
  with check (true);
create policy "Users can read simulations"
  on public.road_simulations for select
  to authenticated
  using (true);

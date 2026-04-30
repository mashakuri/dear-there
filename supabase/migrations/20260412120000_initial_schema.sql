-- Dear, There — initial schema (profiles, spots, entries, storage)
-- Run via Supabase CLI (`supabase db push`) or SQL editor in the dashboard.

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App profile row per auth user; created by trigger on signup.';

-- ---------------------------------------------------------------------------
-- Spots — map pin locations (shared when multiple entries exist at same place)
-- ---------------------------------------------------------------------------
create table public.spots (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null,
  longitude double precision not null,
  place_label text,
  created_at timestamptz not null default now(),
  constraint spots_lat_range check (latitude between -90 and 90),
  constraint spots_lng_range check (longitude between -180 and 180)
);

create index spots_lat_lng_idx on public.spots (latitude, longitude);

comment on table public.spots is 'Geographic location for one or more entries.';

-- ---------------------------------------------------------------------------
-- Entries — postcards / letters
-- ---------------------------------------------------------------------------
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  photo_path text,
  is_private boolean not null default false,
  like_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entries_title_len check (char_length(title) <= 200),
  constraint entries_body_len check (char_length(body) <= 20000)
);

create index entries_spot_created_idx
  on public.entries (spot_id, created_at desc);

create index entries_spot_popular_idx
  on public.entries (spot_id, like_count desc, created_at desc);

create index entries_user_idx on public.entries (user_id, created_at desc);

create index entries_public_by_spot_idx
  on public.entries (spot_id, created_at desc)
  where is_private = false;

comment on table public.entries is 'User-authored note at a spot; public map shows non-private rows only.';

-- ---------------------------------------------------------------------------
-- updated_at helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.entries enable row level security;

-- Profiles: own row only
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Spots: readable by anyone (map); writable by authenticated users
create policy "spots_select_all"
  on public.spots for select
  using (true);

create policy "spots_insert_authenticated"
  on public.spots for insert
  to authenticated
  with check (true);

-- Entries: public reads for shared posts; full access for owner
create policy "entries_select_public_or_own"
  on public.entries for select
  using (
    auth.uid() = user_id
    or is_private = false
  );

create policy "entries_insert_authenticated"
  on public.entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.entries for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: postcard images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('entry-photos', 'entry-photos', true)
on conflict (id) do nothing;

-- Objects live under {user_id}/... ; public bucket for simple reads (tighten later if needed)
create policy "entry_photos_select"
  on storage.objects for select
  using (bucket_id = 'entry-photos');

create policy "entry_photos_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'entry-photos'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "entry_photos_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "entry_photos_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create type access_type as enum ('free', 'subscription', 'purchase', 'subscription_or_purchase');
create type order_status as enum ('pending', 'paid', 'refunded', 'failed');

create table movies (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', poster_url text, access access_type not null default 'subscription_or_purchase', price_cents integer, preview_seconds integer not null default 0, stream_video_uid text unique, created_at timestamptz not null default now()
);
alter table movies enable row level security;
create policy "Public can read movies" on movies for select using (true);

create table orders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), status order_status not null default 'pending', provider text not null, amount_cents integer not null, currency text not null default 'CNY', created_at timestamptz not null default now()
);
create table order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade, movie_id uuid not null references movies(id), title text not null, unit_price_cents integer not null check (unit_price_cents >= 0), quantity integer not null default 1 check (quantity > 0), unique (order_id, movie_id)
);
create table entitlements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), movie_id uuid references movies(id), source text not null check (source in ('purchase', 'subscription')), starts_at timestamptz not null default now(), expires_at timestamptz
);
create table playback_progress (
  user_id uuid not null references auth.users(id) on delete cascade, movie_id uuid not null references movies(id) on delete cascade, position_seconds integer not null default 0 check (position_seconds >= 0), updated_at timestamptz not null default now(), primary key (user_id, movie_id)
);
alter table playback_progress enable row level security;
create policy "Users manage own playback progress" on playback_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

# 收藏功能数据库迁移

适用于已经运行过旧版 `supabase/schema.sql` 的项目。

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

alter table favorites enable row level security;

create policy "Users can read own favorites"
  on favorites for select using (auth.uid() = user_id);
create policy "Users can add own favorites"
  on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites"
  on favorites for delete using (auth.uid() = user_id);

create index if not exists favorites_user_created_idx
  on favorites(user_id, created_at desc);
```

执行后刷新应用。收藏数据按登录用户隔离，未登录用户点击收藏会跳转登录页。

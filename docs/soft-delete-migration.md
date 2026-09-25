# 影片状态与软删除升级

现有数据库请在 Supabase SQL Editor 执行：

```sql
alter table movies add column if not exists status text not null default 'draft'
  check (status in ('draft','published','archived'));
alter table movies add column if not exists deleted_at timestamptz;
drop policy if exists "Public can read movies" on movies;
drop policy if exists "Public can read published movies" on movies;
create policy "Public can read published movies"
on movies for select
using (status='published' and deleted_at is null);
```

升级后，现有影片默认为草稿。到 `/admin/movies` 将需要展示的影片状态改为“已发布”。“下架并删除”采用软删除：只归档数据库记录，保留订单、权益、播放记录和 Cloudflare 原视频。

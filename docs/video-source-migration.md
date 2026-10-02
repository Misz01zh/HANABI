# 双视频来源数据库迁移

现有 HANABI 数据库执行以下 SQL；全新环境直接执行 `supabase/schema.sql`。

```sql
alter table public.movies
  add column if not exists video_source text not null default 'cloudflare_stream',
  add column if not exists storage_bucket text,
  add column if not exists storage_path text;

alter table public.movies
  drop constraint if exists movies_video_source_check;

alter table public.movies
  add constraint movies_video_source_check
  check (video_source in ('cloudflare_stream', 'supabase_storage'));
```

## Supabase Storage 设置

1. 在 Supabase Storage 创建私有桶，例如 `movies`。
2. 上传 MP4 文件，例如 `features/hanabi.mp4`。
3. 后台影片管理中选择“Supabase Storage”。
4. 存储桶填写 `movies`，文件路径填写 `features/hanabi.mp4`。
5. 保持 `SUPABASE_SERVICE_ROLE_KEY` 只在服务端环境变量中配置。

播放接口会先验证登录和观看权益，再通过 Service Role 为私有对象签发 15 分钟有效的临时 URL。不要把桶设置成公开，也不要把 Service Role Key 暴露给浏览器。

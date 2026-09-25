# 商城商品功能数据库升级

已有数据库请在 Supabase SQL Editor 执行：

```sql
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image_url text,
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
alter table products enable row level security;
drop policy if exists "Public can read published products" on products;
create policy "Public can read published products" on products for select
using (status='published' and deleted_at is null);

alter table order_items alter column movie_id drop not null;
alter table order_items add column if not exists product_id uuid references products(id);
alter table order_items drop constraint if exists order_items_order_id_movie_id_key;
create unique index if not exists order_items_movie_unique on order_items(order_id,movie_id) where movie_id is not null;
create unique index if not exists order_items_product_unique on order_items(order_id,product_id) where product_id is not null;
```

执行后进入 `/admin/products` 创建商品。只有“已上架”、未软删除且库存大于 0 的商品会显示在 `/shop`。

影片购买不再使用购物车；商品加入购物车后从 `/checkout` 创建商品订单。支付 Webhook 将商品订单改为已支付并扣减库存。

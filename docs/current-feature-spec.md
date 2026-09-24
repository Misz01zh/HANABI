# HANABI 当前功能式样书（v1.6）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- 真实影片目录、影片详情、本地购物车、待支付订单与支付成功履约。
- HMAC 支付 Webhook 骨架，以及 Cloudflare Stream 短时播放令牌、播放进度保存和自动续播。
- 管理后台通过 Supabase `app_metadata.role = admin` 验证管理员，可列出、创建和编辑影片。
- 影片支持标题、简介、HTTPS 海报 URL、访问方式、单片价格、试看时长和 Stream Video UID。
- 商城首页与影片详情页显示海报；管理员创建和编辑接口支持海报 URL，并在编辑时限制为 HTTPS。

## 配置
需配置 Supabase、Cloudflare Stream、支付渠道凭证、`PAYMENT_WEBHOOK_SECRET` 和 `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE`；不得提交真实密钥。

## 尚未实现
- 管理后台的影片删除、Cloudflare Stream 直传和海报文件上传。
- 支付渠道真实回调适配、服务端 Cookie 会话、跨浏览器 HLS 和服务端试看限制。
- 更完整的管理端审计和 RLS 策略。

## 数据库升级
现有数据库需要执行：`alter table movies add column poster_url text;`。全新环境可直接执行 `supabase/schema.sql`。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

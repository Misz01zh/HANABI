# HANABI 当前功能式样书（v1.7）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- 真实影片目录、影片详情、HTTPS 海报、本地购物车、待支付订单与支付成功履约。
- HMAC 支付 Webhook 骨架，以及 Cloudflare Stream 短时播放令牌、播放进度保存和自动续播。
- 管理后台通过 Supabase `app_metadata.role = admin` 验证管理员，可列出、创建和编辑影片及海报 URL。
- `docs/deployment-guide.md` 提供 Supabase 初始化、管理员设置、Cloudflare Stream、环境变量、本地启动、生产构建、Vercel/Node.js 部署、上线检查和故障排查指南。
- `.env.example` 已补充 `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE` 与 `PAYMENT_WEBHOOK_SECRET`。

## 配置
部署所需变量以 `.env.example` 为准；任何 Service Role、Stream 私钥、支付密钥和 Webhook Secret 都不得提交或暴露给浏览器。

## 尚未实现
- 管理后台的影片删除、Cloudflare Stream 直传和海报文件上传。
- 支付渠道官方回调适配、服务端 Cookie 会话、跨浏览器 HLS 和服务端试看限制。
- 更完整的管理端审计、数据库迁移体系和 RLS 策略。

## 数据库升级
现有数据库从 v1.5 升级时执行：`alter table movies add column if not exists poster_url text;`。全新环境可执行 `supabase/schema.sql`。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

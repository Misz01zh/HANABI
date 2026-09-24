# HANABI 当前功能式样书（v0.4）

## 目标
构建“商城 + 正版影片点播”平台，支持免费、会员可看与单片购买。

## 已实现
- Next.js 商城首页与影片卡片。
- 影片权限：`free`、`subscription`、`purchase`、`subscription_or_purchase`。
- Supabase 邮箱密码登录页：`app/login/page.tsx` 使用 `signInWithPassword`。
- Stripe、微信支付、支付宝统一支付接口定义。
- Supabase 影片、订单、观看权益数据表。
- Cloudflare Stream RS256 签名令牌模块 `lib/stream-token.ts`：按影片 ID 与用户 ID 签发，默认有效期 15 分钟。
- `POST /api/playback-token`：验证 Supabase Bearer Token，校验免费、有效会员或单片购买权益，并按影片的 Stream Video UID 签发短时令牌。
- `.env.example` 已列出 `CLOUDFLARE_STREAM_SIGNING_KEY_ID`，用于签名密钥识别。

## 播放授权流程
1. 客户端携带 Supabase Access Token 和 `movieId` 请求 `POST /api/playback-token`。
2. 服务端验证登录及免费、会员或购买权益。
3. 服务端调用 `createPlaybackToken()` 签发 15 分钟短时令牌。
4. 播放器使用令牌访问 HLS 视频流。

## 配置
`.env.example` 不得包含真实密钥。部署环境需设置：
- `CLOUDFLARE_STREAM_SIGNING_KEY_ID`
- `CLOUDFLARE_STREAM_SIGNING_KEY`
- Supabase、Stripe、微信支付、支付宝对应凭证。

## 尚未实现
- 注册、退出、服务端会话与个人中心。
- 商品详情、购物车、下单、订单查询。
- 真实支付、回调、退款与权益回收。
- Cloudflare Stream 实际上传、播放器接入、试看与播放记录。
- 管理后台、影片上传、RLS 权限策略。

## 维护规则
后续每次功能提交后，必须同步更新本式样书的已实现功能、配置和待办事项。

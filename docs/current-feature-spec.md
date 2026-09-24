# HANABI 当前功能式样书（v0.2）

## 目标

构建“商城 + 正版影片点播”平台，支持免费、会员可看与单片购买。

## 已实现

- Next.js 商城首页与影片卡片。
- 影片权限：`free`、`subscription`、`purchase`、`subscription_or_purchase`。
- Stripe、微信支付、支付宝的统一支付接口定义。
- Supabase 影片、订单、观看权益数据表。
- `/api/playback-token` 播放授权接口占位。
- Cloudflare Stream RS256 签名令牌模块 `lib/stream-token.ts`：按影片 ID 与用户 ID 签发，默认有效期 15 分钟。

## 播放授权流程

1. 用户请求播放。
2. 服务端验证登录及免费、会员或购买权益。
3. 服务端调用 `createPlaybackToken()` 签发短时令牌。
4. 播放器使用令牌访问 HLS 视频流。

## 配置

`.env.example` 不得包含真实密钥。部署环境需设置：

- `CLOUDFLARE_STREAM_SIGNING_KEY_ID`
- `CLOUDFLARE_STREAM_SIGNING_KEY`
- Supabase、Stripe、微信支付、支付宝对应凭证

## 尚未实现

- 用户认证与真实权益查询
- 真实支付、回调、退款与权益回收
- Cloudflare Stream 实际上传与播放器集成
- 管理后台、影片上传、RLS 权限策略

## 维护规则

后续每次功能提交后，必须同步更新本式样书的已实现功能、配置和待办事项。

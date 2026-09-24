# HANABI 当前功能式样书（v1.3）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- 真实影片目录、公开只读 RLS、影片详情、本地购物车和待支付订单创建。
- 支付成功履约服务与 HMAC 校验的统一 Webhook 骨架。
- 受保护 Cloudflare Stream 播放器：短时令牌、播放进度每 15 秒上报、播放进度读取和自动续播。
- `playback_progress` 以用户与影片为联合主键，并由 RLS 限制为仅本人访问。

## 配置
需配置 Supabase、Cloudflare Stream、支付渠道凭证、`PAYMENT_WEBHOOK_SECRET`、`NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE`；不得提交真实密钥。

## 尚未实现
- 支付渠道真实回调适配、服务端 Cookie 会话、跨浏览器 HLS 和服务端试看限制。
- Cloudflare Stream 上传、管理后台与 RLS 策略完善。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

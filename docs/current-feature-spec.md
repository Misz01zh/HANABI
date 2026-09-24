# HANABI 当前功能式样书（v1.2）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- Supabase 真实影片目录、公开只读 RLS、影片详情和本地购物车。
- 结算页可创建待支付订单；支付成功履约服务授予购买权益并更新订单状态。
- HMAC 校验的统一支付 Webhook 骨架。
- 受保护 Cloudflare Stream 播放器：通过短时令牌加载 HLS 视频。
- `POST /api/playback-progress` 保存登录用户的播放进度；播放器每 15 秒上报一次。
- `playback_progress` 以用户与影片为联合主键，并使用 RLS 限制用户仅能访问自己的记录。

## 配置
需配置 Supabase、Cloudflare Stream、支付渠道凭证、`PAYMENT_WEBHOOK_SECRET` 和 `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE`；不得提交真实密钥。

## 尚未实现
- 支付渠道真实回调适配、服务端 Cookie 会话、跨浏览器 HLS 与服务端试看限制。
- Cloudflare Stream 上传、播放续播读取、管理后台和 RLS 策略完善。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

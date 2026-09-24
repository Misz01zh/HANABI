# HANABI 当前功能式样书（v1.1）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- Supabase 真实影片目录、公开只读 RLS、影片详情和本地购物车。
- 结算页可创建待支付订单；订单含服务端价格和订单明细。
- 支付成功履约服务会授予购买权益并将订单标记为 `paid`。
- HMAC 校验的统一支付 Webhook 骨架。
- `POST /api/playback-token` 验证登录与观看权益后签发 15 分钟 Cloudflare Stream 播放令牌。
- `SecureVideoPlayer` 已接入影片详情页：取得短时令牌后生成受保护的 Cloudflare Stream HLS 地址；影片设置试看时长时会显示提示。

## 配置
需配置 Supabase、Cloudflare Stream、支付渠道凭证，以及：
- `PAYMENT_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE`

不得提交真实密钥。

## 尚未实现
- 将各支付渠道真实回调格式、签名算法与结算跳转适配到统一 Webhook。
- 跨浏览器 HLS 播放器支持，以及服务端强制的试看时长限制。
- 服务端 Cookie 会话、Cloudflare Stream 实际上传、播放记录、管理后台与 RLS 完善。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

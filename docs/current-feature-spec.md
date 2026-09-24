# HANABI 当前功能式样书（v1.0）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- Supabase 真实影片目录、公开只读 RLS、影片详情和本地购物车。
- 结算页可创建待支付订单；订单含服务端价格和订单明细。
- `lib/fulfill-order.ts` 在支付成功后授予购买权益并将订单标记为 `paid`。
- `POST /api/payments/webhook`：以 `PAYMENT_WEBHOOK_SECRET` 的 HMAC-SHA256 校验 `x-hanabi-signature`，仅对 `paid: true` 的有效回调执行订单履约。
- 视频权限校验与 Cloudflare Stream 短时播放令牌。

## 配置
需配置 Supabase、Cloudflare Stream、支付渠道凭证，以及 `PAYMENT_WEBHOOK_SECRET`；不得提交真实密钥。

## 尚未实现
- 将各支付渠道真实回调格式、签名算法与结算跳转适配到统一 Webhook。
- 服务端 Cookie 会话、Cloudflare Stream 上传和播放器、管理后台与 RLS 完善。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

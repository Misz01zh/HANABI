# HANABI 当前功能式样书（v1.5）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- 真实影片目录、公开只读 RLS、影片详情、本地购物车和待支付订单创建。
- 支付成功履约服务与 HMAC 校验的统一支付 Webhook 骨架。
- 受保护 Cloudflare Stream 播放器：短时令牌、播放进度保存和自动续播。
- 播放进度使用用户与影片联合主键，并由 RLS 限制为仅本人访问。
- 管理后台 `/admin/movies` 以 Supabase `app_metadata.role = admin` 验证管理员，可列出、创建和编辑影片。
- 管理员可维护标题、简介、访问方式、单片价格、试看时长和 Cloudflare Stream Video UID；编辑接口会验证允许的字段和值域。

## 配置
需配置 Supabase、Cloudflare Stream、支付渠道凭证、`PAYMENT_WEBHOOK_SECRET` 和 `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE`；不得提交真实密钥。

## 尚未实现
- 管理后台的影片删除、Stream 上传与海报管理。
- 支付渠道真实回调适配、服务端 Cookie 会话、跨浏览器 HLS 和服务端试看限制。
- 更完整的管理端审计和 RLS 策略。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

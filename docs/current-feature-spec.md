# HANABI 当前功能式样书（v0.9）

## 已实现
- Supabase 邮箱密码注册、登录、退出与个人中心；当前使用浏览器会话持久化。
- 首页和影片详情页从 Supabase `movies` 表读取真实影片；影片表支持描述、价格、试看时长和公开只读 RLS。
- 购物车保存真实影片 UUID；结算页可选择渠道并调用 `POST /api/orders` 创建待支付订单。
- `POST /api/orders` 使用服务端价格创建 `pending` 订单和 `order_items`。
- `lib/fulfill-order.ts` 提供仅服务端调用的支付成功履约服务：读取待支付订单、创建购买权益并将订单更新为 `paid`；重复履约会安全返回。
- `POST /api/playback-token` 验证登录与观看权益后签发 15 分钟 Cloudflare Stream 播放令牌。

## 配置
部署环境需设置 Supabase、Cloudflare Stream、Stripe、微信支付和支付宝对应凭证；不得提交真实密钥。

## 尚未实现
- Stripe、微信支付、支付宝的结算跳转、签名验证 Webhook，以及由 Webhook 调用订单履约服务。
- 服务端 Cookie 会话与路由级访问保护。
- Cloudflare Stream 实际上传、播放器接入、试看与播放记录。
- 管理后台、影片上传、RLS 权限策略完善。

## 维护规则
后续每次功能提交后，必须同步更新本式样书的已实现功能、配置和待办事项。

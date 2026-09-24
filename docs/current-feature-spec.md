# HANABI 当前功能式样书（v0.8）

## 目标
构建“商城 + 正版影片点播”平台，支持免费、会员可看与单片购买。

## 已实现

### 认证
- Supabase 邮箱密码注册、登录、退出与个人中心；当前使用浏览器会话持久化。

### 商城与订单
- 首页与影片详情页通过 `lib/movies.ts` 从 Supabase `movies` 表读取真实影片。
- `movies` 表包含标题、描述、访问类型、价格、试看时长和 Stream Video UID，并启用允许公开读取的 RLS 策略。
- 影片详情页可将付费影片加入浏览器本地购物车；购物车保存真实影片 UUID。
- 结算页支持选择 Stripe、微信支付或支付宝，并携带登录令牌调用 `POST /api/orders`。
- `POST /api/orders` 使用服务端价格创建 `pending` 订单和 `order_items`，并返回订单号。
- Supabase 已定义影片、订单、订单明细与观看权益数据表。

### 视频播放
- 影片权限：`free`、`subscription`、`purchase`、`subscription_or_purchase`。
- `lib/stream-token.ts` 生成 15 分钟 Cloudflare Stream RS256 签名令牌。
- `POST /api/playback-token` 验证登录与观看权益后签发播放令牌。

## 配置
`.env.example` 不得包含真实密钥。部署环境需设置：
- `CLOUDFLARE_STREAM_SIGNING_KEY_ID`、`CLOUDFLARE_STREAM_SIGNING_KEY`
- Supabase、Stripe、微信支付、支付宝对应凭证。

## 尚未实现
- 支付渠道的结算跳转、签名验证回调、退款与权益授予/回收。
- 服务端 Cookie 会话与路由级访问保护。
- Cloudflare Stream 实际上传、播放器接入、试看与播放记录。
- 管理后台、影片上传、RLS 权限策略完善。

## 维护规则
后续每次功能提交后，必须同步更新本式样书的已实现功能、配置和待办事项。

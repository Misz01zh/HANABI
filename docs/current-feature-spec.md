# HANABI 当前功能式样书（v0.7）

## 目标
构建“商城 + 正版影片点播”平台，支持免费、会员可看与单片购买。

## 已实现

### 认证
- Supabase 邮箱密码登录页：`app/login/page.tsx` 使用 `signInWithPassword`；登录成功后跳转个人中心。
- `app/register/page.tsx`：支持邮箱密码注册；当 Supabase 要求邮箱确认时提示用户查收邮件。
- `app/account/page.tsx`：读取当前 Supabase 用户、未登录时跳转登录页，并提供退出登录。
- 当前认证方案使用 Supabase 浏览器会话持久化。

### 商城与订单
- `lib/catalog.ts` 提供统一的示例影片商品目录。
- 首页展示商品目录，并可进入影片详情、购物车和个人中心。
- `/movies/[slug]` 影片详情页展示购买方式、单片价格或试看时长；可将付费影片加入购物车。
- `lib/cart.ts` 与 `/cart` 使用浏览器本地存储维护购物车、移除商品和计算人民币合计。
- `/checkout` 展示待结算商品与应付金额；真实支付尚未接入。
- `POST /api/orders`：验证 Supabase Bearer Token，使用服务端密钥读取真实影片价格，创建 `pending` 订单和 `order_items`，支持 Stripe、微信支付、支付宝三种渠道标识。
- Supabase 已定义影片、订单、订单明细（`order_items`）与观看权益数据表。
- Stripe、微信支付、支付宝统一支付接口定义。

### 视频播放
- 影片权限：`free`、`subscription`、`purchase`、`subscription_or_purchase`。
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
- 将前端示例商品目录替换为 Supabase 真实影片 UUID，并调用订单创建接口。
- 支付渠道的结算跳转、签名验证回调、退款与权益授予/回收。
- 服务端 Cookie 会话与路由级访问保护。
- Cloudflare Stream 实际上传、播放器接入、试看与播放记录。
- 管理后台、影片上传、RLS 权限策略。

## 维护规则
后续每次功能提交后，必须同步更新本式样书的已实现功能、配置和待办事项。

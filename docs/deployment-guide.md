# HANABI 部署与启动指南

本指南适用于当前 HANABI 项目：Next.js 15、React 19、Supabase、Cloudflare Stream，以及 Stripe/微信支付/支付宝预留接口。

## 1. 前置条件

- Node.js 20 LTS（推荐）与 npm。
- 一个 Supabase 项目。
- 一个启用 Stream 的 Cloudflare 账号。
- 生产部署平台：Vercel，或任何可长期运行 Node.js 的服务器。
- 如需真实收款，还需相应支付渠道的商户账号和密钥。

## 2. 获取代码

```bash
git clone https://github.com/Misz01zh/HANABI.git
cd HANABI
npm install
```

## 3. 初始化 Supabase

1. 在 Supabase 创建项目。
2. 打开 SQL Editor。
3. 全新数据库执行仓库中的 `supabase/schema.sql`。
4. 已部署过旧版本时不要重复执行完整建表脚本，只执行缺少的升级语句。例如 v1.5 升级到 v1.6：

```sql
alter table movies add column if not exists poster_url text;
```

数据库包含：

- `movies`：影片、价格、试看时长、海报和 Stream UID。
- `orders`、`order_items`：订单及明细。
- `entitlements`：会员或单片购买观看权益。
- `playback_progress`：用户播放进度。

### 设置管理员

先在应用中注册管理员邮箱，然后在 Supabase SQL Editor 中执行（替换邮箱）：

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

重新登录后，访问 `/admin/movies`。管理员身份只从受 Supabase 保护的 `app_metadata` 读取，不要把角色放入用户可自行修改的 `user_metadata`。

## 4. 配置 Cloudflare Stream

1. 在 Cloudflare Stream 控制台获取 Account ID 和 Customer Code。
2. 创建 Stream 签名密钥并保存 Key ID 与私钥。
3. 对需要保护的影片启用 Require Signed URLs。
4. 上传影片后，将 Video UID 填入 HANABI 管理后台。
5. 私钥中的换行必须由部署平台正确保存；不要提交到 Git。

播放器使用如下受保护 HLS 地址：

`https://customer-<CUSTOMER_CODE>.cloudflarestream.com/<VIDEO_UID>/manifest/video.m3u8?token=<TOKEN>`

Cloudflare 参考：[保护 Stream 视频](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/) 与 [自定义播放器](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/)。

## 5. 环境变量

复制示例文件：

```bash
cp .env.example .env.local
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env.local
```

填写：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CLOUDFLARE_ACCOUNT_ID=your-account-id
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE=your-customer-code
CLOUDFLARE_STREAM_SIGNING_KEY_ID=your-signing-key-id
CLOUDFLARE_STREAM_SIGNING_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

PAYMENT_WEBHOOK_SECRET=generate-a-long-random-secret
STRIPE_SECRET_KEY=
WECHAT_PAY_MCHID=
ALIPAY_APP_ID=
```

安全要求：

- 只有以 `NEXT_PUBLIC_` 开头的变量会进入浏览器。
- `SUPABASE_SERVICE_ROLE_KEY`、Stream 私钥、支付密钥和 Webhook Secret 必须仅存在于服务端。
- 不要把 `.env.local`、密钥、Webhook 请求样例或生产日志提交到仓库。

## 6. 本地启动

```bash
npm run dev
```

打开 `http://localhost:3000`。建议依次验证：

1. 注册、邮箱确认与登录。
2. 管理员进入 `/admin/movies` 创建影片。
3. 商城首页与详情页显示影片和海报。
4. 加入购物车并创建待支付订单。
5. 具有权益的账号能够取得播放令牌、播放并保存进度。

## 7. 生产构建验证

提交部署前必须执行：

```bash
npm run build
npm run start
```

`npm run build` 用于发现 TypeScript、服务端渲染和路由构建错误；`npm run start` 默认监听 3000 端口。Next.js 官方也建议先构建再以生产模式启动：[Next.js 部署文档](https://nextjs.org/docs/app/getting-started/deploying)。

## 8. 部署到 Vercel

1. 在 Vercel 导入 GitHub 仓库 `Misz01zh/HANABI`。
2. Framework Preset 选择 Next.js。
3. Build Command 使用 `npm run build`。
4. 在 Project Settings → Environment Variables 添加第 5 节变量。
5. 同时配置 Production、Preview；支付回调通常只应指向 Production。
6. 部署后在 Supabase Authentication 的 Site URL 和 Redirect URLs 中加入生产域名及 `/account`。
7. 将支付平台 Webhook 地址配置为：

`https://你的域名/api/payments/webhook`

当前统一 Webhook 使用请求原文的 HMAC-SHA256，并从 `x-hanabi-signature` 读取十六进制签名。正式接入 Stripe、微信支付或支付宝前，必须改成对应平台官方签名算法与事件格式。

## 9. 部署到普通 Node.js 服务器

```bash
npm ci
npm run build
PORT=3000 npm run start
```

建议使用 systemd、PM2 或容器保证进程重启，并使用 Nginx/Caddy 终止 HTTPS、反向代理到 3000 端口。所有生产环境变量应由服务器密钥管理或进程管理器注入，而不是写入仓库。

## 10. 上线检查清单

- `npm run build` 成功。
- Supabase 表结构、RLS 与管理员角色已配置。
- Service Role Key 未出现在浏览器请求或构建产物中。
- Cloudflare Stream 影片启用签名 URL，Customer Code、Key ID、私钥匹配。
- 注册、登录、购物车、订单、播放授权、进度保存可用。
- Webhook 拒绝缺少或错误签名的请求。
- 生产域名使用 HTTPS。
- 支付渠道尚未完成官方签名适配时，不要开启真实收款。

## 11. 常见问题

### 首页没有影片

检查 `movies` 表是否有数据、公开读取 RLS 是否存在，以及 Supabase URL/Anon Key 是否正确。

### 管理后台返回 403

确认当前用户的 `app_metadata.role` 为 `admin`，修改角色后退出并重新登录刷新令牌。

### 播放器提示未配置

检查 `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE`、Stream UID、签名 Key ID 和私钥。部署平台修改环境变量后需重新部署。

### 影片无法播放

确认影片已启用签名 URL、用户具有免费/会员/购买权益，并检查 `POST /api/playback-token` 的状态码。当前原生 `video` 对 HLS 的浏览器支持有限，跨浏览器 HLS 仍属于待实现功能。

### 订单创建失败

确认 `SUPABASE_SERVICE_ROLE_KEY` 只在服务端配置，商品 UUID 来自真实 `movies` 表，并查看服务器日志中的 Supabase 错误。

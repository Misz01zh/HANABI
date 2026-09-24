# HANABI 当前功能式样书（v1.8）

## 已实现
- Supabase 注册、登录、退出和个人中心。
- 真实影片目录、影片详情、HTTPS 海报、本地购物车、订单与支付履约骨架。
- Cloudflare Stream 短时令牌、受保护播放、播放进度保存和自动续播。
- 管理后台可列出、创建和编辑影片及海报 URL。
- `tsconfig.json` 配置 `@/*` 根目录路径别名；`next-env.d.ts` 提供 Next.js TypeScript 类型声明。
- `docs/deployment-guide.md` 提供完整部署启动指南；`docs/troubleshooting.md` 记录 PowerShell npm、路径别名和环境变量故障处理。

## 配置
部署所需变量以 `.env.example` 为准；服务端密钥不得提交或暴露给浏览器。

## 尚未实现
- 管理后台影片删除、Cloudflare Stream 直传与海报文件上传。
- 支付渠道官方回调适配、服务端 Cookie 会话、跨浏览器 HLS 与服务端试看限制。
- 自动化测试、正式数据库迁移体系、审计与更完整的 RLS。

## 维护规则
后续每次功能提交后，必须同步更新本式样书。

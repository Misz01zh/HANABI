# HANABI 常见启动故障

## PowerShell 无法运行 npm.ps1

如果显示 `PSSecurityException`，可直接使用不依赖 PowerShell 脚本的命令：

```powershell
npm.cmd install
npm.cmd run dev
```

也可以仅为当前终端临时允许脚本：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Module not found: Can't resolve '@/lib/...'

项目使用 `@/` 作为仓库根目录别名。确认已拉取包含 `tsconfig.json` 和 `next-env.d.ts` 的最新代码：

```powershell
git pull
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run dev
```

`tsconfig.json` 必须包含：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

如果错误仍然存在，检查对应文件是否存在，例如 `lib/cart.ts`，并确认文件名大小写与 import 完全一致。

## 修改环境变量后没有生效

停止开发服务器，确认变量写在项目根目录的 `.env.local` 中，然后重新执行：

```powershell
npm.cmd run dev
```

生产部署平台修改环境变量后通常需要重新部署。

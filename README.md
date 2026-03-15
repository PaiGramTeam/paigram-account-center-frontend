# Paigram Account Center

Paigram Account Center 系统前端，为终端用户提供账号管理界面。

## 项目结构

这是一个使用 Bun 构建的 monorepo 项目，包含以下三个主要包：

```
paigram-account-center/
├── packages/
│   ├── user-app/          # 用户端应用
│   ├── admin-app/         # 管理端应用
│   └── shared-components/ # 共享组件库
```

## 技术栈

- **构建工具**: Bun + Vite
- **框架**: Vue 3 + TypeScript
- **UI 组件库**: Arco Design Vue
- **样式**: Tailwind CSS
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **自动导入**: unplugin-auto-import + unplugin-vue-components

## 快速开始

### 安装依赖

```bash
bun install
```

### 开发命令

```bash
# 启动用户端开发服务器
bun run dev:user

# 启动管理端开发服务器
bun run dev:admin

# 构建用户端
bun run build:user

# 构建管理端
bun run build:admin

# 构建所有应用
bun run build:all
```

## Cloudflare Pages 部署

当前前端包含两个可独立部署的 SPA：

- `packages/user-app`：用户端
- `packages/admin-app`：管理端

`packages/shared-components` 是共享 workspace 包，只参与构建，不需要单独部署到 Cloudflare Pages。

推荐为两个客户端分别创建两个 Cloudflare Pages 项目，而不是在一个 Pages 项目中同时承载两个客户端。这样可以避免路由根路径冲突，也便于分别配置域名和环境变量。

### 1. 安装与构建前提

Cloudflare Pages 在本仓库中应当以 `frontend` 作为根目录执行构建：

- Root directory: `frontend`
- 依赖安装：Pages 会基于 `bun.lock` 自动安装依赖
- 推荐环境变量：`BUN_VERSION=1.2.15` 或你们验证过的 Bun 版本

### 2. 用户端 Pages 项目

- Project root directory: `frontend`
- Build command: `bun run build:user`
- Build output directory: `packages/user-app/dist`

建议配置以下环境变量：

- `VITE_API_BASE_URL`
- `VITE_TURNSTILE_SITE_KEY`
- 可参考 `cloudflare/pages.user.env.example`

### 3. 管理端 Pages 项目

- Project root directory: `frontend`
- Build command: `bun run build:admin`
- Build output directory: `packages/admin-app/dist`

建议配置以下环境变量：

- `VITE_API_BASE_URL`
- `VITE_TURNSTILE_SITE_KEY`
- 可参考 `cloudflare/pages.admin.env.example`

### 4. SPA 路由支持

两个客户端都使用 Vue Router 的 history 模式，因此部署到 Cloudflare Pages 时需要让非静态资源请求回退到 `index.html`。

项目已经分别在以下位置提供了 `_redirects` 文件：

- `packages/user-app/public/_redirects`
- `packages/admin-app/public/_redirects`

内容为：

```text
/* /index.html 200
```

这样在访问深层路由时，例如 `/login`、`/dashboard`、`/users/list`，Cloudflare Pages 会先返回应用入口，再由前端路由接管。

### 5. 推荐域名拆分

建议为两个 Pages 项目使用不同域名或子域名，例如：

- 用户端：`account.example.com`
- 管理端：`admin-account.example.com`

当前两个应用都使用根路径路由，并且都包含 `/login` 等公共路径。如果强行放到同一个 Pages 项目中，需要额外改造路由前缀与 Vite `base` 配置。

### 6. 本地验证

在 `frontend` 目录执行：

```bash
bun run build:user
bun run build:admin
```

如果构建成功，并且产物目录分别生成为 `packages/user-app/dist` 和 `packages/admin-app/dist`，就可以直接按上述配置接入 Cloudflare Pages。

### 7. 使用 Wrangler 直传部署

如果你们希望不经过 Pages 控制台、直接通过 CLI 上传静态产物，可以使用仓库内提供的 Wrangler 配置：

- `cloudflare/wrangler.user.toml`
- `cloudflare/wrangler.admin.toml`

使用前需要先把其中的 `name` 改成真实的 Cloudflare Pages 项目名，并登录 Wrangler：

```bash
bunx wrangler login
```

然后在 `frontend` 目录执行：

```bash
bun run pages:deploy:user
bun run pages:deploy:admin
```

这两个脚本会先本地构建，再把对应的 `dist` 目录上传到 Cloudflare Pages。

### 8. GitHub Actions 自动部署

仓库已提供工作流 `/.github/workflows/deploy-pages.yml`，默认不会在普通 `push` 时自动发布，从而避免未验证版本直接上线。

同时仓库还提供了 `/.github/workflows/ci.yml`，会在 `pull_request` 和 `main` 分支 `push` 时执行基础校验：

- `bun install --frozen-lockfile`
- `bun run type-check`
- `bun run build:all`

这样可以先在 PR / 合并阶段发现问题，再由 Release 流程负责真正的生产部署。

支持两种触发方式：

- 发布 GitHub Release 时自动部署到生产环境
- 在 Actions 页面手动触发 `workflow_dispatch`

#### Release 发布策略

当你在 GitHub 上创建并发布 Release 后，工作流会：

- 检出对应的 tag
- 安装依赖并执行 `bun run type-check`
- 分别构建 user/admin 两个客户端
- 将两个客户端直传部署到各自的 Cloudflare Pages 项目

这样只有打过 tag 并正式发布的版本才会自动上线。

#### 手动触发策略

你也可以在 GitHub Actions 页面手动执行该工作流，并指定：

- `target`：`both`、`user`、`admin`
- `deployment_mode`：`production`、`preview`
- `ref`：要部署的 branch、tag 或 commit SHA

推荐把未最终确认的版本先以 `preview` 模式手动部署，确认后再发布 Release 触发正式生产部署。

#### 需要配置的 GitHub Secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CF_PAGES_USER_API_BASE_URL`
- `CF_PAGES_USER_TURNSTILE_SITE_KEY`
- `CF_PAGES_ADMIN_API_BASE_URL`
- `CF_PAGES_ADMIN_TURNSTILE_SITE_KEY`

#### 需要配置的 GitHub Variables

- `BUN_VERSION`，例如 `1.2.15`
- `CF_PAGES_PROJECT_USER`
- `CF_PAGES_PROJECT_ADMIN`

#### 推荐的额外保护

建议在 GitHub 仓库中创建 environment `cloudflare-pages-production`，并为它配置 required reviewers。这样即使 Release 已经发布，生产部署也需要人工审批后才会真正执行。

如果你也希望手动触发的预览部署走独立保护，可以额外创建 `cloudflare-pages-preview` environment；否则预览环境会直接运行。

## 目录结构说明

每个应用（user-app 和 admin-app）都包含以下目录结构：

### `/src/routes`

路由配置文件目录，用于定义应用的页面路由和导航结构。

### `/src/stores`

Pinia 状态管理目录，存放全局状态管理相关的 store 文件。

### `/src/types`

TypeScript 类型定义目录，包含：

- 自定义类型定义
- API 接口类型
- `auto-imports.d.ts` - 自动导入的类型声明（自动生成）
- `components.d.ts` - 组件自动导入的类型声明（自动生成）

### `/src/components`

可复用组件目录，存放应用中的 Vue 组件。

### `/src/pages`

页面组件目录，对应路由的页面级组件。

### `/src/config`

配置文件目录，包含：

- API 配置
- 环境变量配置
- 应用常量配置

### `/src/hooks`

自定义 Vue Composition API hooks 目录，存放可复用的业务逻辑。

## 共享组件库

`shared-components` 包用于存放两个应用共享的组件，可以通过以下方式在应用中使用：

```typescript
import { ComponentName } from '@paigram/shared-components'
```

## 开发规范

1. 所有组件使用 `<script setup>` 语法
2. 使用 TypeScript 进行类型约束
3. 样式使用 Tailwind CSS 实用类优先
4. 组件库使用 Arco Design Vue，支持自动按需导入
5. 遵循 Vue 3 Composition API 最佳实践

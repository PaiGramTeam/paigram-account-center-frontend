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
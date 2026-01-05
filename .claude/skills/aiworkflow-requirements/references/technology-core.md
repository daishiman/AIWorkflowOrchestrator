# コア技術スタック（Next.js, TypeScript, Electron）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

## 概要

### 目的

本ドキュメントは、AIWorkflowOrchestratorプロジェクトで使用する技術スタックを定義し、以下を明確にする:

- **技術選定の理由**: なぜその技術を選んだのか
- **バージョン管理戦略**: 互換性とアップデート方針
- **個人開発における最適化**: コスト、学習コスト、保守性のバランス
- **依存関係の管理方針**: 肥大化防止と最小構成の維持

### 技術選定の基本原則

```
個人開発における技術選定の3原則:

1. 学習コストの最小化
   └─ 広く使われ、ドキュメントが充実した技術を優先

2. 無料枠の最大活用
   └─ Vercel, Turso, Railway等の無料tier内で運用可能

3. 型安全性の徹底
   └─ TypeScript strict mode + Zodによる実行時検証
```

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    pnpm Monorepo                            │
├─────────────────────────────────────────────────────────────┤
│  apps/                                                      │
│  ├─ web/          Next.js 15 (App Router)                   │
│  └─ desktop/      Electron + Next.js (将来対応)             │
├─────────────────────────────────────────────────────────────┤
│  packages/                                                  │
│  └─ shared/       共通ロジック、型定義、ユーティリティ       │
├─────────────────────────────────────────────────────────────┤
│  外部サービス                                               │
│  ├─ Turso         分散SQLite (無料: 9GB, 500Mリクエスト)    │
│  ├─ Railway       ホスティング (従量課金)                   │
│  └─ AI Provider   OpenAI / Anthropic / Google / xAI        │
└─────────────────────────────────────────────────────────────┘
```

---

## 概要

### 目的

本ドキュメントは、AIWorkflowOrchestratorプロジェクトで使用する技術スタックを定義し、以下を明確にする:

- **技術選定の理由**: なぜその技術を選んだのか
- **バージョン管理戦略**: 互換性とアップデート方針
- **個人開発における最適化**: コスト、学習コスト、保守性のバランス
- **依存関係の管理方針**: 肥大化防止と最小構成の維持

### 技術選定の基本原則

```
個人開発における技術選定の3原則:

1. 学習コストの最小化
   └─ 広く使われ、ドキュメントが充実した技術を優先

2. 無料枠の最大活用
   └─ Vercel, Turso, Railway等の無料tier内で運用可能

3. 型安全性の徹底
   └─ TypeScript strict mode + Zodによる実行時検証
```

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    pnpm Monorepo                            │
├─────────────────────────────────────────────────────────────┤
│  apps/                                                      │
│  ├─ web/          Next.js 15 (App Router)                   │
│  └─ desktop/      Electron + Next.js (将来対応)             │
├─────────────────────────────────────────────────────────────┤
│  packages/                                                  │
│  └─ shared/       共通ロジック、型定義、ユーティリティ       │
├─────────────────────────────────────────────────────────────┤
│  外部サービス                                               │
│  ├─ Turso         分散SQLite (無料: 9GB, 500Mリクエスト)    │
│  ├─ Railway       ホスティング (従量課金)                   │
│  └─ AI Provider   OpenAI / Anthropic / Google / xAI        │
└─────────────────────────────────────────────────────────────┘
```

---

## コアランタイム

### Node.js

| 項目           | 値                     |
| -------------- | ---------------------- |
| 推奨バージョン | `22.x LTS`             |
| 最小バージョン | `20.x LTS`             |
| 更新頻度       | LTSリリース毎（年1回） |

**選定理由**:

1. **Next.js 15との互換性**: Next.js 15はNode.js 18.18.0以上を要求
2. **ESM完全対応**: Node.js 22はES Modulesをネイティブサポート
3. **V8エンジン最新版**: パフォーマンス向上と最新JavaScript機能

**代替案との比較**:

| 選択肢 | 利点                             | 採用しなかった理由              |
| ------ | -------------------------------- | ------------------------------- |
| Deno   | セキュリティ、TypeScript組み込み | npm互換性、エコシステムの成熟度 |
| Bun    | 高速起動、オールインワン         | Next.js本番互換性の不安定さ     |

```bash
# バージョン確認
node --version  # v22.x.x

# .nvmrcでの固定
echo "22" > .nvmrc
```

### pnpm

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| 推奨バージョン | `9.x`                                |
| 最小バージョン | `8.15.0`                             |
| 更新頻度       | マイナー更新は随時、メジャーは慎重に |

**選定理由**:

1. **ディスク効率**: ハードリンクによる重複排除（npm比で約60%削減）
2. **厳密な依存関係**: 幽霊依存関係（phantom dependencies）を防止
3. **高速インストール**: npm比で約2-3倍高速
4. **Monorepo最適化**: workspace機能がnpmより成熟

**代替案との比較**:

| 選択肢 | 利点                | 採用しなかった理由   |
| ------ | ------------------- | -------------------- |
| npm    | 標準、学習コスト0   | ディスク効率、速度   |
| yarn   | PnP、零インストール | 設定複雑、互換性問題 |
| Bun    | 超高速              | pnpm workspace互換性 |

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## フロントエンド

### Next.js 15

| 項目           | 値                             |
| -------------- | ------------------------------ |
| 推奨バージョン | `15.1.x`                       |
| 最小バージョン | `15.0.0`                       |
| 更新頻度       | パッチは即時、マイナーは検証後 |

**選定理由**:

1. **App Router成熟**: Server Components、Streamingが安定
2. **Turbopack**: 開発時のHMRが高速化（Webpack比10倍）
3. **React 19準備完了**: Concurrent Features対応
4. **Railway最適化**: スタンドアロンモードで効率的デプロイ

**Next.js 15の活用機能**:

| 機能                 | 活用箇所         | 利点                     |
| -------------------- | ---------------- | ------------------------ |
| Server Components    | ワークフロー一覧 | バンドルサイズ削減       |
| Server Actions       | フォーム送信     | API Route不要            |
| Partial Prerendering | ダッシュボード   | TTFB高速化               |
| Turbopack            | 開発環境         | HMR 10倍高速化           |
| `after()` API        | ログ送信         | レスポンス後の非同期処理 |

**代替案との比較**:

| 選択肢    | 利点                 | 採用しなかった理由             |
| --------- | -------------------- | ------------------------------ |
| Remix     | 優れたデータ読み込み | Vercel以外のホスティング最適化 |
| Nuxt 3    | Vue好みの場合        | Reactエコシステムの規模        |
| SvelteKit | バンドルサイズ最小   | 学習コスト、エコシステム       |

```typescript
// next.config.ts (Next.js 15)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Railway向け最適化
  experimental: {
    ppr: "incremental", // Partial Prerendering
  },
};

export default nextConfig;
```

### React 19

| 項目           | 値           |
| -------------- | ------------ |
| 推奨バージョン | `19.0.x`     |
| 最小バージョン | `19.0.0`     |
| 更新頻度       | パッチは即時 |

**React 19の新機能活用**:

| 機能              | 活用箇所       | 説明                              |
| ----------------- | -------------- | --------------------------------- |
| `use()` フック    | データフェッチ | Promiseの直接unwrap               |
| Server Components | 全ページ       | サーバーでのレンダリング          |
| Actions           | フォーム       | `useActionState`, `useFormStatus` |
| `useOptimistic`   | UI更新         | 楽観的更新                        |

```tsx
// React 19 Actions の例
"use client";

import { useActionState } from "react";
import { createWorkflow } from "@/actions/workflow";

export function WorkflowForm() {
  const [state, formAction, isPending] = useActionState(createWorkflow, null);

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? "作成中..." : "作成"}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

### TypeScript

| 項目           | 値                   |
| -------------- | -------------------- |
| 推奨バージョン | `5.7.x`              |
| 最小バージョン | `5.5.0`              |
| 更新頻度       | マイナー更新は検証後 |

**コンパイラ設定**:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true, // 配列アクセスの安全性
    "exactOptionalPropertyTypes": true, // オプショナルプロパティの厳密化
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
  },
}
```

### Tailwind CSS

| 項目           | 値                         |
| -------------- | -------------------------- |
| 推奨バージョン | `3.4.x`                    |
| 次期対応       | `4.0` (2025年中に移行検討) |

**選定理由**:

1. **ゼロランタイム**: CSSファイルへの事前コンパイル
2. **設計システム統一**: カスタムテーマで一貫性
3. **学習コスト低**: ユーティリティファーストの直感的API
4. **Shadcn/ui互換**: コンポーネントライブラリとの親和性

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@repo/ui/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

---
description: |
  Next.js App Routerのページ（page.tsx）を作成する専門コマンド。

  Server Components優先、パフォーマンス最適化、Metadata API統合を自動化します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: Next.js App Router専門エージェント（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてrouter-devエージェントが必要時に参照）:
  **Phase 1（ルーティング設計時）:** nextjs-app-router, server-components-patterns
  **Phase 2（実装時）:** nextjs-app-router（必須）, server-components-patterns（必須）
  **Phase 3（最適化時）:** seo-optimization（必要時）, web-performance（必要時）
  **Phase 4（エラー対応時）:** error-boundary（必要時）, data-fetching-strategies（ローディング状態、必要時）

  ⚙️ このコマンドの設定:
  - argument-hint: 必須引数1つ（ルートパス例: /dashboard/settings）
  - allowed-tools: エージェント起動とファイル操作
    • Task: router-devエージェント起動用
    • Read: 既存ページ・レイアウト確認用
    • Write(src/app/**): ページファイル生成用（App Routerパス制限）
    • Edit: 既存ファイル編集用（レイアウト、設定等）
    • Grep, Glob: 既存ルーティング構造確認用
  - model: sonnet（標準的なページ作成タスク）

  📋 プロジェクト要件準拠:
  - ハイブリッドアーキテクチャ: features/ とのデータ連携
  - TypeScript strict モード必須
  - TDD準拠（ページ作成後にテスト追加を推奨）

  トリガーキーワード: page, route, Next.js, App Router, ページ作成
argument-hint: "[route-path]"
allowed-tools: [Task, Read, Write(src/app/**), Edit, Grep, Glob]
model: sonnet
---

# Next.js App Routerページ作成

## 目的

`.claude/agents/router-dev.md` エージェントを起動し、Next.js App Routerのページ（page.tsx）を作成します。

## エージェント起動フロー

### Phase 1: 引数確認とルーティング分析

```markdown
ルートパス: "$ARGUMENTS"

引数未指定の場合:
  ユーザーに対話的にルートパスを質問
  例: /dashboard, /products/[id], /settings/profile

検証:
  - ルートパスがスラッシュで始まること
  - 動的セグメント（[slug]等）の適切な使用
  - 既存ルーティング構造との整合性
```

**既存構造確認（並列実行）:**
```bash
# 既存のルーティング構造を確認
Glob: src/app/**/page.tsx
Grep: "export default" src/app/layout.tsx

# 関連するレイアウトの存在を確認
Read: src/app/layout.tsx（Root Layout）
Read: src/app/[該当セグメント]/layout.tsx（該当する場合）
```

### Phase 2: router-dev エージェント起動

Task ツールで `.claude/agents/router-dev.md` を起動:

```markdown
エージェント: .claude/agents/router-dev.md
ルートパス: ${ルートパス}

依頼内容:
  **Phase 1: ルーティング構造設計**
  - ルートパス解析（静的/動的セグメント判定）
  - 必要なディレクトリ構造の決定
  - レンダリング戦略の選定（Static/Dynamic/ISR/Streaming）
  - スキル参照: `.claude/skills/nextjs-app-router/SKILL.md`

  **Phase 2: Server/Client Components実装**
  - page.tsx の作成（Server Component優先）
  - データフェッチ戦略の実装
  - 必要に応じてClient Componentを分離
  - スキル参照: `.claude/skills/server-components-patterns/SKILL.md`
  - テンプレート: `.claude/skills/nextjs-app-router/templates/page-template.md`

  **Phase 3: パフォーマンス最適化（必要時）**
  - next/image、next/font の活用
  - loading.tsx の追加（非同期データフェッチ時）
  - Suspense境界の設計
  - スキル参照: `.claude/skills/web-performance/SKILL.md`（必要時）

  **Phase 4: Metadata API / SEO設定（必要時）**
  - 動的メタデータの実装
  - OGP画像とTwitter Cardの設定
  - スキル参照: `.claude/skills/seo-optimization/SKILL.md`（必要時）
  - テンプレート: `.claude/skills/seo-optimization/templates/metadata-template.md`

必須要件:
  1. Server Componentsをデフォルトとする（"use client"は最小限）
  2. TypeScript strict モード準拠（型安全性確保）
  3. master_system_design.md のディレクトリ構造に準拠
  4. 既存のレイアウト階層と整合性を保つ
  5. パフォーマンス指標目標（LCP < 2.5s、CLS < 0.1）

プロジェクト固有制約:
  - ハイブリッドアーキテクチャ: src/features/ からデータ取得時は Repository パターン使用
  - データフェッチ: src/shared/infrastructure/database/ 経由
  - AIクライアント: src/shared/infrastructure/ai/ 経由
```

**期待成果物:**
- `src/app/${ルートパス}/page.tsx`（Server Component）
- `src/app/${ルートパス}/loading.tsx`（必要時）
- `src/app/${ルートパス}/error.tsx`（必要時）
- 動的メタデータ設定（必要時）
- Client Components（必要最小限、分離ファイル）

### Phase 3: 検証と報告

**自動検証（router-devエージェント内で実行）:**
- [ ] Server Componentsがデフォルトで使用されている
- [ ] TypeScript型エラーがない
- [ ] 既存レイアウトとの整合性が取れている
- [ ] パフォーマンスベストプラクティスに準拠

**完了報告:**
```markdown
✅ ページ作成完了

作成ファイル:
  - src/app/${ルートパス}/page.tsx
  - src/app/${ルートパス}/loading.tsx（必要時）
  - その他生成ファイル

レンダリング戦略: ${選択された戦略}
使用スキル: ${参照したスキル一覧}

Next Steps（推奨）:
  1. TDDに基づくテスト作成（テストファースト未実施の場合）
  2. E2Eテスト追加（Playwright）
  3. SEO確認（必要に応じて）
```

## 使用例

### 基本的なページ作成

```bash
/ai:create-page /dashboard
```

→ `src/app/dashboard/page.tsx` を作成

### 動的ルートのページ作成

```bash
/ai:create-page /products/[id]
```

→ `src/app/products/[id]/page.tsx` を作成（動的セグメント対応）

### ネストされたルート

```bash
/ai:create-page /settings/profile
```

→ `src/app/settings/profile/page.tsx` を作成

### インタラクティブモード

```bash
/ai:create-page
```

→ 対話的にルートパスを質問

## プロジェクト固有の考慮事項

### ハイブリッドアーキテクチャ統合

```typescript
// src/app/workflows/page.tsx
// features/ からのデータ取得例

import { db } from '@/shared/infrastructure/database/db';
import { workflows } from '@/shared/infrastructure/database/schema';

export default async function WorkflowsPage() {
  // Repository パターンでデータ取得
  const workflowList = await db.select().from(workflows);

  return (
    <div>
      <h1>Workflows</h1>
      {/* レンダリングロジック */}
    </div>
  );
}
```

### TDD準拠の推奨フロー

1. **仕様書確認**: `docs/20-specifications/features/` の該当仕様
2. **テスト作成**: `__tests__/` にページコンポーネントのテスト
3. **ページ実装**: このコマンドでpage.tsx作成
4. **E2Eテスト**: Playwrightで実ユーザーフロー検証

## 参照

- エージェント: `.claude/agents/router-dev.md`
- スキル（必須）: `.claude/skills/nextjs-app-router/SKILL.md`, `.claude/skills/server-components-patterns/SKILL.md`
- スキル（条件付き）: `.claude/skills/seo-optimization/SKILL.md`, `.claude/skills/web-performance/SKILL.md`
- 仕様書: `docs/00-requirements/master_system_design.md` 第4章（ディレクトリ構造）
- コマンドリスト: `.claude/commands/ai/command_list.md`

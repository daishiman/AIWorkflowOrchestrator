---
description: |
  Reactコンポーネント（Atomic Design準拠）を作成する専門コマンド。

  デザインシステムアーキテクチャ、Compositionパターン、WCAG準拠のアクセシビリティを
  実現するUIコンポーネントを生成します。

  🤖 起動エージェント:
  - `.claude/agents/ui-designer.md`: UIコンポーネント設計・実装専門エージェント

  📚 利用可能スキル（ui-designerエージェントが必要時に参照）:
  **必須スキル（Phase 1-2）:** design-system-architecture, component-composition-patterns, headless-ui-principles, tailwind-css-patterns
  **必須スキル（Phase 3）:** accessibility-wcag
  **推奨スキル（Apple向け）:** apple-hig-guidelines

  ⚙️ このコマンドの設定:
  - argument-hint: [component-name] [type] - コンポーネント名と種類（atom/molecule/organism）
  - allowed-tools: UIコンポーネント生成に必要な最小権限
    • Task: ui-designerエージェント起動用
    • Read: 既存コンポーネント・デザインシステム確認用
    • Write(src/app/**|src/features/**): コンポーネントファイル生成用（プレゼンテーション層制限）
    • Edit: 既存コンポーネント修正用
    • Grep: パターン検索・既存実装調査用
  - model: sonnet（標準的なUI実装タスク）

  🎯 プロジェクト準拠:
  - アーキテクチャ: Clean Architecture（app/ → features/ → shared/infrastructure/ → shared/core/）
  - 配置: src/app/components/ または src/features/*/components/
  - Next.js: "use client"ディレクティブ、Server/Client Component区別
  - 検証: Zodバリデーション、TypeScript strict mode
  - テスト: __tests__/ディレクトリ配置、カバレッジ80%目標

  トリガーキーワード: component, ui, react, atomic-design, アクセシビリティ, デザインシステム
argument-hint: "[component-name] [type]"
allowed-tools:
  - Task
  - Read
  - Write(src/app/**|src/features/**)
  - Edit
  - Grep
model: sonnet
---

# Reactコンポーネント作成

## 目的

`.claude/agents/ui-designer.md` エージェントを起動し、プロジェクト要件に準拠したUIコンポーネントを作成します。

## エージェント起動フロー

### Phase 1: 引数確認とコンテキスト収集

```markdown
コンポーネント名: "$1"（例: Button, FormInput）
種類: "$2"（atom/molecule/organism）

引数未指定の場合:
ユーザーに対話的に以下を質問:
- コンポーネント名
- Atomic Designレベル（atom/molecule/organism）
- 用途・機能概要
- 配置場所（app/components/ or features/*/components/）
```

### Phase 2: ui-designer エージェント起動

Task ツールで `.claude/agents/ui-designer.md` を起動:

```markdown
エージェント: .claude/agents/ui-designer.md
コンポーネント名: ${コンポーネント名}
種類: ${atom/molecule/organism}

依頼内容:
- プロジェクト設計書（master_system_design.md）準拠のUIコンポーネント作成
- デザインシステム基盤確認とCompositionパターン適用
- WCAG 2.1 AA準拠のアクセシビリティ統合
- TypeScript strict mode + Tailwind CSSスタイリング
- テスト作成（__tests__/、カバレッジ80%目標）

必須要件:
1. Clean Architecture準拠（依存関係: app/ → features/ → shared/）
2. Next.js App Router対応（"use client"、Server/Client分離）
3. Zodバリデーション（フォーム等の入力検証）
4. デザイントークン活用（tailwind.config.js）
5. Compositionパターン適用（Slot/Compound/Render Props等）
6. WAI-ARIAパターン実装（role, aria-label, aria-describedby）
7. キーボードナビゲーション（Enter/Space/Arrow/Escape/Tab）
8. カラーコントラスト4.5:1以上、ダークモード対応

成果物の配置:
- コンポーネント: src/app/components/${component-name}.tsx または src/features/*/components/
- テスト: 同階層/__tests__/${component-name}.test.tsx
- Storybook（オプション）: ${component-name}.stories.tsx
```

**期待成果物:**
- TypeScript strict mode準拠のReactコンポーネント
- Zod検証スキーマ（必要に応じて）
- アクセシビリティ完備（WCAG 2.1 AA）
- ユニットテスト（カバレッジ80%以上）
- Storybook/使用例ドキュメント

### Phase 3: 検証と報告

- コンポーネントファイルパス確認
- TypeScript型チェック（`tsc --noEmit`）
- アクセシビリティスコア確認
- テスト実行結果
- 完了報告（成果物一覧、メトリクス、次のステップ）

## 使用例

### 基本的な使用法

```bash
/ai:create-component Button atom
```

### フォーム入力コンポーネント

```bash
/ai:create-component FormInput molecule
```

### インタラクティブモード

```bash
/ai:create-component
```

## 参照

- エージェント: `.claude/agents/ui-designer.md`
- プロジェクト設計書: `docs/00-requirements/master_system_design.md`
- エージェントリスト: `.claude/agents/agent_list.md`
- コマンドリスト: `.claude/commands/ai/command_list.md`

## 後続ワークフロー

コンポーネント作成後の推奨フロー:
1. `/ai:create-component` → UIコンポーネント作成
2. アクセシビリティテスト実行（axe-core等）
3. 必要に応じて `/ai:create-page` でページ統合
4. 状態管理必要時は `.claude/agents/state-manager.md` 連携
5. E2Eテスト作成（`.claude/agents/e2e-tester.md`）

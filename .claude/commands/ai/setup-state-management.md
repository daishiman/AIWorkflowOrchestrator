---
description: |
  React状態管理ライブラリ（SWR/React Query）のセットアップと実装を行う専門コマンド。

  カスタムフック設計、データフェッチ戦略、エラーハンドリングを含む
  完全な状態管理ソリューションを構築します。

  🤖 起動エージェント:
  - `.claude/agents/state-manager.md`: 状態管理実装専門エージェント（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてstate-managerエージェントが必要時に参照）:
  **Phase 1（分析時）:** react-hooks-advanced, data-fetching-strategies, state-lifting
  **Phase 2（設計時）:** data-fetching-strategies（必須）, custom-hooks-patterns（必須）
  **Phase 3（実装時）:** custom-hooks-patterns（必須）, react-hooks-advanced（必須）
  **Phase 4（エラー処理時）:** error-boundary, data-fetching-strategies（非同期エラー）
  **Phase 5（最適化時）:** performance-optimization-react（必要時）

  ⚙️ このコマンドの設定:
  - argument-hint: ライブラリ選択（swr/react-query、未指定時は要件分析に基づき推奨）
  - allowed-tools: エージェント起動、依存関係確認、実装ファイル作成用
    • Task: state-managerエージェント起動用
    • Read: package.json確認、既存パターン確認用
    • Write(src/hooks/**|src/app/**): カスタムフック・Context作成用（ハイブリッド構造準拠）
    • Bash(pnpm add*): 依存関係追加用（pnpm専用、npm禁止）
    • Edit: 既存ファイル修正用
  - model: sonnet（標準的な状態管理実装タスク）

  📋 プロジェクト固有制約（master_system_design.md準拠）:
  - パッケージマネージャー: pnpm 9.x必須（npm禁止）
  - TypeScript: strict mode必須、@/*パスエイリアス使用
  - テスト: TDD原則（仕様→テスト→実装）、Vitest 2.x使用
  - アーキテクチャ: ハイブリッド構造（shared/、features/、app/）に配置
    - 機能固有フック: features/[機能名]/hooks/
    - 共通フック: shared/ または app/ 配下
    - データフェッチフック: SWR/React Queryでサーバー状態管理

  トリガーキーワード: state management, data fetching, SWR, React Query, hooks, 状態管理
argument-hint: "[library]"
allowed-tools:
  - Task
  - Read
  - Write(src/hooks/**|src/app/**)
  - Bash(pnpm add*)
  - Edit
model: sonnet
---

# React状態管理セットアップ

## 目的

`.claude/agents/state-manager.md` エージェントを起動し、SWR/React Queryによる
状態管理システムを実装します。

## エージェント起動フロー

### Phase 1: 引数確認と要件分析

```markdown
ライブラリ: "$ARGUMENTS"

引数未指定の場合:
1. プロジェクト要件を分析（データ更新頻度、リアルタイム性、複雑性）
2. ユーザーに推奨ライブラリを提示（SWR/React Query）
3. 選択を確認

引数指定の場合:
- swr: SWRセットアップ
- react-query: React Queryセットアップ
```

### Phase 2: state-manager エージェント起動

Task ツールで `.claude/agents/state-manager.md` を起動:

```markdown
エージェント: .claude/agents/state-manager.md
ライブラリ: ${選択されたライブラリ}

依頼内容:
- Phase 1: 状態要件の分析（既存パターン、技術スタック確認）
- Phase 2: 状態アーキテクチャの設計（State Lifting、データフェッチ戦略）
- Phase 3: Hooks/カスタムフックの実装（ロジック抽出、型安全性）
- Phase 4: エラーハンドリングの実装（Error Boundary、非同期エラー）
- Phase 5: 最適化と検証（パフォーマンス測定、テスト戦略設計）

プロジェクト固有制約:
- pnpm 9.x使用（npm禁止）
- TypeScript strict mode
- TDD原則適用（テスト→実装）
- ハイブリッドアーキテクチャ準拠（shared/、features/、app/）
- Vitest 2.x、カバレッジ60%以上目標

必須スキル参照（state-managerが自動参照）:
1. data-fetching-strategies: ライブラリ選択基準、キャッシュ戦略
2. custom-hooks-patterns: カスタムフック設計、再利用性
3. react-hooks-advanced: 依存配列、メモ化最適化
4. error-boundary: Error Boundary実装
```

**期待成果物:**
- `src/hooks/` または `src/app/`: カスタムフック（ハイブリッド構造準拠）
- `package.json`: SWR/React Query依存追加（pnpm）
- Context実装（必要に応じて）
- Error Boundary（必要に応じて）
- テスト戦略設計（TDD、`.claude/agents/unit-tester.md` に引き継ぎ）

### Phase 3: 検証と報告

- ライブラリインストール確認（pnpm list）
- 作成ファイル確認
- TypeScript型チェック（tsc --noEmit）
- テスト戦略概要提示
- 完了報告（Next Steps含む）

## 使用例

### SWRセットアップ

```bash
/ai:setup-state-management swr
```

### React Queryセットアップ

```bash
/ai:setup-state-management react-query
```

### インタラクティブモード（推奨）

```bash
/ai:setup-state-management
```

## 参照

- エージェント: `.claude/agents/state-manager.md`
- スキル（エージェントが参照）:
  - `.claude/skills/data-fetching-strategies/SKILL.md`
  - `.claude/skills/custom-hooks-patterns/SKILL.md`
  - `.claude/skills/react-hooks-advanced/SKILL.md`
  - `.claude/skills/error-boundary/SKILL.md`
  - `.claude/skills/performance-optimization-react/SKILL.md`
- プロジェクト設計: `docs/00-requirements/master_system_design.md`

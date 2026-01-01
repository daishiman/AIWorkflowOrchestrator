---
name: frontend-testing
description: |
  Comprehensive frontend testing strategy encompassing component tests, visual regression, accessibility, and E2E testing for modern web applications using Vitest, React Testing Library, Playwright, and Storybook.

  Anchors:
  Test-Driven Development: By Example (Kent Beck) / Apply: Red-Green-Refactor cycle / Purpose: Guide test-first development workflow
  Testing Library Guiding Principles / Apply: Query priorities and user-centric testing / Purpose: Ensure tests resemble user behavior
  WCAG 2.1 AA Standards / Apply: Automated accessibility testing / Purpose: Ensure inclusive UI components

  Trigger:
  Use when implementing or improving frontend tests, setting up test infrastructure, debugging failing tests, improving test coverage, or establishing testing best practices for React/Next.js applications. Keywords: vitest, react testing library, playwright, storybook, component test, e2e test, visual regression, accessibility testing, test coverage, mock service worker.
---

# Frontend Testing Skill

## 概要

このスキルは、フロントエンドアプリケーションの包括的なテスト戦略を提供します。テストピラミッドに基づき、ユニットテスト、コンポーネントテスト、統合テスト、E2Eテスト、ビジュアルリグレッションテスト、アクセシビリティテストを体系化します。

**適用範囲**: React/Next.js アプリケーション、Electron デスクトップアプリ、モノレポ構成のフロントエンド

## ワークフロー

### Phase 1: テスト戦略の策定

**目的**: プロジェクトに適したテスト戦略を決定する

**アクション**:

1. `references/Level1_basics.md` でテストピラミッドと基本概念を確認
2. プロジェクトの特性に応じたテストレイヤーを選択
3. カバレッジ目標とテスト方針を決定

**Task仕様**: `agents/test-strategist.md` を参照

### Phase 2: テスト環境のセットアップ

**目的**: 必要なテストツールとインフラを構築する

**アクション**:

1. `references/Level2_intermediate.md` でセットアップ手順を確認
2. Vitest、React Testing Library、Playwright、Storybook を設定
3. MSW でモック環境を構築

**Task仕様**: `agents/test-environment-engineer.md` を参照

### Phase 3: テストの実装

**目的**: 戦略に基づいて具体的なテストを作成する

**アクション**:

1. テストレイヤーに応じたTask仕様を参照
   - コンポーネントテスト: `agents/component-test-writer.md`
   - ビジュアルリグレッションテスト: `agents/visual-regression-tester.md`
   - アクセシビリティテスト: `agents/accessibility-tester.md`
   - E2Eテスト: `agents/e2e-test-writer.md`
2. `assets/` のテンプレートを活用して効率的に実装
3. `references/Level3_advanced.md` でパターンとベストプラクティスを確認

### Phase 4: テストの実行と改善

**目的**: テストを実行し、継続的に改善する

**アクション**:

1. テストを実行してカバレッジを測定
2. 失敗したテストをデバッグ
3. `references/Level4_expert.md` で高度なパターンを確認
4. `scripts/log_usage.mjs` で使用実績を記録

## Task仕様（agents/）

各Taskは独立した作業単位として実行されます。SKILL.mdでワークフローを理解した後、必要なTaskを選択して実行してください。

### テスト戦略系

- **test-strategist.md**: テスト戦略の策定と設計
  - 入力: プロジェクト要件、既存コードベース
  - 出力: テスト戦略ドキュメント、カバレッジ目標
  - 参照: `references/Level1_basics.md`, `references/test-pyramid.md`

- **test-environment-engineer.md**: テスト環境の構築と設定
  - 入力: テスト戦略、技術スタック
  - 出力: 設定ファイル、セットアップスクリプト
  - 参照: `references/Level2_intermediate.md`, `references/test-setup.md`

### テスト実装系

- **component-test-writer.md**: コンポーネントテストの作成
  - 入力: コンポーネント仕様、既存コンポーネント
  - 出力: Vitest + RTL テストファイル
  - 参照: `references/Level3_advanced.md`, `references/component-testing-patterns.md`
  - テンプレート: `assets/component-test-template.tsx`

- **visual-regression-tester.md**: ビジュアルリグレッションテストの作成
  - 入力: UIコンポーネント、デザインシステム
  - 出力: Storybook ストーリー、Chromatic設定
  - 参照: `references/visual-regression.md`
  - テンプレート: `assets/story-template.tsx`

- **accessibility-tester.md**: アクセシビリティテストの作成
  - 入力: UIコンポーネント、WCAG要件
  - 出力: axe-core テスト、アクセシビリティレポート
  - 参照: `references/accessibility-testing.md`
  - テンプレート: `assets/a11y-test-template.tsx`

- **e2e-test-writer.md**: E2Eテストの作成
  - 入力: ユーザーフロー、機能仕様
  - 出力: Playwright テストスイート
  - 参照: `references/Level4_expert.md`, `references/e2e-patterns.md`
  - テンプレート: `assets/e2e-test-template.ts`

## リソース参照（references/）

**段階的な学習パス**:

- **Level1_basics.md** (200行以内): テストピラミッド、基本概念、用語定義
- **Level2_intermediate.md** (300行以内): セットアップ手順、基本的なテストパターン
- **Level3_advanced.md** (400行以内): 高度なパターン、モック戦略、パフォーマンステスト
- **Level4_expert.md** (500行以内): アーキテクチャパターン、テストの最適化、トラブルシューティング

**ドメイン別リファレンス**:

- **test-pyramid.md**: テストピラミッドの詳細、各レイヤーの役割
- **component-testing-patterns.md**: コンポーネントテストのベストプラクティス集
- **visual-regression.md**: ビジュアルリグレッションテストのガイド
- **accessibility-testing.md**: アクセシビリティテストの実践
- **e2e-patterns.md**: E2Eテストのパターンとアンチパターン
- **test-setup.md**: 各種テストツールのセットアップガイド
- **mocking-strategies.md**: MSWを使用したモック戦略
- **legacy-skill.md**: 旧SKILL.mdの全文（移行参考用）

**読み込みタイミング**:

- Level1: スキル初回使用時に必ず読む
- Level2: 環境セットアップ時に読む
- Level3: テスト実装時、特定パターンが必要な時に読む
- Level4: 高度な問題解決が必要な時のみ読む
- ドメイン別: 該当するテストタイプを実装する時に読む

## スクリプト（scripts/）

### log_usage.mjs

**目的**: スキル使用実績の記録と自動評価

**使用タイミング**: 各Phase完了後、特にテスト実装完了時

```bash
node .claude/skills/frontend-testing/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 3: テスト実装" \
  --agent "component-test-writer" \
  --notes "Button コンポーネントのテスト完了"
```

**引数**:

- `--result`: `success` または `failure` (必須)
- `--phase`: 実行したPhase名
- `--agent`: 実行したエージェント/Task名
- `--notes`: 追加メモ

**動作**:

1. LOGS.mdに実行記録を追記
2. EVALS.jsonのメトリクスを更新
3. レベルアップ条件を満たす場合、自動昇格

### validate-skill.mjs

**目的**: スキル構造の整合性を検証

**使用タイミング**: スキル更新後、動作確認前

```bash
node .claude/skills/frontend-testing/scripts/validate-skill.mjs
```

**検証項目**:

- 必須ファイルの存在確認
- SKILL.mdの行数制限（500行以内）
- references/の行数制限（Level1: 200行、Level2: 300行、Level3: 400行、Level4: 500行）
- EVALS.jsonの構造検証

## アセット（assets/）

テスト実装時に使用するテンプレートとボイラープレート。

- **component-test-template.tsx**: コンポーネントテストの雛形
- **story-template.tsx**: Storybook ストーリーの雛形
- **a11y-test-template.tsx**: アクセシビリティテストの雛形
- **e2e-test-template.ts**: E2Eテストの雛形
- **test-setup-boilerplate/**: テスト環境セットアップ用ファイル群

## ベストプラクティス

### すべきこと

- テストピラミッドに従い、ユニット/コンポーネントテストを厚くする（70-80%）
- Testing Library の優先クエリ（`getByRole`, `getByLabelText`）を使用
- ユーザー視点でテストを書く（実装詳細に依存しない）
- テストの独立性を保つ（各テストは他のテストに依存しない）
- `references/Level1_basics.md` を参照し、適用範囲を明確にする
- Task実行前に該当する `agents/*.md` を読み、入出力を確認する
- Phase完了後に `scripts/log_usage.mjs` で記録を残す

### 避けるべきこと

- E2Eテストに過度に依存する（遅い、脆い）
- 実装詳細をテストする（クラス名、内部state）
- グローバルな状態を共有する（テスト間の依存を生む）
- 過度なモック（実際の動作と乖離）
- アンチパターンや注意点を `references/` で確認せずに進める
- すべてのreferencesを一度に読む（必要な時に必要なものだけ）

## カバレッジ目標

| カテゴリ         | 目標             | 重要度 |
| ---------------- | ---------------- | ------ |
| ユーティリティ   | 100%             | 必須   |
| カスタムフック   | 95%+             | 必須   |
| コンポーネント   | 90%+             | 高     |
| 統合テスト       | 70%+             | 中     |
| E2Eテスト        | 主要フロー       | 高     |
| ビジュアルテスト | 全コンポーネント | 中     |
| アクセシビリティ | 全ページ         | 高     |

## コマンドリファレンス

### リソース読み取り

```bash
# 基礎知識の確認
cat .claude/skills/frontend-testing/references/Level1_basics.md

# セットアップガイドの確認
cat .claude/skills/frontend-testing/references/Level2_intermediate.md

# 特定パターンの確認
cat .claude/skills/frontend-testing/references/component-testing-patterns.md

# 全リソースのリスト
ls .claude/skills/frontend-testing/references/
```

### Task仕様の確認

```bash
# 利用可能なTask一覧
ls .claude/skills/frontend-testing/agents/

# 特定Taskの詳細確認
cat .claude/skills/frontend-testing/agents/component-test-writer.md
```

### スクリプト実行

```bash
# ヘルプ表示
node .claude/skills/frontend-testing/scripts/log_usage.mjs --help
node .claude/skills/frontend-testing/scripts/validate-skill.mjs --help

# 検証実行
node .claude/skills/frontend-testing/scripts/validate-skill.mjs

# 使用記録（成功）
node .claude/skills/frontend-testing/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 3" \
  --agent "component-test-writer"

# 使用記録（失敗）
node .claude/skills/frontend-testing/scripts/log_usage.mjs \
  --result failure \
  --phase "Phase 3" \
  --agent "e2e-test-writer" \
  --notes "Timeout issue in CI environment"
```

### テスト実行

```bash
# ユニット・コンポーネントテスト
pnpm vitest run
pnpm vitest watch

# カバレッジ測定
pnpm vitest run --coverage

# E2Eテスト
pnpm playwright test
pnpm playwright test --ui

# Storybook
pnpm storybook
pnpm storybook:build
```

## トラブルシューティング

### よくある問題

1. **テストがタイムアウトする**
   - 参照: `references/Level4_expert.md` → "非同期処理のテスト"
   - 原因: `waitFor` の使い方、モックの未設定

2. **モックが効かない**
   - 参照: `references/mocking-strategies.md`
   - 原因: MSWハンドラーの順序、パスマッチング

3. **アクセシビリティ違反が多い**
   - 参照: `references/accessibility-testing.md`
   - Task: `agents/accessibility-tester.md`

4. **E2Eテストがflakyになる**
   - 参照: `references/e2e-patterns.md` → "Flaky Test Prevention"
   - 原因: 明示的な待機不足、非決定的要素

## 変更履歴

| Version | Date       | Changes                                                        |
| ------- | ---------- | -------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md 仕様準拠、agents/追加、Progressive Disclosure適用 |
| 1.0.0   | 2025-12-24 | 初版作成                                                       |

## 関連スキル

- `.claude/skills/clean-code-practices`: コード品質とテスタビリティ
- `.claude/skills/accessibility-wcag`: WCAG準拠の詳細ガイド
- `.claude/skills/playwright-testing`: Playwrightの高度な使用法

---

**次のステップ**:

1. `references/Level1_basics.md` を読んでテストピラミッドを理解
2. 実装するテストタイプに応じて適切な `agents/*.md` を選択
3. テスト作成後に `scripts/log_usage.mjs` で記録

---
name: frontend-testing
description: |
  Comprehensive frontend testing strategy encompassing component tests, visual regression, accessibility, and E2E testing for modern web applications using Vitest, React Testing Library, Playwright, and Storybook.

  Anchors:
  • Test-Driven Development: By Example (Kent Beck) / Apply: Red-Green-Refactor cycle / Purpose: Guide test-first development workflow
  • Testing Library Guiding Principles / Apply: Query priorities and user-centric testing / Purpose: Ensure tests resemble user behavior
  • WCAG 2.1 AA Standards / Apply: Automated accessibility testing / Purpose: Ensure inclusive UI components

  Trigger:
  Use when implementing or improving frontend tests, setting up test infrastructure, debugging failing tests, improving test coverage, or establishing testing best practices for React/Next.js applications.
  vitest, react testing library, playwright, storybook, component test, e2e test, visual regression, accessibility testing, test coverage, mock service worker
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Frontend Testing Skill

## 概要

フロントエンドアプリケーションの包括的なテスト戦略を提供する。テストピラミッドに基づき、ユニットテスト、コンポーネントテスト、統合テスト、E2Eテスト、ビジュアルリグレッションテスト、アクセシビリティテストを体系化する。

**適用範囲**: React/Next.js アプリケーション、Electron デスクトップアプリ、モノレポ構成のフロントエンド

## ワークフロー

### Phase 1: テスト戦略の策定

**目的**: プロジェクトに適したテスト戦略を決定する

**アクション**:

1. [references/basics.md](references/basics.md) でテストピラミッドと基本概念を確認
2. プロジェクトの特性に応じたテストレイヤーを選択
3. カバレッジ目標とテスト方針を決定

**Task**: `agents/test-strategist.md` を参照

### Phase 2: テスト環境のセットアップ

**目的**: 必要なテストツールとインフラを構築する

**アクション**:

1. Vitest、React Testing Library、Playwright、Storybook を設定
2. MSW でモック環境を構築
3. [references/basics.md](references/basics.md) でMSW基本パターンを確認

**Task**: `agents/test-environment-engineer.md` を参照

### Phase 3: テストの実装

**目的**: 戦略に基づいて具体的なテストを作成する

**アクション**:

1. テストレイヤーに応じたTask仕様を参照
   - コンポーネントテスト: `agents/component-test-writer.md`
   - ビジュアルリグレッションテスト: `agents/visual-regression-tester.md`
   - アクセシビリティテスト: `agents/accessibility-tester.md`
   - E2Eテスト: `agents/e2e-test-writer.md`
2. [assets/](assets/) のテンプレートを活用して効率的に実装
3. [references/patterns.md](references/patterns.md) でパターンとベストプラクティスを確認

### Phase 4: テストの実行と改善

**目的**: テストを実行し、継続的に改善する

**アクション**:

1. テストを実行してカバレッジを測定
2. 失敗したテストをデバッグ
3. [references/patterns.md](references/patterns.md) で高度なパターンを確認
4. `scripts/log_usage.mjs` で使用実績を記録

## Task仕様（ナビゲーション）

| Task                      | 起動タイミング | 入力               | 出力                  |
| ------------------------- | -------------- | ------------------ | --------------------- |
| test-strategist           | Phase 1        | プロジェクト要件   | テスト戦略            |
| test-environment-engineer | Phase 2        | テスト戦略         | 設定ファイル          |
| component-test-writer     | Phase 3        | コンポーネント仕様 | Vitest + RTL テスト   |
| visual-regression-tester  | Phase 3        | UIコンポーネント   | Storybook + Chromatic |
| accessibility-tester      | Phase 3        | UIコンポーネント   | axe-coreテスト        |
| e2e-test-writer           | Phase 3        | ユーザーフロー     | Playwright テスト     |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- テストピラミッドに従い、ユニット/コンポーネントテストを厚くする（70-80%）
- Testing Library の優先クエリ（`getByRole`, `getByLabelText`）を使用
- ユーザー視点でテストを書く（実装詳細に依存しない）
- テストの独立性を保つ（各テストは他のテストに依存しない）
- Task実行前に該当する `agents/*.md` を読み、入出力を確認する
- Phase完了後に `scripts/log_usage.mjs` で記録を残す

### 避けるべきこと

- E2Eテストに過度に依存する（遅い、脆い）
- 実装詳細をテストする（クラス名、内部state）
- グローバルな状態を共有する（テスト間の依存を生む）
- 過度なモック（実際の動作と乖離）
- すべてのreferencesを一度に読む（必要な時に必要なものだけ）

**詳細**: See [references/patterns.md](references/patterns.md) → アンチパターン

## リソース参照

### references/（知識外部化）

| リソース   | パス                                             | 内容                                        |
| ---------- | ------------------------------------------------ | ------------------------------------------- |
| 基礎知識   | [references/basics.md](references/basics.md)     | テストピラミッド、クエリ優先順位、MSW基本   |
| パターン集 | [references/patterns.md](references/patterns.md) | コンポーネント/E2E/アクセシビリティパターン |

### scripts/（決定論的処理）

| スクリプト           | 用途               | 使用例                                        |
| -------------------- | ------------------ | --------------------------------------------- |
| `log_usage.mjs`      | フィードバック記録 | `node scripts/log_usage.mjs --result success` |
| `validate-skill.mjs` | 構造検証           | `node scripts/validate-skill.mjs`             |

### assets/（テンプレート）

| テンプレート                  | 用途                     |
| ----------------------------- | ------------------------ |
| `component-test-template.tsx` | コンポーネントテスト雛形 |
| `e2e-test-template.ts`        | E2Eテスト雛形            |

## カバレッジ目標

| カテゴリ       | 目標       | 重要度 |
| -------------- | ---------- | ------ |
| ユーティリティ | 100%       | 必須   |
| カスタムフック | 95%+       | 必須   |
| コンポーネント | 90%+       | 高     |
| 統合テスト     | 70%+       | 中     |
| E2Eテスト      | 主要フロー | 高     |

## トラブルシューティング

| 問題                 | 参照先                                           | 主な原因          |
| -------------------- | ------------------------------------------------ | ----------------- |
| テストタイムアウト   | [references/patterns.md](references/patterns.md) | waitForの使い方   |
| モックが効かない     | [references/basics.md](references/basics.md)     | MSWハンドラー設定 |
| アクセシビリティ違反 | `agents/accessibility-tester.md`                 | aria属性の不足    |
| E2Eテストがflaky     | [references/patterns.md](references/patterns.md) | 明示的な待機不足  |

## 変更履歴

| Version | Date       | Changes                                                       |
| ------- | ---------- | ------------------------------------------------------------- |
| 2.1.0   | 2026-01-02 | references/を整理、assets/にテンプレート追加                  |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様準拠、agents/追加、Progressive Disclosure適用 |
| 1.0.0   | 2025-12-24 | 初版作成                                                      |

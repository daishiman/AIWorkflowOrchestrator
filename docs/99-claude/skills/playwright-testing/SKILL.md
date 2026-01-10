---
name: playwright-testing
description: |
  Playwrightによるブラウザ自動化テストの実装技術。
  安定した待機戦略、適切なセレクタ選択、効率的なテスト設計を提供します。

  Anchors:
  • Test-Driven Development: By Example (Kent Beck) / 適用: Red-Green-Refactorサイクル / 目的: テスト設計と実装フロー
  • Playwright Best Practices / 適用: セレクタ戦略・待機パターン / 目的: フレーキーテスト防止

  Trigger:
  Use when implementing E2E tests, browser automation, fixing flaky tests, selecting Playwright selectors, optimizing wait strategies, or designing cross-browser test suites.
  E2E testing, browser automation, Playwright selectors, flaky test debugging, test wait strategies, accessibility testing
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Playwright Testing Skill

## 概要

Playwrightによるブラウザ自動化テストの実装を支援するスキル。

**目的**: 安定したE2Eテストの作成、フレーキーテストの排除、効率的なセレクタ戦略の適用

**提供価値**:

- 適切なセレクタ選択による保守性の向上
- 効果的な待機戦略によるテストの安定化
- ベストプラクティスに基づくテスト設計

## ワークフロー

### Phase 1: テスト設計

**目的**: テスト対象とシナリオの分析・設計

**アクション**:

1. テスト要件の確認（機能仕様、ユーザーシナリオ）
2. テストケースの洗い出し（正常系・異常系・境界値）
3. テストの独立性と原子性の確保

**Task**: `agents/test-designer.md` を参照

- 入力: 機能仕様、ユーザーストーリー
- 出力: テスト設計書、テストケース一覧

**参照**:

- [references/Level1_basics.md](references/Level1_basics.md) - テスト設計の基礎原則
- [references/playwright-best-practices.md](references/playwright-best-practices.md) - Playwrightベストプラクティス

### Phase 2: セレクタ戦略の選定

**目的**: 保守性の高いセレクタの選択

**アクション**:

1. セレクタ優先順位の確認（Role > Label > TestId > CSS）
2. アクセシビリティを考慮したセレクタの選択
3. 脆弱なセレクタ（CSSクラス、XPath）の回避

**Task**: `agents/selector-strategist.md` を参照

- 入力: テストケース、対象UI
- 出力: セレクタ戦略、実装ガイドライン

**参照**:

- [references/selector-strategies.md](references/selector-strategies.md) - セレクタ戦略の詳細

### Phase 3: テスト実装

**目的**: テストコードの実装

**アクション**:

1. テンプレートの選択と適用
2. Given-When-Then パターンでの記述
3. 適切な待機戦略の適用
4. エラーハンドリングの実装

**Task**: `agents/test-implementer.md` を参照

- 入力: テスト設計書、セレクタ戦略
- 出力: テストコード

**参照**:

- [references/Level2_intermediate.md](references/Level2_intermediate.md) - 実装パターン
- [references/waiting-strategies.md](references/waiting-strategies.md) - 待機戦略
- [assets/test-template.ts](assets/test-template.ts) - テストテンプレート

### Phase 4: デバッグと最適化

**目的**: フレーキーテストの解消とパフォーマンス最適化

**アクション**:

1. テストの実行と失敗原因の分析
2. 待機戦略の調整
3. 並列実行の最適化
4. リトライ設定の調整

**Task**: `agents/test-debugger.md` を参照

- 入力: 失敗したテスト、エラーログ
- 出力: 修正されたテスト、最適化レポート

**参照**:

- [references/Level3_advanced.md](references/Level3_advanced.md) - 高度なデバッグ技法
- [references/Level4_expert.md](references/Level4_expert.md) - パフォーマンス最適化

### Phase 5: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. テスト構造の検証（`scripts/validate-test-structure.mjs`）
2. テストカバレッジの確認
3. 実行ログの記録（`scripts/log_usage.mjs`）

**スクリプト**:

```bash
# テスト構造の検証
node .claude/skills/playwright-testing/scripts/validate-test-structure.mjs <test-file-path>

# 使用ログの記録
node .claude/skills/playwright-testing/scripts/log_usage.mjs \
  --result success \
  --phase "implementation" \
  --notes "E2E test suite completed"
```

## Task仕様ナビゲーション

各Taskは独立した作業単位として `agents/` に定義されています。

| Task             | ファイル                        | 役割                   | 主な出力       |
| ---------------- | ------------------------------- | ---------------------- | -------------- |
| テスト設計       | `agents/test-designer.md`       | テストケースの設計     | テスト設計書   |
| セレクタ戦略     | `agents/selector-strategist.md` | セレクタパターンの選定 | セレクタ戦略   |
| テスト実装       | `agents/test-implementer.md`    | テストコードの実装     | テストコード   |
| デバッグ・最適化 | `agents/test-debugger.md`       | フレーキーテストの解消 | 修正済みテスト |

**使用タイミング**:

- 各Phaseの開始時に対応するTaskを読み込む
- Task間の依存関係: 設計 → セレクタ → 実装 → デバッグ
- 必要に応じてフェーズを反復（特にデバッグフェーズ）

## ベストプラクティス

### すべきこと

**テスト設計**:

- テストの独立性を保つ（他のテストに依存しない）
- 各テストは1つの責務のみを持つ（原子性）
- Given-When-Thenパターンで明確に記述

**セレクタ選択**:

- 優先順位を守る: Role > Label > TestId > CSS
- アクセシビリティを考慮したセレクタを使用
- data-testid は安定性が必要な場合のみ使用

**待機戦略**:

- 固定時間待機（sleep）は避ける
- 状態変化を待つ適切なメソッドを使用
  - `waitForSelector()` - 要素の出現を待つ
  - `waitForResponse()` - API応答を待つ
  - `waitForFunction()` - 任意の条件を待つ

**エラーハンドリング**:

- 意図的な失敗ケースは明示的にテスト
- タイムアウト値は適切に設定
- エラーメッセージは具体的に

### 避けるべきこと

**アンチパターン**:

- CSSクラス名に依存したセレクタ（スタイル変更で壊れる）
- XPathの過度な使用（保守性が低い）
- 固定時間待機（`page.waitForTimeout(3000)`）
- テスト間のデータ依存関係
- 過度なリトライ設定（根本原因を隠蔽）

**フレーキーテストの原因**:

- レースコンディション（適切な待機がない）
- テスト実行順序への依存
- 共有状態の変更
- タイムアウトが短すぎる
- ネットワーク依存の不安定性

## リソース参照

### references/（詳細知識）

| リソース           | パス                                                                                   | 読み込みタイミング               |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------------------- |
| 基礎知識           | See [references/Level1_basics.md](references/Level1_basics.md)                         | Phase 1（テスト設計時）          |
| 中級               | See [references/Level2_intermediate.md](references/Level2_intermediate.md)             | Phase 3（実装時）                |
| 上級               | See [references/Level3_advanced.md](references/Level3_advanced.md)                     | Phase 4（デバッグ時）            |
| エキスパート       | See [references/Level4_expert.md](references/Level4_expert.md)                         | パフォーマンス最適化が必要な場合 |
| ベストプラクティス | See [references/playwright-best-practices.md](references/playwright-best-practices.md) | すべてのPhase                    |
| セレクタ戦略       | See [references/selector-strategies.md](references/selector-strategies.md)             | Phase 2（セレクタ選定時）        |
| 待機戦略           | See [references/waiting-strategies.md](references/waiting-strategies.md)               | Phase 3, 4（実装・デバッグ時）   |

### scripts/（決定論的処理）

| スクリプト                    | 用途             | 使用例                                                             |
| ----------------------------- | ---------------- | ------------------------------------------------------------------ |
| `validate-skill.mjs`          | スキル構造の検証 | `node scripts/validate-skill.mjs`                                  |
| `validate-test-structure.mjs` | テスト構造の検証 | `node scripts/validate-test-structure.mjs tests/e2e/login.spec.ts` |
| `log_usage.mjs`               | 使用ログの記録   | `node scripts/log_usage.mjs --result success --phase "Phase 3"`    |

### assets/（テンプレート）

| テンプレート       | 用途                 |
| ------------------ | -------------------- |
| `test-template.ts` | テストコードのひな型 |

## コマンドリファレンス

### スキル構造の確認

```bash
# スキル構造の検証
node .claude/skills/playwright-testing/scripts/validate-skill.mjs

# referencesファイルの一覧
ls .claude/skills/playwright-testing/references/

# agentsファイルの一覧
ls .claude/skills/playwright-testing/agents/
```

### リソース読み取り

```bash
# 基礎知識
cat .claude/skills/playwright-testing/references/Level1_basics.md

# セレクタ戦略
cat .claude/skills/playwright-testing/references/selector-strategies.md

# 待機戦略
cat .claude/skills/playwright-testing/references/waiting-strategies.md

# ベストプラクティス
cat .claude/skills/playwright-testing/references/playwright-best-practices.md
```

### テスト検証

```bash
# テスト構造の検証
node .claude/skills/playwright-testing/scripts/validate-test-structure.mjs tests/e2e/login.spec.ts

# 検証ヘルプ
node .claude/skills/playwright-testing/scripts/validate-test-structure.mjs --help
```

### ログ記録

```bash
# 成功ログの記録
node .claude/skills/playwright-testing/scripts/log_usage.mjs \
  --result success \
  --phase "implementation" \
  --agent "test-implementer" \
  --notes "Login test suite completed"

# 失敗ログの記録
node .claude/skills/playwright-testing/scripts/log_usage.mjs \
  --result failure \
  --phase "debugging" \
  --notes "Flaky test in checkout flow"

# ヘルプ表示
node .claude/skills/playwright-testing/scripts/log_usage.mjs --help
```

## トラブルシューティング

### よくある問題と解決策

**問題: テストがフレーキー（不安定）**

- 原因: 不適切な待機戦略
- 解決: `references/waiting-strategies.md` を参照し、適切な待機メソッドを使用

**問題: セレクタが頻繁に壊れる**

- 原因: CSSクラスやXPathへの依存
- 解決: `references/selector-strategies.md` を参照し、Role-basedセレクタに変更

**問題: テストが遅い**

- 原因: 並列実行されていない、不要な待機
- 解決: `references/Level4_expert.md` のパフォーマンス最適化セクションを参照

**問題: テスト間で状態が共有される**

- 原因: クリーンアップ不足、共有データへの依存
- 解決: `beforeEach` / `afterEach` でクリーンアップを徹底

## 変更履歴

| Version | Date       | Changes                                                        |
| ------- | ---------- | -------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md 仕様準拠、agents/追加、Progressive Disclosure適用 |
| 1.0.0   | 2025-12-24 | 初版リリース                                                   |

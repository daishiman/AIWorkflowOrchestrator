---
name: .claude/skills/flaky-test-prevention/SKILL.md
description: |
  フレーキー（不安定）なテストを防止する技術。
  非決定性の排除、リトライロジック、安定性向上パターンを提供します。

  📖 参照書籍:
  - 『Test-Driven Development: By Example』（Kent Beck）: Red-Green-Refactor

  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/non-determinism-patterns.md`: non-determinism-patterns のパターン集
  - `references/retry-strategies.md`: .claude/skills/retry-strategies/SKILL.md の詳細ガイド
  - `references/stability-checklist.md`: stability-checklist のチェックリスト
  - `scripts/detect-flaky-tests.mjs`: detectflakytestsを処理するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/stable-test-template.ts`: stable-test-template のテンプレート
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）

  Use proactively when handling flaky test prevention tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
triggers:
  - テストが不安定である
  - フレーキーテストを防止したい
  - テスト実行が時々失敗する
  - 並列実行時に問題が発生する
  - 非決定的な要素を制御したい
  - テストの安定性を向上させたい
anchors:
  - • Test-Driven Development: By Example / テスト駆動開発 / Red-Green-Refactor パターン習得
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
references:
  - book: "Test-Driven Development: By Example"
    author: "Kent Beck"
    concepts:
      - "Red-Green-Refactor"
      - "テスト設計"
---

# Flaky Test Prevention Skill

## 概要

フレーキー（不安定）なテストを防止する技術。
非決定性の排除、リトライロジック、安定性向上パターンを提供します。
専門分野:

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## ベストプラクティス

### すべきこと

- テストが時々失敗する時
- テスト実行結果が不安定な時
- 並列実行時の問題が発生する時
- 固定時間待機を排除する必要がある時
- 非決定的要素（時刻、ランダム性）を制御する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/flaky-test-prevention/references/Level1_basics.md
cat .claude/skills/flaky-test-prevention/references/Level2_intermediate.md
cat .claude/skills/flaky-test-prevention/references/Level3_advanced.md
cat .claude/skills/flaky-test-prevention/references/Level4_expert.md
cat .claude/skills/flaky-test-prevention/references/legacy-skill.md
cat .claude/skills/flaky-test-prevention/references/non-determinism-patterns.md
cat .claude/skills/flaky-test-prevention/references/retry-strategies.md
cat .claude/skills/flaky-test-prevention/references/stability-checklist.md
```

### スクリプト実行

```bash
node .claude/skills/flaky-test-prevention/scripts/detect-flaky-tests.mjs --help
node .claude/skills/flaky-test-prevention/scripts/log_usage.mjs --help
node .claude/skills/flaky-test-prevention/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/flaky-test-prevention/assets/stable-test-template.ts
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |

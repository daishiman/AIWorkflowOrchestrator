---
name: refactoring-patterns
description: |
  設計パターンを用いた段階的リファクタリングの判断・計画・適用・検証を支援するスキル。
  変化点の見極めとテスト保護を前提に、過剰な抽象化を避けて構造改善を進める。

  Anchors:
  • Refactoring to Patterns (Joshua Kerievsky) / 適用: パターン導入手順 / 目的: 段階的移行
  • Design Patterns (GoF) / 適用: パターン選定 / 目的: 責務分離と拡張性
  • Working Effectively with Legacy Code (Michael Feathers) / 適用: レガシー安全性 / 目的: 変更の安全確保

  Trigger:
  Use when refactoring legacy or complex code by introducing design patterns incrementally while preserving behavior.
  refactoring patterns, design patterns, legacy code, strategy pattern, adapter pattern, template method, factory
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Task
---

# refactoring-patterns

## 概要

設計パターンを使ったリファクタリングを、判断→計画→段階的適用→検証の順で進めるためのスキル。
コードスメルの背後にある変化点を特定し、最小限のパターン導入で保守性を高める。
判断理由を記録し、再現性のある改善プロセスにする。

---

## ワークフロー

### Phase 1: パターン機会の特定

**目的**: パターン導入が有効な変化点と候補パターンを洗い出す

**アクション**:

1. 影響範囲と既存テストを確認する
2. `references/pattern-opportunities.md` で変化点/スメルを整理する
3. `references/pattern-selection-matrix.md` で候補パターンを絞り込む
4. パターン機会レポートを作成する

**Task**: `agents/identify-pattern.md` を参照

### Phase 2: パターン導入計画と段階的適用

**目的**: 段階的な導入計画を作り、テスト保護下で小さく適用する

**アクション**:

1. `assets/pattern-refactor-plan-template.md` で計画を作成する
2. `references/incremental-application-steps.md` の手順で変更を分割する
3. `scripts/validate-pattern-plan.mjs` で計画の欠落を検出する
4. 変更を段階的に適用し、各段階でテストを通す

**Task**: `agents/apply-pattern.md` を参照

### Phase 3: 適用結果の検証と記録

**目的**: 振る舞い維持とパターン適合を確認し、意思決定を残す

**アクション**:

1. `assets/pattern-application-checklist.md` で検証する
2. `references/validation-criteria.md` で品質条件を確認する
3. `assets/pattern-decision-record.md` に判断理由を記録する
4. 必要なドキュメント/テスト更新を行う

**Task**: `agents/validate-pattern.md` を参照

---

## Task仕様ナビ

| Task              | 起動タイミング     | 入力                               | 出力                               |
| ----------------- | ------------------ | ---------------------------------- | ---------------------------------- |
| identify-pattern  | Phase 1 開始時      | 対象コード/テスト/現状課題          | パターン機会レポート               |
| apply-pattern     | Phase 2 開始時      | 機会レポート/制約/テスト状況        | パターン導入計画/段階的適用結果    |
| validate-pattern  | Phase 3 開始時      | 適用結果/テスト結果/設計判断メモ    | 検証レポート/意思決定記録          |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                       | 理由                                   |
| ------------------------------ | -------------------------------------- |
| 変化点を先に特定する           | パターン選定の前提が明確になる          |
| 段階的に導入する               | テスト保護下での安全性が高まる          |
| 置き換え単位を小さく保つ       | 差分が理解しやすくレビューしやすい      |
| パターン適用の目的を記録する   | 過剰適用や意図の喪失を防ぐ              |
| 既存の振る舞い維持を最優先する | レガシーの安全性を確保できる            |

### 避けるべきこと

| 禁止事項                       | 問題点                                 |
| ------------------------------ | -------------------------------------- |
| パターン名ありきで導入する     | 不要な抽象化と複雑化を招く              |
| 一度に大きく置き換える         | 影響範囲が拡大し回帰リスクが高い        |
| テストなしで進める             | 振る舞い維持の検証ができない            |
| 既存設計の意図を無視する       | 本質的な問題の解決にならない            |
| パフォーマンス検証を省略する   | 遅延や負荷増大に気づけない              |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト                          | 機能                               |
| ----------------------------------- | ---------------------------------- |
| `scripts/validate-pattern-plan.mjs` | 導入計画テンプレの必須項目を検証   |
| `scripts/log_usage.mjs`             | 使用記録と評価メトリクス更新       |

### 運用ファイル

| ファイル     | 目的                     |
| ------------ | ------------------------ |
| `EVALS.json` | レベル評価・メトリクス管理 |
| `LOGS.md`    | 実行ログの蓄積           |

### references/（詳細知識）

| リソース                         | パス                                                                   | 読込条件                   |
| -------------------------------- | ---------------------------------------------------------------------- | -------------------------- |
| パターン機会の判断基準           | [references/pattern-opportunities.md](references/pattern-opportunities.md) | Phase 1 で判断する時       |
| パターン選定マトリクス           | [references/pattern-selection-matrix.md](references/pattern-selection-matrix.md) | 候補パターンを絞る時       |
| 段階的導入ステップ               | [references/incremental-application-steps.md](references/incremental-application-steps.md) | 計画を立てる時             |
| パターン適用のアンチパターン     | [references/pattern-anti-patterns.md](references/pattern-anti-patterns.md) | 過剰適用の兆候を確認する時 |
| 検証基準                         | [references/validation-criteria.md](references/validation-criteria.md) | Phase 3 で検証する時       |

### assets/（テンプレート・素材）

| アセット                                 | 用途                             |
| ---------------------------------------- | -------------------------------- |
| `assets/pattern-refactor-plan-template.md` | 導入計画テンプレート             |
| `assets/pattern-application-checklist.md` | 適用後の検証チェックリスト       |
| `assets/pattern-decision-record.md`       | 意思決定記録テンプレート         |

---

## 変更履歴

| Version | Date       | Changes                                                                 |
| ------- | ---------- | ----------------------------------------------------------------------- |
| 2.1.0   | 2026-01-06 | log_usage.mjs追加、EVALS.json追加、skill-creator準拠                   |
| 2.0.0   | 2026-01-02 | skill-creator手順に沿って全面改訂。ワークフロー/Task/テンプレを再設計。 |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づいて新規作成。                                    |

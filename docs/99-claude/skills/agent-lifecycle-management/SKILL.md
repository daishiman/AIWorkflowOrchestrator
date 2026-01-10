---
name: agent-lifecycle-management
description: |
  Agent lifecycle management specialist skill. Ensures continuous quality through startup, execution, state management, shutdown, versioning, and maintenance.

  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / Apply: Lifecycle management and maintenance strategies / Purpose: Practical agent operations and versioning philosophy

  Trigger:
    Use when designing agent initialization strategies, implementing agent state management mechanisms, developing agent versioning strategies, planning agent maintenance, implementing agent shutdown and cleanup, coordinating multi-agent system lifecycles.
    initialization, state management, versioning, maintenance, shutdown, cleanup, monitoring, logging
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# エージェントライフサイクル管理

## 概要

エージェントライフサイクル管理を専門とするスキル。
起動、実行、状態管理、終了、バージョニング、メンテナンスにより、
エージェントの継続的な品質を保証します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: エージェントライフサイクルにおけるタスクの目的と前提条件を明確にする

**アクション**:

1. ライフサイクルの段階を特定（初期化・実行・監視・保守・終了のいずれか）
2. `references/Level1_basics.md` で基本パターンを確認
3. 必要なリソース・テンプレート・スクリプトを特定

**Task**: `agents/analyze-lifecycle.md` を参照

### Phase 2: スキル適用

**目的**: ライフサイクル管理の指針に従って具体的な実装・設計を進める

**アクション**:

1. 対応するレベルガイド（Level1～4）を参照
2. `execution-protocol.md` で実行プロトコルを確認
3. `lifecycle-template.md` でライフサイクル構成例を参照
4. 実装・設計を進めながら重要な判断点を記録

**Task**: `agents/implement-lifecycle.md` を参照

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/check-lifecycle.mjs` でライフサイクル設計を検証
2. 成果物がプロトコルに合致するか確認
3. `scripts/validate-skill.mjs` でスキル構造を確認
4. `scripts/log_usage.mjs` を実行して利用記録を残す

**Task**: `agents/validate-lifecycle.md` を参照

---

## Task仕様ナビ

| Task                | 起動タイミング | 入力             | 出力             |
| ------------------- | -------------- | ---------------- | ---------------- |
| analyze-lifecycle   | Phase 1開始時  | タスク仕様       | コンテキスト分析 |
| implement-lifecycle | Phase 2開始時  | コンテキスト分析 | 実装ドキュメント |
| validate-lifecycle  | Phase 3開始時  | 実装ドキュメント | 検証結果レポート |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

- **状態遷移を明確に定義**: エージェントのライフサイクルステージ（初期化→実行→監視→保守→終了）の遷移ルールを明示的に設計する
- **リソース管理の実装**: 初期化時のリソース確保と終了時のクリーンアップを対称的に実装する
- **バージョニング戦略の策定**: エージェントコード・設定・スキーマのバージョニングルールを事前に定義する
- **メンテナンス計画の立案**: 定期的な監視・更新・廃棋プロセスを文書化する
- **ログ・監視ポイントの実装**: ライフサイクル各段階の遷移をログして障害追跡可能にする
- **テストカバレッジ**: ライフサイクル遷移パスと境界値の単体テストを実装する
- **ドキュメント化**: ライフサイクル図・状態遷移表・サンプルコードを提供する

### 避けるべきこと

- **グローバル状態の直接操作**: エージェント状態を外部から直接変更する実装を避ける
- **同期的な長時間処理**: 初期化や終了で同期ブロッキング処理を避ける（非同期化を検討）
- **リソースリーク**: 初期化したリソースの終了漏れを防止する（リソーストラッキング実装）
- **バージョン互換性の無視**: 旧バージョンエージェントとの共存戦略なしにアップグレードを避ける
- **説明不足なライフサイクル**: プロトコルドキュメントなしで複雑なライフサイクルを実装しない
- **テスト不足**: ライフサイクル遷移エッジケースのテストを省略しない
- **監視なしの本番導入**: ログ・メトリクス・アラート整備なしで本番環境に導入しない

## リソース参照

### references/（詳細知識）

| リソース       | パス                                                                   | 読込条件         |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| 基礎概念       | [references/Level1_basics.md](references/Level1_basics.md)             | 初回利用時       |
| 実務パターン   | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 実務適用時       |
| 応用ガイド     | [references/Level3_advanced.md](references/Level3_advanced.md)         | 複雑系対応時     |
| 専門解説       | [references/Level4_expert.md](references/Level4_expert.md)             | 高度な課題時     |
| 実行プロトコル | [references/execution-protocol.md](references/execution-protocol.md)   | プロトコル確認時 |
| バージョニング | [references/versioning-guide.md](references/versioning-guide.md)       | バージョン管理時 |

### scripts/（決定論的処理）

| スクリプト                    | 機能               |
| ----------------------------- | ------------------ |
| `scripts/check-lifecycle.mjs` | ライフサイクル検証 |
| `scripts/validate-skill.mjs`  | スキル構造検証     |
| `scripts/log_usage.mjs`       | フィードバック記録 |

### assets/（テンプレート）

| アセット                       | 用途                       |
| ------------------------------ | -------------------------- |
| `assets/lifecycle-template.md` | ライフサイクル実装テンプレ |

## 変更履歴

| Version | Date       | Changes                                                                                                                                      |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | agents/追加、テーブル形式統一、Task仕様ナビ改善                                                                                              |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様への完全準拠: Triggerセクション追加、allowed-tools定義、Task仕様ナビ追加、ベストプラクティス拡充、リソース参照セクション整理 |
| 0.9.0   | 2025-12-24 | スキル構造体検証とアーティファクト追加                                                                                                       |

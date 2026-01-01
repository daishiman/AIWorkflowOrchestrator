---
name: process-lifecycle-management
description: |
  Node.jsプロセスのライフサイクル管理を専門とするスキル。
  Linuxカーネルのプロセス管理思想に基づき、プロセスの生成、実行、
  監視、終了までの完全な制御と、シグナル処理、ゾンビプロセス回避を設計します。

  Anchors:
  • The Pragmatic Programmer（Andrew Hunt, David Thomas）/ 適用: プロセス管理 / 目的: 実践的改善と品質維持

  Trigger:
  プロセスライフサイクル管理、アプリケーション起動・停止制御、Graceful Shutdown実装、シグナルハンドラー設計、PM2によるプロセス管理設定時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# プロセスライフサイクル管理

## 概要

Node.jsプロセスのライフサイクル管理を専門とするスキル。
Linuxカーネルのプロセス管理思想に基づき、プロセスの生成、実行、
監視、終了までの完全な制御と、シグナル処理、ゾンビプロセス回避を設計します。

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

## Task仕様ナビ

### 学習リソース

| リソース                    | 対象レベル | 目的                                   | 使用条件                               | 出力形式                 |
| --------------------------- | ---------- | -------------------------------------- | -------------------------------------- | ------------------------ |
| `Level1_basics.md`          | 初級       | プロセス管理の基礎理論と概念理解       | 初めてプロセス管理を学ぶ時             | マークダウン解説         |
| `Level2_intermediate.md`    | 中級       | 実務レベルの実装パターン習得           | 実装を開始する時、パターン確認         | マークダウン実装ガイド   |
| `Level3_advanced.md`        | 上級       | 応用的な最適化テクニックと設計パターン | 既存実装の改善やパフォーマンス最適化時 | マークダウン詳細解説     |
| `Level4_expert.md`          | 専門       | 専門レベルの深い知識と運用パターン     | パフォーマンス最適化、複雑な課題解決時 | マークダウン詳細解説     |
| `child-process-patterns.md` | 実装       | 子プロセス管理パターン集               | 子プロセス実装時、パターン参照         | マークダウンパターン集   |
| `process-states.md`         | 実装       | プロセス状態遷移とライフサイクル管理   | プロセス状態の設計・実装時             | マークダウン状態図・解説 |
| `signal-handling.md`        | 実装       | Graceful Shutdown実装ガイド            | シグナルハンドラー実装時               | マークダウン実装手順     |
| `requirements-index.md`     | 参照       | 要求仕様との統合索引                   | 仕様確認、要件マッピング時             | マークダウン索引         |
| `legacy-skill.md`           | 参照       | 旧バージョンの全コンテンツ             | 過去の実装確認、移行時                 | マークダウン全文         |

### スクリプトツール

| スクリプト                 | 目的                       | 使用タイミング                           | 入力                     | 出力形式                        |
| -------------------------- | -------------------------- | ---------------------------------------- | ------------------------ | ------------------------------- |
| `check-process-health.mjs` | プロセスヘルスチェック実行 | 実装後の動作確認、トラブルシューティング | プロセスID（オプション） | CLI実行結果、JSON形式           |
| `log_usage.mjs`            | スキル使用記録と自動評価   | スキル使用後、定期的な記録生成           | なし（自動収集）         | JSON形式のログファイル          |
| `validate-skill.mjs`       | スキル構造と品質検証       | 実装完了後、品質確認時                   | なし（自動検証）         | CLI実行結果、バリデーション結果 |

### 実装テンプレート

| テンプレート                 | 目的                       | 適用シーン                   | 出力形式         |
| ---------------------------- | -------------------------- | ---------------------------- | ---------------- |
| `signal-handler.template.ts` | Signal Handler実装の基本形 | シグナルハンドラー実装開始時 | TypeScript実装例 |

## ベストプラクティス

### すべきこと

- Node.jsプロセスの起動・終了フローを設計する時
- シグナルハンドラーを実装する時
- 子プロセスの管理戦略を決定する時
- PM2でプロセスを管理する設定を行う時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- graceful shutdownの実装なしに本番環境へ展開することを避ける
- シグナルハンドラーなしのプロセス管理を避ける
- 子プロセスの終了確認なしの設計を避ける

## リソース参照

### 学習リソースへのアクセス

**Level 1（基礎）**:

```bash
cat .claude/skills/process-lifecycle-management/references/Level1_basics.md
```

**Level 2（実務）**:

```bash
cat .claude/skills/process-lifecycle-management/references/Level2_intermediate.md
```

**Level 3（応用）**:

```bash
cat .claude/skills/process-lifecycle-management/references/Level3_advanced.md
```

**Level 4（専門）**:

```bash
cat .claude/skills/process-lifecycle-management/references/Level4_expert.md
```

### 実装ガイド

**プロセス状態管理**:

```bash
cat .claude/skills/process-lifecycle-management/references/process-states.md
```

**子プロセス管理パターン**:

```bash
cat .claude/skills/process-lifecycle-management/references/child-process-patterns.md
```

**シグナル処理とGraceful Shutdown**:

```bash
cat .claude/skills/process-lifecycle-management/references/signal-handling.md
```

**要求仕様索引**:

```bash
cat .claude/skills/process-lifecycle-management/references/requirements-index.md
```

### スクリプトツールの実行

**プロセスヘルスチェック**:

```bash
node .claude/skills/process-lifecycle-management/scripts/check-process-health.mjs --help
node .claude/skills/process-lifecycle-management/scripts/check-process-health.mjs
```

**スキル構造検証**:

```bash
node .claude/skills/process-lifecycle-management/scripts/validate-skill.mjs --help
node .claude/skills/process-lifecycle-management/scripts/validate-skill.mjs
```

**使用記録と評価**:

```bash
node .claude/skills/process-lifecycle-management/scripts/log_usage.mjs --help
node .claude/skills/process-lifecycle-management/scripts/log_usage.mjs
```

### 実装テンプレート

**Signal Handler テンプレート**:

```bash
cat .claude/skills/process-lifecycle-management/assets/signal-handler.template.ts
```

## 変更履歴

| Version | Date       | Changes                                                                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づいてSKILL.mdを更新: Anchors/Triggerを追加、Task仕様ナビ（テーブル形式）を新規追加、リソース参照を体系化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                   |

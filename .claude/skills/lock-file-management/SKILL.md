---
name: lock-file-management
description: |
  ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と
  依存関係の再現性確保を専門とするスキル。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）/ 適用: 依存関係管理 / 目的: 再現可能ビルド確保

  Trigger:
  ロックファイル管理、マージコンフリクト解決、依存関係固定、CI/CD最適化時に使用
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
---

# ロックファイル管理

## 概要

ロックファイル（pnpm-lock.yaml、package-lock.json、yarn.lock等）の整合性管理と
依存関係の再現性確保を専門とするスキル。

このスキルは以下の領域をカバーします：

- **ロックファイル形式**の理解と比較（pnpm、npm、yarn）
- **マージコンフリクト**の解決と再生成戦略
- **整合性検証**とハッシュ検証
- **CI/CD最適化**（frozen-lockfile、キャッシュ戦略）
- **依存関係ツリー**の検証と同期確認

詳細な手順や背景は `references/Level1_basics.md` ～ `Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. 対象のロックファイル形式と問題の種類を特定（マージコンフリクト/再現性/検証等）
2. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
3. 必要なスクリプト（verify-lock-integrity.mjs等）やテンプレートを特定
4. 現在の環境状態をバックアップ

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソース（references/conflict-resolution.md、references/ci-cd-optimization.md等）を参照
2. テンプレート（lockfile-troubleshooting-template.md）を適用
3. 必要に応じてスクリプト（verify-lock-integrity.mjs）を実行
4. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/verify-lock-integrity.mjs` でロックファイル整合性を確認
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 成果物が目的に合致するか最終確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Task                       | 説明                                        | 難易度 | 推奨リソース                         | スクリプト                |
| -------------------------- | ------------------------------------------- | ------ | ------------------------------------ | ------------------------- |
| ロックファイル形式の理解   | pnpm、npm、yarn各形式の構造とバージョン管理 | 初級   | lock-file-formats.md                 | -                         |
| マージコンフリクト解決     | ロックファイルのGitコンフリクト解決手順     | 中級   | conflict-resolution.md               | verify-lock-integrity.mjs |
| 整合性検証                 | package.jsonとロックファイルの同期確認      | 中級   | integrity-verification.md            | verify-lock-integrity.mjs |
| CI/CD最適化                | frozen-lockfile設定とキャッシュ戦略         | 中級   | ci-cd-optimization.md                | -                         |
| 依存ツリー検証             | 依存関係ツリーの構造確認と問題検出          | 上級   | Level3_advanced.md                   | verify-lock-integrity.mjs |
| 環境セットアップ           | 新しい環境でのロックファイル利用            | 初級   | Level1_basics.md                     | -                         |
| トラブルシューティング     | ロックファイル問題の診断と修正              | 上級   | lockfile-troubleshooting-template.md | verify-lock-integrity.mjs |
| パッケージマネージャー移行 | npm から pnpm への移行手順                  | 上級   | lock-file-formats.md                 | -                         |

## ベストプラクティス

### すべきこと

- **ロックファイルをバージョン管理に含める**: 再現可能なビルドのためロックファイルをリポジトリにコミット
- **マージコンフリクト前に確認**: コンフリクト解決前に `references/conflict-resolution.md` を参照
- **整合性を定期的に検証**: `verify-lock-integrity.mjs` で package.json との同期を確認
- **CI/CDで frozen-lockfile を使用**: `frozen-lockfile` フラグで依存関係を固定
- **キャッシュ戦略を最適化**: `references/ci-cd-optimization.md` に従いCI/CDビルド時間を短縮
- **新環境でのセットアップを確立**: プロジェクト開始時に Level1_basics.md に従いセットアップ手順を確立
- **問題が発生したときはテンプレート活用**: `lockfile-troubleshooting-template.md` でトラブルシューティング

### 避けるべきこと

- **手動でロックファイルを編集しない**: スクリプト実行での再生成を推奨
- **複数の形式を混在させない**: プロジェクト内で pnpm/npm/yarn は統一
- **古いロックファイルを保存し続けない**: 不要なバージョンは削除して管理
- **frozen-lockfile なしで本番デプロイ**: ローカル環境とCI/CDの不一致を避ける
- **アンチパターンを無視する**: Level2_intermediate.md のアンチパターンを確認すること

## リソース参照

### 学習リソース（references/）

| ファイル                    | 説明                                                     |
| --------------------------- | -------------------------------------------------------- |
| `Level1_basics.md`          | 初級: ロックファイル基礎、環境セットアップ、基本操作     |
| `Level2_intermediate.md`    | 中級: マージコンフリクト解決、整合性検証、アンチパターン |
| `Level3_advanced.md`        | 上級: 依存ツリー解析、複雑なシナリオ対応                 |
| `Level4_expert.md`          | エキスパート: ロックファイル最適化、カスタム戦略         |
| `lock-file-formats.md`      | pnpm/npm/yarn 形式比較、移行ガイド、バージョン管理       |
| `conflict-resolution.md`    | マージコンフリクト手順、再生成戦略、両立性確保           |
| `integrity-verification.md` | 整合性チェック、ハッシュ検証、自動検証スクリプト         |
| `ci-cd-optimization.md`     | frozen-lockfile設定、キャッシュ戦略、ビルド最適化        |
| `legacy-skill.md`           | 旧SKILL.mdの参考資料                                     |

### スクリプト（scripts/）

| スクリプト                  | 用途                                                             |
| --------------------------- | ---------------------------------------------------------------- |
| `verify-lock-integrity.mjs` | ロックファイル整合性を自動検証（PM検出、同期確認、詳細レポート） |
| `validate-skill.mjs`        | スキル構造と内容を検証                                           |
| `log_usage.mjs`             | 使用記録と自動評価を実施                                         |

### テンプレート（assets/）

| テンプレート                           | 説明                                   |
| -------------------------------------- | -------------------------------------- |
| `lockfile-troubleshooting-template.md` | トラブルシューティング手順テンプレート |

### 実行例

```bash
# 整合性検証
node .claude/skills/lock-file-management/scripts/verify-lock-integrity.mjs

# スキル構造の確認
node .claude/skills/lock-file-management/scripts/validate-skill.mjs

# 使用記録
node .claude/skills/lock-file-management/scripts/log_usage.mjs --help
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                           |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様への準拠: YAML frontmatter更新（allowed-tools追加）、日本語タイトル、Task仕様ナビテーブル追加、リソース参照の構造化、ベストプラクティス拡充、Anchor/Trigger明確化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                                       |

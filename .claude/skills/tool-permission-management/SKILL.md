---
name: tool-permission-management
description: |
  ツール権限管理の専門スキル。Claude Code権限設定、安全なツール利用設計を提供します。

  Claude Code環境内でのツール権限とアクセス制御を包括的に管理します。セキュリティ制御、権限検証、アクセストレース、リスク評価を通じて、安全で効率的なツール利用環境を構築・維持します。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas） / 適用: 権限管理 / 目的: セキュリティ確保

  Trigger:
  ツール権限設定時、Claude Code設定時、安全なツール利用設計時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# ツール権限管理

## 概要

Claude Code環境でのツール権限とアクセス制御を包括的に管理するスキル。セキュリティ制御、権限検証、アクセストレース、リスク評価を通じて、安全で効率的なツール利用環境を構築・維持します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 権限の整理と分析

**目的**: 現在のツール権限状況と要件を明確化する

**アクション**:

1. 対象ツール・タスクを特定する
2. `references/Level1_basics.md` で基礎概念を確認
3. `references/tool-selection-matrix.md` で権限マトリックスを参照
4. 必要なアクセスレベルを定義

### Phase 2: 権限設定と検証

**目的**: 権限ポリシーを設定し、セキュリティを確保する

**アクション**:

1. `references/Level2_intermediate.md` で実務手順を確認
2. `assets/permission-template.yaml` をベースに権限設定を定義
3. 最小権限の原則に従って権限を制限
4. `scripts/validate-skill.mjs` で設定の妥当性を確認

### Phase 3: 実装と記録

**目的**: 権限設定を実装し、監視・ログを整備する

**アクション**:

1. `scripts/analyze-permissions.mjs` で権限分析を実行
2. `scripts/log_usage.mjs` でアクセスログを記録
3. `references/Level3_advanced.md` でリスク評価を実施
4. 変更内容と理由を記録する

## Task仕様ナビ

このスキルで対応可能な関連タスク:

| Task             | 説明                                 | 推奨Level | リソース                                         |
| ---------------- | ------------------------------------ | --------- | ------------------------------------------------ |
| 権限検査         | 現在のツール権限をスキャン・分析     | 1-2       | Level1_basics.md, analyze-permissions.mjs        |
| 権限設定         | 特定ツールへのアクセス権限を設定     | 2-3       | Level2_intermediate.md, permission-template.yaml |
| セキュリティ監査 | 権限ポリシーのセキュリティレビュー   | 3-4       | Level3_advanced.md, Level4_expert.md             |
| アクセスログ管理 | ツールアクセスの使用ログを記録・監視 | 2-3       | log_usage.mjs, tool-selection-matrix.md          |
| リスク評価       | 権限構成のリスク分析と改善提案       | 3-4       | Level3_advanced.md, Level4_expert.md             |
| 権限ポリシー設計 | 組織に合わせた権限モデルを設計       | 4         | Level4_expert.md, architectural-patterns.md      |

## ベストプラクティス

### すべきこと

- **最小権限の原則を適用**: 必要最小限のアクセスのみを付与する
- **権限要件を明確化**: タスク実行前に必要な権限を整理する
- `references/Level1_basics.md` で基礎概念を確認してから実装する
- `assets/permission-template.yaml` をベースに権限設定テンプレートを作成
- `scripts/validate-skill.mjs` で設定の妥当性を検証する
- `scripts/log_usage.mjs` でアクセスログを定期的に記録・監視する
- `references/Level2_intermediate.md` で実務的な設定パターンを学ぶ
- セキュリティ監査時は `references/Level3_advanced.md` を参照する
- リスク評価時は `references/Level4_expert.md` で詳細な分析を行う
- 権限変更の理由と承認者を記録する

### 避けるべきこと

- 無制限の権限（admin権限）を無差別に付与する
- 権限要件を確認せずに進める
- ログを記録・監視しないまま権限を運用する
- セキュリティリスク評価を経ずに権限ポリシーを変更する
- `references/` や `scripts/` を参照せずに独断で実装する
- 権限の複製・共有や共有アカウントの使用
- 定期的な権限レビューを省略する
- 権限変更の監査証跡を残さない
- 開発環境と本番環境で同じ権限設定を使用する

## リソース参照

### リソースファイル構成

#### 📚 学習リソース (references/)

| ファイル                   | 対象Level    | 内容                                             |
| -------------------------- | ------------ | ------------------------------------------------ |
| `Level1_basics.md`         | 初心者       | ツール権限管理の基本概念、用語、簡単な設定例     |
| `Level2_intermediate.md`   | 中級者       | 実務的な権限設定パターン、トラブルシューティング |
| `Level3_advanced.md`       | 上級者       | リスク評価、セキュリティ監査、複雑な権限構成     |
| `Level4_expert.md`         | エキスパート | 権限モデル設計、セキュリティアーキテクチャ       |
| `legacy-skill.md`          | 参考         | 旧SKILL.md、歴史的背景と参考情報                 |
| `tool-selection-matrix.md` | 実装         | ツール別権限マトリックス、判断表                 |

#### 🛠️ スクリプト (scripts/)

| スクリプト                | 用途                             |
| ------------------------- | -------------------------------- |
| `analyze-permissions.mjs` | 権限分析・スキャン、レポート生成 |
| `log_usage.mjs`           | アクセスログ記録、使用統計追跡   |
| `validate-skill.mjs`      | スキル構造・設定検証、テスト実行 |

#### 📋 テンプレート (assets/)

| テンプレート               | 用途                           |
| -------------------------- | ------------------------------ |
| `permission-template.yaml` | 権限設定テンプレート、YAML形式 |

### コマンドリファレンス

#### リソース読み取り

```bash
# 基礎レベル
cat .claude/skills/tool-permission-management/references/Level1_basics.md

# 実務レベル
cat .claude/skills/tool-permission-management/references/Level2_intermediate.md

# 上級・エキスパート
cat .claude/skills/tool-permission-management/references/Level3_advanced.md
cat .claude/skills/tool-permission-management/references/Level4_expert.md

# 参考・ツール選択
cat .claude/skills/tool-permission-management/references/legacy-skill.md
cat .claude/skills/tool-permission-management/references/tool-selection-matrix.md
```

#### スクリプト実行

```bash
# 権限分析
node .claude/skills/tool-permission-management/scripts/analyze-permissions.mjs --help

# アクセスログ管理
node .claude/skills/tool-permission-management/scripts/log_usage.mjs --help

# スキル検証
node .claude/skills/tool-permission-management/scripts/validate-skill.mjs --help
```

#### テンプレート参照

```bash
# 権限設定テンプレート確認
cat .claude/skills/tool-permission-management/assets/permission-template.yaml
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づいて完全更新：Anchors/Trigger追加、Phase構造改善、Task仕様ナビ追加、ベストプラクティス詳細化、リソース参照構造化 |

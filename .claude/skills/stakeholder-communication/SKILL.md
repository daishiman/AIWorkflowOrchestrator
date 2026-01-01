---
name: stakeholder-communication
description: |
  ステークホルダーコミュニケーション管理、進捗報告、期待値調整の体系的コミュニケーション手法。
  利害関係者との信頼構築と透明性のあるコミュニケーション戦略を提供します。

  Anchors:
  • 『PMBOK Guide』（PMI）/ 適用: コミュニケーション管理 / 目的: 利害関係者の調整と期待値管理

  Trigger:
  ステークホルダー対応時、進捗報告時、期待値調整時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# ステークホルダーコミュニケーションスキル

## 概要

ステークホルダー管理、進捗報告、期待値調整の体系的コミュニケーション手法。利害関係者との信頼構築、期待値の適切な管理、継続的で透明性のあるコミュニケーション戦略を提供します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認してステークホルダーコミュニケーションの基本原則を理解
2. 関係するステークホルダーの種類と期待値を特定
3. コミュニケーションの目的（報告、合意、調整など）を明確化
4. 必要なリソース、テンプレート、スクリプトを特定

### Phase 2: スキル適用と実行

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. `references/Level2_intermediate.md` と `references/Level3_advanced.md` を参照し、実務的なコミュニケーション方針を策定
2. `assets/sprint-review-agenda.md` などテンプレートを活用して資料・アジェンダを準備
3. `scripts/generate-status-report.sh` を実行して進捗報告資料を自動生成
4. ステークホルダー別の伝達方法、頻度、フォーマットを設定
5. 期待値調整のための対話プランを作成
6. 重要な判断点をメモとして記録

### Phase 3: 検証と継続改善

**目的**: 成果物の検証、実行記録の保存、フィードバック反映

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. コミュニケーション成果物が目的に合致するか検証
3. `scripts/log_usage.mjs` を実行して使用記録を保存
4. `references/Level4_expert.md` を参照して継続改善のポイントを確認
5. ステークホルダーからのフィードバックを反映して次回施策に活かす

## Task仕様ナビ

| Task                   | 概要                                       | 対応Level | リソース                                       | スクリプト                  |
| ---------------------- | ------------------------------------------ | --------- | ---------------------------------------------- | --------------------------- |
| ステークホルダー分析   | ステークホルダーの特定、分類、期待値の把握 | Level 1-2 | `Level1_basics.md`, `Level2_intermediate.md`   | -                           |
| コミュニケーション計画 | 目的別の伝達戦略、頻度、メディアの決定     | Level 2-3 | `Level2_intermediate.md`, `Level3_advanced.md` | -                           |
| 進捗報告資料作成       | 定期的な進捗報告資料の生成と配信           | Level 1-2 | `Level2_intermediate.md`                       | `generate-status-report.sh` |
| 期待値調整対話         | 期待値ギャップの解消と合意形成             | Level 3-4 | `Level3_advanced.md`, `Level4_expert.md`       | -                           |
| Sprint Review実施      | スプリント完了後の関係者向けレビュー       | Level 2-3 | `Level2_intermediate.md`                       | -                           |
| フィードバック収集     | ステークホルダーからの意見・要望の収集     | Level 2-3 | `Level2_intermediate.md`, `Level3_advanced.md` | -                           |
| 信頼関係構築           | 継続的なエンゲージメントと信頼醸成         | Level 3-4 | `Level3_advanced.md`, `Level4_expert.md`       | -                           |

## ベストプラクティス

### すべきこと

- `references/Level1_basics.md` を参照し、ステークホルダーコミュニケーションの基本原則を理解した上で適用する
- `references/Level2_intermediate.md` を参照し、実務的な手順を整理してから実行に移す
- ステークホルダーの属性・期待値に応じた多様なコミュニケーション手段を用意する
- 定期的（最低でも月単位）で進捗報告を実施し、透明性を維持する
- 期待値のズレを早期に検出し、調整の対話を実施する
- `assets/sprint-review-agenda.md` などテンプレートを活用して、一貫性のある資料を作成する
- ステークホルダーのフィードバックを記録し、次の施策に反映させる
- `references/Level4_expert.md` を参照して、より洗練されたコミュニケーション手法を継続的に学習する

### 避けるべきこと

- ステークホルダー分析なしに進捗報告を開始することを避ける
- 一方的な情報発信のみで対話を欠かすことを避ける
- コミュニケーション頻度が不規則になり、信頼を損なうことを避ける
- 不都合な情報を隠蔽または後回しにすることを避ける（透明性の喪失）
- テンプレートなしのアドホックな資料作成で一貫性を欠くことを避ける
- ステークホルダーからのフィードバックを無視して改善を怠ることを避ける
- `references/Level3_advanced.md` および `Level4_expert.md` で提示されるアンチパターンを実施することを避ける

## リソース参照

### Levelガイド

```bash
# 基礎ガイド
cat .claude/skills/stakeholder-communication/references/Level1_basics.md

# 実務ガイド
cat .claude/skills/stakeholder-communication/references/Level2_intermediate.md

# 応用ガイド
cat .claude/skills/stakeholder-communication/references/Level3_advanced.md

# 専門ガイド
cat .claude/skills/stakeholder-communication/references/Level4_expert.md
```

### スクリプト実行

```bash
# 進捗報告資料の自動生成
.claude/skills/stakeholder-communication/scripts/generate-status-report.sh

# スキル使用記録の保存と評価
node .claude/skills/stakeholder-communication/scripts/log_usage.mjs --help

# スキル構造の検証
node .claude/skills/stakeholder-communication/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
# Sprint Review Agenda
cat .claude/skills/stakeholder-communication/assets/sprint-review-agenda.md
```

## 変更履歴

| Version | Date       | Changes                                                                                                                          |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠。YAML frontmatter更新、Task仕様ナビ追加、Trigger/Anchors定義、リソースパス統一（references/ and assets/） |

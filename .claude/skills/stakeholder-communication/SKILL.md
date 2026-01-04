---
name: stakeholder-communication
description: |
  ステークホルダーとのコミュニケーション計画、進捗報告、期待値調整、合意形成を支援するスキル。
  関係者の期待値と影響度を整理し、透明性の高い報告と合意形成を促進する。

  Anchors:
  • PMBOK Guide / 適用: コミュニケーション管理 / 目的: 期待値調整と報告体系化
  • Stakeholder Theory (R. Edward Freeman) / 適用: 関係者分析 / 目的: 影響度と期待値の整理
  • Nonviolent Communication (Marshall Rosenberg) / 適用: 対話設計 / 目的: 建設的な合意形成

  Trigger:
  Use when planning stakeholder communication, preparing status updates, managing expectations, facilitating alignment, or resolving conflicts.
  stakeholder, communication plan, status report, expectation management, alignment, conflict resolution
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# ステークホルダーコミュニケーション

## 概要

利害関係者の期待値を整理し、進捗報告と合意形成を一貫した形式で実行するスキル。
透明性の高いコミュニケーションで信頼関係を構築し、プロジェクトの成功を支援する。

## ワークフロー

```
map-stakeholders → plan-communication → execute-reporting → adjust-expectations → document-agreements
```

### Phase 1: ステークホルダー整理

**目的**: 関係者の役割・期待値・影響度を明確化する

**アクション**:

1. 関係者の役割と期待値を整理する
2. 影響度と関心度を分類する
3. コミュニケーション優先度を決定する

**Task**: `agents/sc-001-stakeholder-map.md` を参照

### Phase 2: コミュニケーション計画

**目的**: 目的別の伝達計画と合意形成の順序を設計する

**アクション**:

1. チャネルと頻度を決定する
2. 報告内容と形式を設計する
3. 合意形成の順序を整理する

**Task**: `agents/sc-002-communication-plan.md` を参照

### Phase 3: 進捗報告と期待値調整

**目的**: 進捗とリスクを可視化し、期待値ギャップを調整する

**アクション**:

1. `scripts/generate-status-report.sh` で報告資料を作成する
2. リスクと次アクションを明文化する
3. 期待値ギャップがあれば調整を行う

**Task**: `agents/sc-003-status-report.md` を参照

## Task仕様ナビ

| Task                      | 起動タイミング | 入力                         | 出力                     |
| ------------------------- | -------------- | ---------------------------- | ------------------------ |
| sc-001-stakeholder-map    | Phase 1開始時  | プロジェクト概要、関係者候補 | ステークホルダー整理表   |
| sc-002-communication-plan | Phase 2開始時  | ステークホルダー整理表       | コミュニケーション計画表 |
| sc-003-status-report      | Phase 3開始時  | 進捗情報、リスク情報         | 進捗報告資料             |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                           | 理由                         |
| ---------------------------------- | ---------------------------- |
| 期待値を定量化して記録する         | 認識ズレを早期に検出できる   |
| 影響度と関心度で優先順位を付ける   | 重要な関係者の合意を先に確保 |
| 進捗とリスクを同時に報告する       | 透明性と信頼性を維持         |
| 合意事項と次アクションを明文化する | 後続の実行がぶれにくくなる   |
| 定期的なフィードバック収集         | 認識ズレの早期発見           |

### 避けるべきこと

| 禁止事項             | 問題点                       |
| -------------------- | ---------------------------- |
| 情報の遅延共有       | 信頼低下と炎上リスク         |
| 目的のない報告の乱発 | 読み手の疲労と重要情報の埋没 |
| リスクの先送り       | 認識ズレが拡大               |
| 合意事項の未記録     | 認識不一致の再発             |
| 一方的な情報発信     | フィードバック機会の喪失     |

## リソース参照

### references/（詳細知識）

| リソース | パス                                                                   | 読込条件             |
| -------- | ---------------------------------------------------------------------- | -------------------- |
| 基礎指針 | [references/Level1_basics.md](references/Level1_basics.md)             | 期待値整理を始める時 |
| 実務指針 | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 計画策定時           |
| 応用指針 | [references/Level3_advanced.md](references/Level3_advanced.md)         | 合意形成の調整時     |
| 専門指針 | [references/Level4_expert.md](references/Level4_expert.md)             | 高難度ケース対応時   |

### scripts/（決定論的処理）

| スクリプト                  | 機能                     | 使用例                                          |
| --------------------------- | ------------------------ | ----------------------------------------------- |
| `generate-status-report.sh` | 進捗報告テンプレート生成 | `./scripts/generate-status-report.sh <project>` |
| `log_usage.mjs`             | 使用記録の保存           | `node scripts/log_usage.mjs --result success`   |
| `validate-skill.mjs`        | スキル構造検証           | `node scripts/validate-skill.mjs`               |

### assets/（テンプレート）

| アセット                  | 用途                     |
| ------------------------- | ------------------------ |
| `sprint-review-agenda.md` | レビュー議事テンプレート |

## 変更履歴

| Version | Date       | Changes                              |
| ------- | ---------- | ------------------------------------ |
| 2.0.0   | 2026-01-03 | 18-skills.md仕様に完全準拠、構造整理 |
| 1.0.0   | 2025-12-28 | 初版作成                             |

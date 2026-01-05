---
name: incident-response
description: |
  システム障害・インシデントの検知から解決、事後分析までを体系的に支援。ITIL・SRE原則に基づき、迅速な復旧と再発防止を実現。

  Anchors:
  • The Site Reliability Workbook (Google) / 適用: ポストモーテム文化 / 目的: 非難なき事後分析と学習
  • ITIL 4 / 適用: インシデント・問題管理 / 目的: 構造化されたエスカレーション
  • The Phoenix Project (Kim, Behr) / 適用: 変更管理 / 目的: 変更起因インシデントの予防

  Trigger:
  Use when responding to system outages, handling alerts, writing incident reports, conducting postmortems, or analyzing root causes.
  incident, outage, postmortem, RCA, 5 whys, rollback, escalation, severity, on-call
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Incident Response

## 概要

システム障害やインシデントに対し、ITIL 4とGoogle SREのベストプラクティスに基づいた体系的な対応を提供。
検知・トリアージから調査・解決、事後分析・改善まで4フェーズで構成。

## ワークフロー

### Phase 1: 検知とトリアージ

**目的**: インシデントを検知し、重大度と影響範囲を判定

**アクション**:

1. アラートまたは報告からインシデント発生を確認
2. `references/severity-matrix.md` で重大度を判定
3. エスカレーション要否を判断
4. `assets/postmortem-template.md` でチケット作成

**Task**: `agents/triage.md` を参照

### Phase 2: 調査と診断

**目的**: 根本原因を特定し、解決戦略を立案

**アクション**:

1. 診断情報収集（ログ、メトリクス、トレース）
2. 5 Whys分析で根本原因を特定
3. 解決候補と切り戻し戦略を準備

**Task**: `agents/investigate.md` を参照

### Phase 3: 解決と復旧

**目的**: サービスを安全に復旧

**アクション**:

1. 解決アクション実行（修正適用 or 切り戻し）
2. サービス復旧確認（メトリクス正常化）
3. インシデントクローズとステークホルダー通知

**Task**: `agents/resolve.md` を参照

### Phase 4: 事後分析

**目的**: ポストモーテムを実施し再発防止策を策定

**アクション**:

1. `assets/postmortem-template.md` でレポート作成
2. タイムラインと5 Whys分析を文書化
3. アクションアイテムを抽出
4. `scripts/log_usage.mjs` で記録

**Task**: `agents/postmortem.md` を参照

## Task仕様ナビ

| Task        | 起動タイミング | 入力               | 出力                   |
| ----------- | -------------- | ------------------ | ---------------------- |
| triage      | Phase 1開始時  | アラート情報       | 重大度判定・チケット   |
| investigate | Phase 2開始時  | チケット           | 根本原因分析           |
| resolve     | Phase 3開始時  | 解決戦略           | 復旧確認               |
| postmortem  | Phase 4開始時  | インシデント全履歴 | ポストモーテムレポート |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- Critical/Majorは5分以内に初動開始
- 非難なき文化でポストモーテム実施
- 5 Whysで根本原因を深掘り
- すべてのアクションをタイムライン記録
- 修正前に切り戻し手順を確認
- 30分毎にステークホルダーへ状況報告

### 避けるべきこと

- ログ・メトリクスなしに原因を断定
- 切り戻しできない修正を重ねる
- 小規模インシデントでもポストモーテム省略
- 個人への非難
- メトリクス確認なしに復旧宣言

## リソース参照

### references/（詳細知識）

| リソース   | パス                                                               | 内容                 |
| ---------- | ------------------------------------------------------------------ | -------------------- |
| 基礎知識   | See [references/basics.md](references/basics.md)                   | 基本概念と初動対応   |
| 重大度判定 | See [references/severity-matrix.md](references/severity-matrix.md) | 重大度判定マトリクス |

### scripts/（決定論的処理）

| スクリプト      | 用途               | 使用例                                                       |
| --------------- | ------------------ | ------------------------------------------------------------ |
| `log_usage.mjs` | フィードバック記録 | `node scripts/log_usage.mjs --result success --phase Phase3` |

### assets/（テンプレート）

| テンプレート             | 用途                   |
| ------------------------ | ---------------------- |
| `postmortem-template.md` | ポストモーテムレポート |

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 2.0.0   | 2026-01-02 | 18-skills.md完全準拠、リソース追加 |
| 1.0.0   | 2025-12-31 | 初版                               |

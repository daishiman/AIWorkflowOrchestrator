# [#2336] TASK-SPEC-CREATOR-CONFIG-ONLY-IMPROVE-001: task-specification-creatorスキル config-onlyタスク対応改善

## メタ情報

```yaml
issue_number: 2336
title: TASK-SPEC-CREATOR-CONFIG-ONLY-IMPROVE-001: task-specification-creatorスキル config-onlyタスク対応改善
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2336
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

FB-01（config-onlyタスク向けテンプレート不在）とFB-02（Phase 12 Step 2 N/A判定曖昧性）の統合対応。

- **FB-01**: `.gitattributes` 変更のような「宣言的設定ファイルのみ」タスクでは、テンプレートが「コード実装」前提のためPhase 3〜7の読み替えコストが高い
- **FB-02**: 新規インターフェース追加がない場合のN/A判定根拠書式が曖昧。API/型/定数/環境変数/DB/ファイルフォーマット/CLIの7観点チェックリストが未整備

## 解決策

`task-specification-creator` SKILL.md に config-only 向け Phase 読み替えルールと 7観点N/Aチェックリスト雛形を追記する。

## 優先度・規模

- **優先度**: 中（MEDIUM）
- **規模**: 小規模（実装1d / テスト0.5d）
- **分類**: ドキュメント改善 / スキル強化

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SPEC-CREATOR-CONFIG-ONLY-IMPROVE-001.md`

## 発見元

TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 Phase 12 skill-feedback-report.md（FB-01, FB-02）

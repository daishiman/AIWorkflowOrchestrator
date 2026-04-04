# [#1768] [UT-P0-05-STRUCTURED-LOGGING-001] skill-creator の console.warn → Logger 構造化ロギング移行

## メタ情報

```yaml
issue_number: 1768
title: [UT-P0-05-STRUCTURED-LOGGING-001] skill-creator の console.warn → Logger 構造化ロギング移行
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1768
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 背景

TASK-P0-05 の実装で persist 失敗時に `console.warn` を一時採用した（MR-01 として記録済み）。
これはプロジェクト全体の構造化ロギング方針（Logger サービス使用）と乖離しており、本番環境でのデバッグが困難になる技術的負債。

## 目標

- `SkillFileWriter` 内の `console.*` を Logger に置き換える
- `SkillCreatorWorkflowEngine` 内の `console.*` を Logger に置き換える
- Logger DI はプロジェクト慣習に従い、テストでモック可能に設計する

## 受入基準

- `SkillFileWriter` / `SkillCreatorWorkflowEngine` に `console.*` が残存しない
- Logger 呼び出しにログレベルが適切に設定されている（warn/info/error）
- 既存ユニットテストが引き続き pass する

## 苦戦箇所メモ

- DI パターンはプロジェクト内に複数混在 → `SkillService` 等の既存実装を参照
- テストでは `vi.mock` で Logger をスタブし、warn/info をスパイすること

## 参照

- 起票元: `docs/30-workflows/completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration/outputs/phase-12/unassigned-task-detection.md` (UT-02 / MR-01)
- タスクファイル: `docs/30-workflows/unassigned-task/task-ut-p0-05-structured-logging-skill-creator-001.md`

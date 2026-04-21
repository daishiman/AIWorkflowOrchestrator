# [#2328] [UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001] validator=0 件事実と暫定運用を正本へ追記

## メタ情報

```yaml
issue_number: 2328
title: [UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001] validator=0 件事実と暫定運用を正本へ追記
state: OPEN
priority: 中
scale: 小規模
category: 要件
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2328
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

EVALS.json には validator が存在しないこと、silent break リスクがあること、補完タスクへの導線を正本へ追記する。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 9 / 12
- 判定根拠: [implementation-guide.md §3.1 / §11 / §12](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md)

## 仕様書

`docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`

## 依存

- 関連: UNASSIGNED-EVALS-VALIDATOR-GUARD-001（実装タスクへの導線を張る対象）

## 主な苦戦箇所

- validate-schemas.js は schemas/\*.json のみ対象、EVALS.json 未対象
- SkillScanner.ts も存在 + size + type のみで中身未検証
- TypeScript 型定義不在（型ガード無効）
- 暫定運用として schema-change-guide §7 の 3 カテゴリ手動検証コマンドを明記

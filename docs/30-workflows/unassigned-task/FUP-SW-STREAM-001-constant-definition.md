# 未タスク: FUP-02 / progress の phase/percentage/message を定数化

## タスク概要

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | FUP-SW-STREAM-001-constant-definition |
| 優先度     | Low                                   |
| 関連タスク | TASK-SW-STREAM-001                    |
| 検出日     | 2026-04-16                            |
| 検出Phase  | Phase 12（unassigned-task-detection） |

## 概要

`SkillCreatorService.ts` 内に散在する progress の `phase` 文字列・`percentage` 数値・
`message` 文字列を `PROGRESS_PHASES` オブジェクト等で定数化する。

## 理由

- 現状は magic string / magic number が散在しており、メンテナンス性が低い。
- テストの期待値も定数から参照できるようにすることで、変更時の修正箇所を一元化できる。

## 対象ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`

## 実施例

```typescript
const PROGRESS_PHASES = {
  planning: { phase: "planning", percentage: 10, message: "計画中..." },
  generatingSkill: {
    phase: "generating-skill",
    percentage: 40,
    message: "SKILL.mdを作成中...",
  },
  generatingAgents: {
    phase: "generating-agents",
    percentage: 70,
    message: "エージェント仕様を作成中...",
  },
  validating: { phase: "validating", percentage: 90, message: "検証中..." },
  done: { phase: "done", percentage: 100, message: "完了" },
} as const;
```

## 実施タイミング

`TASK-SW-STREAM-001` 完了後、独立して着手可能。
IPC 接続（TASK-SW-STREAM-002）と同波でも可。

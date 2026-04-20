# Phase 5: 実装

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

`SkillCreatorService.ts` の 2 つの private workflow 入口だけを修正し、Abort 契約を統一する。

## 実行タスク

1. `runOrchestrateWorkflow()` の入口へ `throwIfAborted(signal)` を追加する
2. `runCreateWorkflow()` の入口へ `throwIfAborted(signal)` を追加する
3. 将来 LLM 統合に関わる投機的変更は入れない

## 参照資料

| 資料     | パス                                                          | 用途     |
| -------- | ------------------------------------------------------------- | -------- |
| 実装本体 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 修正対象 |
| Phase 4  | `phase-4-test-creation.md`                                    | Red 対応 |

## 実行手順

### Step 1: 変更一覧

| 操作 | ファイル                                                                            |
| ---- | ----------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                       |
| 確認 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`        |
| 確認 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` |

### Step 2: 非対象

- `createSkill()` 外側の abort-like error 再スロー方針は維持する
- `runCreateWorkflow()` の catch を将来 LLM 統合前提で広げない
- UI / IPC / hook 層は変更しない

## 統合テスト連携

- Phase 6 はこの実装差分に対する failure mode のみ追加する
- Phase 9 は typecheck と targeted test をこの変更面で確認する

## 成果物

- `outputs/phase-5/implementation-log.md`
- `outputs/phase-5/changed-files-summary.md`
- `outputs/phase-5/consumer-audit-decision.md`

## 完了条件

- [ ] 修正対象が `SkillCreatorService.ts` に限定されている
- [ ] 投機的 catch 再設計を入れていない
- [ ] targeted test で Green を確認する方針になっている

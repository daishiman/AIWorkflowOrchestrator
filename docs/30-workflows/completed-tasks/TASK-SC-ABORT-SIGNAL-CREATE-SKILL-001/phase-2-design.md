# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

小粒修正を前提に、SubAgent 監査レーン、最小コード変更、テスト再利用方針を設計する。

## 実行タスク

1. Lane A/B/C の並列監査分担を固定する
2. `SkillCreatorService.ts` の最小変更点を明示する
3. 既存テスト再利用と追加テストの境界を決める

## 参照資料

| 資料                    | パス                                                          | 用途           |
| ----------------------- | ------------------------------------------------------------- | -------------- |
| task-spec skill         | `.claude/skills/task-specification-creator/SKILL.md`          | phase 骨格     |
| aiworkflow requirements | `.claude/skills/aiworkflow-requirements/SKILL.md`             | close-out 方針 |
| 実装本体                | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 変更面積確認   |

## 実行手順

### Step 1: SubAgent lane plan

| Lane | 担当              | 目的                                                | 並列可否 |
| ---- | ----------------- | --------------------------------------------------- | -------- |
| A    | task-spec 監査    | 13 phase / artifact / canonical 名監査              | 並列     |
| B    | requirements 監査 | current facts / lessons learned / Phase 12 同期監査 | 並列     |
| C    | 実装監査          | 実コード整合、過剰要件除去、最小修正案作成          | 並列     |

### Step 2: 最小コード変更

| 対象                       | Before                                 | After                                                  |
| -------------------------- | -------------------------------------- | ------------------------------------------------------ |
| `runOrchestrateWorkflow()` | `_signal?: AbortSignal` を受け取るだけ | `signal?: AbortSignal` + 入口 `throwIfAborted(signal)` |
| `runCreateWorkflow()`      | `_signal?: AbortSignal` を受け取るだけ | `signal?: AbortSignal` + 入口 `throwIfAborted(signal)` |

### Step 3: テスト設計方針

| 方針            | 内容                                                       |
| --------------- | ---------------------------------------------------------- |
| public first    | `createSkill()` を通るキャンセル契約を主証跡にする         |
| private minimal | private workflow の direct test は入口確認に限定する       |
| vitest only     | `jest.spyOn` は禁止し `vi.spyOn` または public flow を使う |

## 統合テスト連携

- Phase 3 は Lane A/B/C の結果が揃うまで Gate を閉じる
- Phase 4 は Phase 2 の lane plan をそのままテスト設計へ引き継ぐ

## 成果物

- `outputs/phase-2/abort-path-map.md`
- `outputs/phase-2/subagent-lane-plan.md`
- `outputs/phase-2/test-and-validation-plan.md`

## 完了条件

- [ ] 並列監査 lane が固定されている
- [ ] 最小コード変更が 2 箇所に限定されている
- [ ] 既存テスト再利用方針が明文化されている

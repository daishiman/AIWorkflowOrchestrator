# Phase 8: リファクタリング - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 8 - リファクタリング                        |
| 前提Phase | Phase 7（テストカバレッジ確認）             |
| 関連Issue | #1434                                       |

## 目的

runtime public IPC wiring を、既存 `skillCreatorAPI` 契約を崩さずに読みやすく保守しやすい形へ整える。

## 実行タスク

- legacy `runtime-*` 命名の残存を消す
- shared contract と inline 型の役割分担を整理する
- comment / log / file header の誤説明を修正する
- 過剰な helper 抽出を避け、既存 API 契約を優先する

## 参照資料

| 資料名                   | パス                                                                                            | 説明                  |
| ------------------------ | ----------------------------------------------------------------------------------------------- | --------------------- |
| Phase 2 設計             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`                         | 命名・境界            |
| Phase 5 実装             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md`                 | 現行構成              |
| Phase 1 要件定義サマリー | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-1/requirements-definition.md` | 受入条件要約          |
| Phase 1 現状棚卸し       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-1/current-state-inventory.md` | 着手時 drift          |
| Phase 6 handler tests    | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                                   | edge case coverage    |
| Phase 6 facade tests     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`            | fallback / handoff    |
| Phase 6 preload tests    | `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`                          | renderer wiring       |
| Phase 7 coverage report  | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-7/coverage-report.md`         | coverage 結果         |
| Phase 7 integration note | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-7/integration-test.md`        | 実行メモ              |
| Shared types             | `packages/shared/src/types/skillCreator.ts`                                                     | request/response 契約 |
| Main handler             | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                  | helper 境界           |
| Preload API              | `apps/desktop/src/preload/skill-creator-api.ts`                                                 | public method 名      |

## 実行手順

### Step 1: 命名の残存を確認する

```bash
rg -n "runtime-plan|runtime-exec|runtime-improve|SKILL_CREATOR_RUNTIME|improveSkillRuntime" \
  docs/30-workflows/runtime-skill-creator-ipc-wiring \
  apps/desktop/src \
  packages/shared/src
```

期待結果: 0 件

### Step 2: 契約境界を確認する

判断基準:

- public channel / preload method / shared type は同一命名に揃える
- `error?: string` は既存 `skillCreatorAPI` 契約に合わせて維持する
- sender validation / sanitize は helper 経由を維持し、別抽象化を増やさない

### Step 3: コメントとテスト説明を整える

対象:

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- workflow docs Phase 4-9
- aiworkflow-requirements の該当仕様書

## 統合テスト連携

- `pnpm --filter @repo/desktop typecheck`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/runtime-skill-creator-ipc-wiring`

## 成果物

| 成果物              | パス                                                                         | 説明             |
| ------------------- | ---------------------------------------------------------------------------- | ---------------- |
| refactored docs     | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-08-refactoring.md` | cleanup 方針     |
| refactored comments | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                          | surface 説明補正 |

## 完了条件

- [ ] legacy runtime 命名の残存がない
- [ ] `error?: string` 契約を壊していない
- [ ] comment / workflow / spec の説明が current code と一致する
- [ ] **本Phase内の全タスクを100%実行完了**

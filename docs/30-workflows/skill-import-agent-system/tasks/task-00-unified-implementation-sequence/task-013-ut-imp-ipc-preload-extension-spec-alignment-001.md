# task-013-ut-imp-ipc-preload-extension-spec-alignment-001

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 |
| ステータス | 完了                                            |
| 完了日     | 2026-02-25                                      |
| タスク種別 | 仕様書修正のみ（spec_created）                  |
| 親タスク   | UT-SKILL-IPC-PRELOAD-EXTENSION-001              |

## 実施概要

task-9D〜9J 仕様書に残っていた参照差分・artifacts差分を統合是正し、後続実装時の IPC/Preload 契約ドリフトを防止した。

## 実施内容

1. `task-022-task-9f-skill-share.md`, `task-023a`〜`task-023f` の `artifacts.modifies` を以下へ統一。
   - `apps/desktop/src/preload/channels.ts`
   - `apps/desktop/src/preload/skill-api.ts`
   - `apps/desktop/src/preload/types.ts`
   - `packages/shared/src/types/skill/index.ts`
2. 各taskの `artifacts.creates` に `packages/shared/src/types/skill/<domain>.ts` を追加。
3. 本文参照の旧パスを是正。
   - `apps/desktop/src/preload/skillAPI.ts` → `apps/desktop/src/preload/skill-api.ts`
   - `apps/desktop/src/main/ipc/channels.ts` → `apps/desktop/src/preload/channels.ts`
   - `packages/shared/src/types/skillXxx.ts` → `packages/shared/src/types/skill/*.ts`
4. `task-023c-task-9i-skill-docs.md` の `GeneratedDoc.generatedAt` を `Date` から ISO 8601 `string` に更新し、IPCシリアライズ方針を追記。
5. `task-003-execution-plan.md` の Preload API 参照を `skill-api.ts` に統一。

## 変更ファイル

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-003-execution-plan.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`

## 苦戦箇所

| #   | 苦戦箇所                                             | 原因                             | 対策                                       |
| --- | ---------------------------------------------------- | -------------------------------- | ------------------------------------------ |
| 1   | 旧パス混在（`skillAPI.ts` / `main/ipc/channels.ts`） | 正本移行前後の記述が混在         | 監査条件を固定して旧パスを0件化            |
| 2   | artifacts 欠落のばらつき                             | taskごとの記述方針が揃っていない | 共通必須4項目 + task別domain型でテンプレ化 |
| 3   | Date型方針の局所ドリフト                             | task-9I のみ旧方針が残存         | ISO 8601 string へ統一 + 方針追記          |

## 検証

- 旧参照パス（`skillAPI.ts` / `main/ipc/channels.ts` / `skillXxx.ts`）の残存: 0件
- task-9D〜9J の必須 `modifies` 記載: 7/7 ファイルで確認
- task-9D〜9J の domain 型 `creates` 記載: 7/7 ファイルで確認

## 備考

- 実装コード変更は行っていない。
- 本タスク完了により、UT-SKILL-IPC-PRELOAD-EXTENSION-001 由来の Open Item（仕様差分）はクローズ。

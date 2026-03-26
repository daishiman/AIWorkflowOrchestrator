# Phase 5: 実装

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-SDK-01  |
| Phase      | 5            |
| Phase名    | 実装         |
| ステータス | spec_created |
| 前提Phase  | Phase 4      |
| 後続Phase  | Phase 6      |
| 作成日     | 2026-03-26   |

## 目的

manifest schema、loader、sample manifest を追加し、Task02 が engine 設計へ進める最小 contract をコードへ置く。

## 実行タスク

- manifest schema 実装: `workflow-manifest.json` の構造を表す型または schema を追加する
- loader 実装: read、validate、normalize、cache を行う `ManifestLoader` を追加する
- sample manifest 追加: Task02、Task03、Task04 が参照できる最小サンプルを追加する
- wiring 計画整理: `RuntimeSkillCreatorFacade` と `SkillCreatorService` へ loader を差し込む順序を決める

## 参照資料

| 資料名                    | パス                                                                  | 説明                           |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Phase 1                   | `phase-1-requirements.md`                                             | scope 条件                     |
| Phase 2                   | `phase-2-design.md`                                                   | schema / loader 設計           |
| Phase 4                   | `phase-4-test-creation.md`                                            | red case                       |
| test-matrix               | `outputs/phase-4/test-matrix.md`                                      | 実装受入条件                   |
| schema-fixture-plan       | `outputs/phase-4/schema-fixture-plan.md`                              | sample manifest 条件           |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | integration target             |
| SkillCreatorService       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`         | legacy flow integration target |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------- |
| api-ipc-system-core                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | public IPC を壊さない前提 |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade 既存責務           |
| architecture-overview-core           | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | Facade / Bridge / SRP     |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | same-wave sync 準備       |

## 実行手順

1. schema を先に置き、test-matrix の positive / negative case を通す形にする。
2. `ManifestLoader` を `read -> validate -> normalize -> cache` の順で実装する。
3. sample manifest を追加し、Task02、Task03、Task04 の handoff 項目が載ることを確認する。
4. runtime facade と legacy service へ loader を差し込む順序を `sample -> loader unit -> facade integration` で固定する。

## 統合テスト連携

- Phase 4 の negative case を全て緑にする。
- Phase 6 で backward compatibility と stale cache の境界を補う。
- Phase 9 で manifest が IPC や route authority を持っていないことを再監査する。

## 成果物

| 成果物                  | パス                                         | 説明              |
| ----------------------- | -------------------------------------------- | ----------------- |
| file-change-plan        | `outputs/phase-5/file-change-plan.md`        | 変更ファイル一覧  |
| implementation-sequence | `outputs/phase-5/implementation-sequence.md` | 実装順序          |
| manifest-sample         | `outputs/phase-5/manifest-sample.json`       | 最小サンプル      |
| spec-update-plan        | `outputs/phase-5/spec-update-plan.md`        | Phase 12 更新計画 |

## 完了条件

- [ ] schema 実装対象が定義されている
- [ ] `ManifestLoader` の責務が `read / validate / normalize / cache` で固定されている
- [ ] sample manifest に phase、resource、entry、exit の4要素が載っている
- [ ] facade と legacy service への wiring 順序が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-SDK-01                  |
| Phase      | 1                            |
| Phase名    | 要件定義                     |
| ステータス | spec_created                 |
| 前提Phase  | root workflow pack Phase 1-3 |
| 後続Phase  | Phase 2                      |
| 作成日     | 2026-03-26                   |

## 目的

manifest が吸収する変更と、manifest に入れてはいけない authority を固定する。Phase 2 が schema 設計へ直行できるよう、scope、non-scope、現行コード anchor、受入基準を一枚で揃える。

## 実行タスク

- manifest scope matrix 作成: `phase / resource / entry-exit` に含める要素を列挙する
- non-scope register 作成: runtime policy、IPC、session、verify、UI を manifest 非責務として固定する
- current code anchor map 作成: `SkillCreatorService`、`RuntimeSkillCreatorFacade`、IPC、shared types の現状責務を記録する
- acceptance criteria 固定: AC-1 から AC-4 の検証方法を Phase 2 以降へ接続する

## 参照資料

| 資料名                     | パス                                                                                        | 説明                          |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| lane 要件草案              | `docs/30-workflows/skill-creator-agent-sdk-lane/requirements-draft.md`                      | manifest の目的と初回スコープ |
| root Phase 1               | `docs/30-workflows/skill-creator-agent-sdk-lane/root-workflow-pack/phase-1-requirements.md` | parent gate                   |
| create-workflow            | `.claude/skills/task-specification-creator/references/create-workflow.md`                   | task spec 構造基準            |
| RuntimeSkillCreatorFacade  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       | runtime authority anchor      |
| SkillCreatorService        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                               | legacy static flow anchor     |
| creatorHandlers            | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                              | public IPC bridge anchor      |
| preload skill creator API  | `apps/desktop/src/preload/skill-creator-api.ts`                                             | Renderer surface anchor       |
| shared skill creator types | `packages/shared/src/types/skillCreator.ts`                                                 | request / response anchor     |

### システム仕様（aiworkflow-requirements）

| 参照資料                                                 | パス                                                                                                            | 内容                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| resource-map                                             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                | 読書セット選定                   |
| api-ipc-system-core                                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | runtime public IPC 契約          |
| arch-electron-services-details-part2                     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | facade の terminal handoff 境界  |
| arch-execution-capability-contract                       | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`                       | route authority の配置           |
| security-electron-ipc                                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                    | preload / main security boundary |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | IPC drift 再発防止               |

## 実行手順

1. `requirements-draft.md` と root Phase 1 を読み、manifest に許される責務を抜き出す。
2. `RuntimeSkillCreatorFacade.ts`、`SkillCreatorService.ts`、`creatorHandlers.ts`、`skill-creator-api.ts`、`skillCreator.ts` を読み、現状の authority owner を整理する。
3. `manifest に入れる / 入れない` を表に分け、AC-1 から AC-4 の検証方法を決める。
4. Task02、Task03、Task04 へ渡す handoff 項目を `phase topology / resource descriptor / entry-exit hook` の3本に分ける。

## 統合テスト連携

- Phase 4 では scope / non-scope の正常系と逸脱系を fixture 化する。
- Phase 7 では AC と test case の traceability を確認する。
- Phase 11 では第三者が current code anchor と manifest 非責務を読み分けられるかを手動確認する。

## 成果物

| 成果物                      | パス                                             | 説明                        |
| --------------------------- | ------------------------------------------------ | --------------------------- |
| manifest-scope-definition   | `outputs/phase-1/manifest-scope-definition.md`   | manifest が保持する項目一覧 |
| manifest-non-scope-register | `outputs/phase-1/manifest-non-scope-register.md` | manifest 非責務一覧         |
| current-code-anchor-map     | `outputs/phase-1/current-code-anchor-map.md`     | 現行コード責務マップ        |
| acceptance-criteria         | `outputs/phase-1/acceptance-criteria.md`         | AC-1 から AC-4 の検証方法   |

## 完了条件

- [ ] manifest scope が `phase / resource / entry-exit` に固定されている
- [ ] runtime policy、IPC、session、verify、UI が non-scope register に記録されている
- [ ] current code anchor が 5 ファイルで整理されている
- [ ] Task02、Task03、Task04 への handoff 項目が3本に分離されている
- [ ] **本Phase内の全タスクを100%実行完了**

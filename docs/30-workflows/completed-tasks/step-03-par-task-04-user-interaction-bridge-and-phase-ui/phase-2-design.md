# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

`phase-driven backend / explanation-oriented UI` を具体化し、workflow snapshot、question request、phase surface、handoff 表示を shared contract として設計する。

## 実行タスク

- interaction bridge I/O を設計する
- phase UI block と renderer/store 境界を設計する
- provenance summary / handoff card / verify summary の配置を設計する
- downstream task へ渡す boundary を設計する

## 参照資料

| 資料名         | パス                                                                       | 説明                                 |
| -------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 要件   | `phase-1-requirements.md`                                                  | owner / question kind / UI host 要件 |
| Phase 1 抽出表 | `outputs/phase-1/spec-extraction-map.md`                                   | spec source と code anchor の対応    |
| Task02 index   | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | workflow engine との整合             |
| Task03 index   | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`    | provenance summary input             |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                                                | 内容                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| routing / render       | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `skillCreate` 既存 route と advanced view |
| state management       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | store と local state の境界               |
| IPC security           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md`                                | invoke / sender validation                |
| preload implementation | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-details.md`                 | preload/channels/handler の更新ポイント   |
| lessons learned        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`     | `skill-creator:*` surface 維持            |

### 現行コードアンカー

| ファイル                                                               | 設計観点                                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | canonical snapshot に question descriptor を持たせるか、adapter を置くかの設計起点 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | plan / execute / verify を跨いだ snapshot 更新と read API の入口                   |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | invoke / event bridge 追加点                                                       |
| `apps/desktop/src/preload/channels.ts`                                 | channel constants と allowlist 追加点                                              |
| `apps/desktop/src/preload/skill-creator-api.ts`                        | renderer 公開 API 追加点                                                           |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 | snapshot cache と local draft 分離                                                 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | phase block host、handoff card host                                                |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | question form reuse と Task05 への handoff boundary                                |

## 実行手順

### ステップ1: interaction bridge を設計する

- shared contract は `SkillCreatorWorkflowUiSnapshot`、`SkillCreatorUserInputRequest`、`SkillCreatorUserInputSubmission` を最小集合とする。
- getter は point-in-time snapshot を返し、event は最新 snapshot を push する。progress event に無理に畳み込まない。
- `submit-user-input` は updated snapshot または domain error を返し、renderer が phase を勝手に進めない。
- `requestId` は stale submit 防止の鍵として持つが、resume / persistence の意味論は Task08 に委譲する。

### ステップ2: renderer/store 境界を設計する

- store は `workflowSnapshot`、`handoffBundle`、`workflowError` を cache してもよいが、answer draft は component local state に留める。
- `SkillLifecyclePanel` は snapshot を読んで phase badge、question host、provenance summary、handoff card を描画する。
- `SkillCreateWizard` は question form UI の再利用先候補だが、どちらを primary entry にするかは Task05 が決める。
- `ViewType` は既存 `skillCreate` を維持し、Task04 単独で新しい global route は増やさない。

### ステップ3: downstream boundary を設計する

- Task05 には create mainline 入口判断に必要な `workflowSnapshot` / `question request` / `handoffBundle` を渡す。
- Task06 には `verifyResult` と `currentPhase=verify|improve` の phase summary を渡すが、detail UX は持ち込まない。
- Task07 には terminal handoff / approval / disclosure へ使う copy slot と warning level を渡す。
- Task08 には `requestId`、`requestedAt`、`resumeTokenEnvelope` を渡すが、永続化形式は定義しない。

## 統合テスト連携

- Phase 4 で getter / submit / event の 3 系統をテスト matrix 化する。
- renderer テストでは phase badge、question form、handoff card、provenance summary の 4 block を確認対象にする。
- store テストでは canonical snapshot の cache と local draft state の分離を確認する。

## 成果物

| 成果物                    | パス                                           | 説明                                  |
| ------------------------- | ---------------------------------------------- | ------------------------------------- |
| 設計書                    | `phase-2-design.md`                            | interaction bridge と phase UI の設計 |
| interaction bridge matrix | `outputs/phase-2/interaction-bridge-matrix.md` | invoke / event / state contract 一覧  |
| phase UI mapping          | `outputs/phase-2/phase-ui-mapping.md`          | phase block と downstream 境界        |

## 完了条件

- [ ] bridge と UI の責務が分離されている
- [ ] store cache と local draft state の境界が定義されている
- [ ] provenance summary 表示と interaction 入力の責務が分離されている
- [ ] downstream への handoff boundary が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

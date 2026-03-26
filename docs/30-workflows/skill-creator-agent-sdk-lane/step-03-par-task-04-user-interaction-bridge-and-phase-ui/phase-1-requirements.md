# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

AI からの質問を UI に安全に橋渡しし、ユーザーが最初に全要件を言語化しなくても段階的に回答できる体験を、runtime owner と衝突しない形で定義する。

## 実行タスク

- workflow state bridge 要件を定義する
- question kind と UI input surface の対応を定義する
- provenance summary / handoff / verify summary の表示境界を定義する
- Task05 / Task06 / Task07 / Task08 への handoff boundary を定義する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点                   | Renderer に質問フォームを置くことではなく、engine owner の state を崩さず user interaction を成立させること                                |
| 依存関係・責務境界の問題点 | Task02 が owner を持つ前提が固まった一方、public bridge と visible UI surface が未定義のため、console-only や local state 乱立が起きやすい |
| 価値とコストの不均衡       | phase UI、mainline 統合、verify detail、approval 文言を同時に抱えると task が過大化する                                                    |
| 改善優先順位               | 1. state bridge 2. question contract 3. phase UI block 4. provenance summary 5. handoff visible 化                                         |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: Task02 と current code に整合 / 運用性: Task05-08 へ素直に handoff 可能                                  |

## 参照資料

| 資料名       | パス                                                                       | 説明                                      |
| ------------ | -------------------------------------------------------------------------- | ----------------------------------------- |
| 要件草案     | `../requirements-draft.md`                                                 | lane 全体の phase owner / user input 背景 |
| 親 workflow  | `../root-workflow-pack/index.md`                                           | predecessor / downstream matrix           |
| Task02 index | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | workflow state owner                      |
| Task03 index | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`    | provenance summary の upstream            |

### システム仕様（aiworkflow-requirements）

| 参照資料                               | パス                                                                                                                | 内容                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| routing / render foundation            | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `ViewType` / `renderView` の current facts            |
| state management reference             | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | store 駆動 UI と local state 境界                     |
| security electron ipc details          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md`                                | public IPC の sender validation                       |
| implementation patterns                | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-details.md`                 | preload 4更新点 / IPC 追加原則                        |
| auth/ipc/skill-creator lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`     | `skill-creator:*` surface 維持と graceful degradation |

### 現行コードアンカー

| ファイル                                                               | 観察点                                                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `currentPhase` / `awaitingUserInput` / `verifyResult` owner が既にある  |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | `plan()` / `execute()` が engine と結合済みで `terminal_handoff` を返す |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | workflow bridge 用 handler が未定義                                     |
| `apps/desktop/src/preload/skill-creator-api.ts`                        | runtime public API に workflow snapshot 系メソッドがない                |
| `apps/desktop/src/preload/channels.ts`                                 | progress 以外の workflow event channel がない                           |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | `executePlan()` handoff が console-only。phase snapshot 表示も未実装    |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 | generation state はあるが workflow snapshot cache はない                |

## 実行手順

### ステップ1: owner と public bridge の要件を固定する

- `currentPhase` / `awaitingUserInput` / `verifyResult` / `resumeTokenEnvelope` の source of truth は Task02 engine とする。
- Renderer は snapshot cache を持っても owner にならず、Main から受けた canonical state を表示するだけに留める。
- public bridge は `skill-creator:get-workflow-state`、`skill-creator:submit-user-input`、`skill-creator:workflow-state-changed` の 3 契約を基本線とする。
- 既存 `planSkill` / `executePlan` / `improveSkillWithFeedback` の response union は維持する。

### ステップ2: interaction contract 要件を固定する

- question kind は `single_select` / `free_text` / `secret` / `confirm` の 4 種を最小セットとする。
- request は `requestId`、`reason`、`title`、`prompt`、`kind`、`options?`、`placeholder?`、`allowSkip?`、`requestedAt` を持つ。
- submit payload は `planId`、`requestId`、answer 本体を持つが、secret 値は renderer log や durable snapshot に平文保持しない。
- cancellation、timeout、未回答は Task04 で input bridge の状態として定義し、resume 意味論の最終化は Task08 へ委譲する。

### ステップ3: UI surface 要件を固定する

- `SkillLifecyclePanel` は phase badge、next action、question host、provenance summary、handoff card を持つ主要 host とする。
- `SkillCreateWizard` は question form の detail capture 再利用先候補だが、primary entry の最終決定は Task05 へ委譲する。
- Task03 provenance は UI で summary 表示するが、renderer で root 再探索や warning 再判定を行わない。
- `TerminalHandoffCard` を execute handoff の再利用第一候補とし、console-only 挙動を受入れない。
- verify / improve detail panel、approval/disclosure copy、session resume 文言は後続 task の責務とする。

## 統合テスト連携

- Phase 4 で bridge invoke / event、renderer phase surface、handoff visible 化の test matrix を作成する。
- Phase 6 で timeout、stale requestId、secret input redaction、listener unsubscribe を edge case として追加する。
- Phase 9 で renderer owner 化、console-only handoff、source provenance 再計算を anti-pattern として監査する。

## 成果物

| 成果物              | パス                                     | 説明                                     |
| ------------------- | ---------------------------------------- | ---------------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | Task04 の要件固定                        |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | spec source / current code anchor 対応表 |

## 完了条件

- [ ] workflow state owner が engine であることが明記されている
- [ ] question kind と UI surface の対応が定義されている
- [ ] provenance summary と handoff visible 化の責務境界が定義されている
- [ ] Task05 / Task06 / Task07 / Task08 への委譲境界が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

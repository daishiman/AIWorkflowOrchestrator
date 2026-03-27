# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 1                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

Skill Creator レーンが `integrated_api` を正規レーン、`terminal_handoff` を補助レーンとして扱い続けるための governance 要件を固定する。approval、disclosure、manual boundary、consumer auth guard を別々の場当たり対応にせず、1 つの bundle として定義する。

## 実行タスク

- route decision と lane priority の要件を定義する
- approval / disclosure / manual boundary の責務境界を定義する
- consumer auth token 非流用と prompt sanitize の要件を定義する
- Task05 / Task06 / Task08 への handoff boundary を定義する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 真の論点                   | handoff を増やすことではなく、どの条件で API 実行をやめ、どの情報を user-operated lane へ渡すかを説明可能にすること          |
| 依存関係・責務境界の問題点 | Task02 で lane response は定義済みだが、Skill Creator surface 側で approval / disclosure / handoff bundle の使い分けが未整理 |
| 価値とコストの不均衡       | governance を Task05/06 の UI detail と一緒に抱えると task が肥大化し、Task08 の前提も揺れる                                 |
| 改善優先順位               | 1. route priority 2. consumer auth guard 3. manual boundary 4. approval/disclosure 接続 5. Task08 への引き継ぎ               |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: shared contract 再利用で高 / 運用性: Task08 へ自然に handoff 可能                          |

## 参照資料

| 資料名       | パス                                                                                      | 説明                                 |
| ------------ | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| 要件草案     | `../requirements-draft.md`                                                                | lane 全体の governance 背景          |
| 親 workflow  | `../root-workflow-pack/index.md`                                                          | Task07 の位置づけ                    |
| Task03 index | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`                   | degrade signal / provenance          |
| Task04 index | `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`                    | visible handoff / interaction bridge |
| Task05 index | `../../completed-tasks/step-04-par-task-05-create-entry-mainline-unification/index.md`    | mainline UI boundary                 |
| Task06 index | `../../completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md` | verify / improve boundary            |
| Task08 index | `../step-06-seq-task-08-session-persistence-and-resume-contract/index.md`                 | downstream resume 契約               |

### システム仕様（aiworkflow-requirements）

| 参照資料                        | パス                                                                                                              | 内容                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| runtime responsibility workflow | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`   | capability / responsibility の canonical entry     |
| terminal handoff canonical      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                                 | `HandoffGuidance` と Manual Boundary               |
| IPC / approval / disclosure     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                        | `approval:*` と `execution:get-disclosure-info`    |
| handoff / consumer mapping      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | `HandoffGuidance` の shared DTO                    |
| lessons learned                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`   | `terminal_handoff` early return と provenance 扱い |

### 現行コードアンカー

| ファイル                                                              | 観察点                                                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`     | `integrated_api` / `terminal_handoff` 判定、consumer token guard、degraded fallback が既に存在 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan / execute / improve で route decision を消費し、handoff 時は early return する            |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`    | `buildForSurface()` が shared `HandoffGuidance` を返す                                         |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts`              | one-time token、TTL 300 秒、single-use を強制する                                              |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | Skill Creator public surface の invoke 境界を持つ                                              |
| `apps/desktop/src/preload/channels.ts`                                | `approval:*` / `execution:get-disclosure-info` は shared channel として存在する                |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | Skill Creator runtime API はあるが approval / disclosure wrapper は未定義                      |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | `executePlan()` handoff は console-only TODO が残る                                            |

## Task08 へ渡す canonical 前提

`route authority は Main owner のまま維持し、Skill Creator は shared `HandoffGuidance`/`approval:\*`/`execution:get-disclosure-info` を再利用する。Renderer は visible handoff と disclosure summary の表示に留まり、manual boundary と consumer auth guard を上書きしない。`

## 実行手順

### ステップ1: lane priority 要件を固定する

- `integrated_api` を primary、`terminal_handoff` を secondary とする。
- degraded、API key 欠落、subscription fallback は `terminal_handoff` へ退避できても、silent fallback で integrated path を装わない。
- consumer auth token（例: `sess-` 系）は API key として受け入れない。

### ステップ2: governance bundle 要件を固定する

- handoff は shared `HandoffGuidance` を唯一 DTO とし、Skill Creator 独自 DTO を追加しない。
- approval は危険操作の許可状態 enforcement、disclosure は AI 利用情報の説明であり、互いに混在させない。
- Manual Boundary MB-1〜MB-4（auto-send / hidden injection / headless execution / credential passthrough 禁止）を維持する。

### ステップ3: downstream boundary を固定する

- Task05 は mainline host を決めても governance owner にはならない。
- Task06 は verify / improve surface に governance slot を受け取るが、route authority を持たない。
- Task08 は route state と handoff/disclosure 前提を引き継ぐが、lane priority 自体は再定義しない。

## 受け入れ基準

1. AC-1: `integrated_api` primary / `terminal_handoff` secondary の優先順位が明記されている
2. AC-2: consumer auth token 非流用が要件として固定されている
3. AC-3: `HandoffGuidance` と Manual Boundary MB-1〜MB-4 が Skill Creator に適用されている
4. AC-4: approval と disclosure が別責務として記述されている
5. AC-5: Task05 / 06 が governance owner にならないことが明記されている
6. AC-6: Task08 が route state を前提に resume 契約へ進める

## 統合テスト連携

- Phase 4 で route decision、approval token、handoff guidance、disclosure boundary の test matrix を作る
- Phase 6 で degraded / expired token / disclosure unavailable / visible handoff の edge case を追加する
- Phase 9 で consumer auth 非流用、silent fallback 不可、manual boundary 維持を監査する

## 成果物

| 成果物              | パス                                     | 説明                                 |
| ------------------- | ---------------------------------------- | ------------------------------------ |
| 要件定義書          | `phase-1-requirements.md`                | Task07 の governance 要件            |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | source と current code anchor の対応 |

## 完了条件

- [ ] route priority と governance bundle の要件が明記されている
- [ ] consumer auth 非流用と prompt sanitize 前提が含まれている
- [ ] Task05 / Task06 / Task08 への委譲境界が明記されている
- [ ] AC-1〜AC-6 が本文で追跡できる
- [ ] **本Phase内の全タスクを100%実行完了**

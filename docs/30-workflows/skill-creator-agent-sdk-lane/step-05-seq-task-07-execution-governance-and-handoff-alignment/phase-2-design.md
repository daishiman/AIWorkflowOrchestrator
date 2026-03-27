# Phase 2: 設計

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 2                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

Runtime policy、handoff guidance、approval gate、disclosure info を 1 つの governance bundle として設計し、Skill Creator surface が shared contract を再利用する構成を明示する。

## 実行タスク

- governance bundle の concern 分解を設計する
- route / approval / disclosure / UI copy slot の接続点を設計する
- shared type / main service / IPC / renderer consumption の境界を設計する
- validation matrix を command 単位で設計する

## 参照資料

| 資料名         | パス                                                                                      | 説明                      |
| -------------- | ----------------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件   | `phase-1-requirements.md`                                                                 | governance 要件           |
| Phase 1 抽出表 | `outputs/phase-1/spec-extraction-map.md`                                                  | source / code anchor 対応 |
| Task05 index   | `../../completed-tasks/step-04-par-task-05-create-entry-mainline-unification/index.md`    | mainline host             |
| Task06 index   | `../../completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md` | verify / improve host     |
| Task08 index   | `../step-06-seq-task-08-session-persistence-and-resume-contract/index.md`                 | downstream persistence    |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                                              | 内容                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| execution responsibility | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`   | route authority と same-wave sync        |
| agent execution core     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                                 | `HandoffGuidance` / Manual Boundary      |
| IPC system core          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                        | approval / disclosure channel と handler |
| shared reference bundle  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | consumer -> DTO mapping                  |

### 現行コードアンカー

| ファイル                                                             | 設計観点                                          |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| `packages/shared/src/types/handoff.ts`                               | `HandoffGuidance` canonical DTO の保持先          |
| `packages/shared/src/types/skillCreator.ts`                          | runtime response union と `TerminalHandoffBundle` |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`    | policy authority と consumer auth guard           |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | surface ごとの `HandoffGuidance` 生成             |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts`             | approval token lifecycle                          |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                       | Skill Creator public invoke boundary              |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`                      | shared approval handler                           |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`                    | shared disclosure handler                         |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | Skill Creator 用 public API 境界                  |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | visible handoff / copy slot の host               |

## 実行手順

### ステップ1: governance bundle topology を設計する

- concern は `route authority`、`handoff DTO`、`approval enforcement`、`disclosure fetch` の 4 つに分ける。
- owner は Main 側 service / handler に固定し、Renderer は state と copy slot の consumption に留める。
- Skill Creator 専用 channel を増やすのではなく、shared `approval:*` / `execution:get-disclosure-info` を利用する。

### ステップ2: type / IPC / renderer boundary を設計する

- shared type は `HandoffGuidance` と existing runtime response union を正本とする。
- `creatorHandlers.ts` は plan / execute / improve の route decision と normalized error を返す。
- approval / disclosure の handler は shared handler を使い、Skill Creator だけの enforcement 実装を複製しない。
- `SkillLifecyclePanel` は handoff reason と disclosure summary を表示できても、approval/token owner にはならない。

### Manual Boundary と shared contract の根拠

| 項目 | 固定ルール                                                                    | 根拠                                                |
| ---- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| MB-1 | API 実行不可時も headless 自動実行へ落とさず、`terminal_handoff` へ切り替える | authority を Main に固定し、hidden execution を防ぐ |
| MB-2 | consumer auth token を API key や handoff credential として横流ししない       | auth semantics を曖昧にしない                       |
| MB-3 | approval は enforcement、disclosure は説明責務として分離する                  | shared contract の二重正本化を防ぐ                  |
| MB-4 | Renderer は表示専任とし、approval token / route decision を再生成しない       | Main owner / Renderer consumer の境界を維持する     |

## Task08 へ渡す canonical 前提

`route authority は Main owner のまま維持し、Skill Creator は shared `HandoffGuidance`/`approval:\*`/`execution:get-disclosure-info` を再利用する。Renderer は visible handoff と disclosure summary の表示に留まり、manual boundary と consumer auth guard を上書きしない。`

### ステップ3: validation matrix を設計する

- RuntimePolicyResolver unit test で route decision を確認する。
- RuntimeSkillCreatorFacade / creatorHandlers / preload runtime test で public surface 到達を確認する。
- Renderer regression で visible handoff と no console-only を確認する。
- approval / disclosure handler 連携は shared IPC integration test で確認する。

## 統合テスト連携

- Phase 4 で `RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / `creatorHandlers` / preload / renderer の 5 層に test case を配分する
- Phase 6 で expired approval token、degraded policy、consumer token、disclosure fetch failure を追加する
- Phase 9 で shared contract 再利用と per-surface 重複実装禁止を QA 観点に入れる

## 成果物

| 成果物                            | パス                                                   | 説明                            |
| --------------------------------- | ------------------------------------------------------ | ------------------------------- |
| 設計書                            | `phase-2-design.md`                                    | governance bundle の設計        |
| governance bundle matrix          | `outputs/phase-2/governance-bundle-matrix.md`          | concern / owner / contract 一覧 |
| route approval disclosure mapping | `outputs/phase-2/route-approval-disclosure-mapping.md` | route / IPC / UI slot の接続表  |

## 完了条件

- [ ] route / handoff / approval / disclosure の owner が分離されている
- [ ] Skill Creator が shared contract 再利用で設計されている
- [ ] validation matrix が command 単位で定義されている
- [ ] Task08 へ渡す前提が設計として追跡できる
- [ ] **本Phase内の全タスクを100%実行完了**

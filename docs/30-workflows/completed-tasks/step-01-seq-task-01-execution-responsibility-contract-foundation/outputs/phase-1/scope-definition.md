# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 1                                                         |
| 作成日   | 2026-03-20                                                |

## Task01 の境界

### Task01 で確定する内容

| 項目                  | 内容                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| capability 4 状態定義 | integratedRuntime / terminalSurface / both / none の責務と状態遷移条件 |
| UI 状態語彙           | ready / blocked / unavailable の判定ルールと表示契約                   |
| CTA 契約              | primary 1 個 + secondary 1 個の表示条件・ラベル・action wiring         |
| 禁止事項              | silent fallback / auto-send / hidden prompt injection の禁止境界       |
| canonical doc set     | Task02-09 が参照すべき正本ドキュメントの一覧と参照目的                 |

### Task01 で確定しない内容（下流 Task に委譲）

| 項目                                 | 委譲先 | 理由                                                                 |
| ------------------------------------ | ------ | -------------------------------------------------------------------- |
| RuntimePolicy の中央 authority 実装  | Task02 | policy 判定ロジックの実装は contract 確定後に行う                    |
| Settings / Shell の access matrix UI | Task03 | access cards / health row の具体 UI は mainline lane で扱う          |
| Chat / Workspace の guidance wiring  | Task04 | blocked CTA から settings 遷移等の具体 wiring は mainline で扱う     |
| Terminal handoff の具体コマンド構築  | Task05 | TerminalHandoffBuilder の改修は terminal surface lane で扱う         |
| Transcript provenance                | Task06 | transcript share の 3 操作は provenance linkage で扱う               |
| ChatPanel review harness             | Task07 | review harness は mainline 契約確立後に整列                          |
| Slide / Modifier legacy lane         | Task08 | legacy lane の manual fallback は後段で扱う                          |
| Governance closure                   | Task09 | canonical bridge / status 定義 / same-wave sync は最終 task で閉じる |

## 統合ポイントの境界整理

| 統合ポイント                                     | Task01 の役割                                   | 下流の役割                                             |
| ------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------ |
| IPC layer の変更を伴う契約                       | contract-matrix で DTO 構造を定義する           | Task02 以降で IPC handler を実装する                   |
| Renderer UI の変更を伴う契約                     | CTA 契約と state 語彙を定義する                 | Task03-04 で UI コンポーネントを実装する               |
| `settings` public shell / AuthGuard bypass       | consumer 境界として明記する                     | Task03 で具体 wiring を実装する                        |
| `ViewType` / `renderView()` canonical route 契約 | consumer 境界として参照する（route 追加しない） | 既存 route を使い、必要なら下流で追加                  |
| canonical doc set の読み取り専用性               | Task01 で確定した doc set は下流から変更不可    | Task02-09 は参照のみ。変更が必要なら Task01 MAJOR 戻り |
| terminal handoff のコマンド構築                  | 禁止事項（auto-send / hidden injection）を定義  | Task05 で TerminalHandoffBuilder を改修                |

## Canonical Doc Set 一覧

Task02 以降が参照すべき情報を、`Task01 成果物`、`workflow canonical`、`aiworkflow-requirements spec`、`implementation anchor` に分離して保持する。

### A. Task01 成果物

| ファイルパス                                                                                                                    | 参照目的                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-2/contract-matrix.md`         | capability x state x CTA の全組み合わせ契約            |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-2/validation-matrix.md`       | Phase 3/4/11/12 の検証観点                             |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-2/design-summary.md`          | 3 concern 分解・ownership 表・simpler alternative 棄却 |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/requirements-definition.md` | FR-1-FR-4 / NFR-1-NFR-2 の要件定義                     |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md`        | Task01 境界と canonical doc set 一覧（本文書）         |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/current-state-inventory.md` | 現状コードの gap 分析結果                              |

### B. Workflow Canonical

| ファイルパス                                                                                                    | 参照目的                                          |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`                                    | 親パック task 依存順と lane 分離方針              |
| `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`                        | 状態語彙・CTA・handoff 契約の workflow 正本       |
| `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`                      | 問題設定・依存順・drift リスクの監査結果          |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | current canonical entrypoint と extraction matrix |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`                 | predecessor として残す historical 問題設定        |

### C. aiworkflow-requirements から抽出する implementation-ready spec

| concern                      | 必須 spec                                                                                                                                                                                                                                                                                                                                                                                  | 参照目的                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| auth / capability foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`                                                                                                                                                                                                                                        | AuthModeStatus DTO、capability 語彙、transport 境界                     |
| runtime / IPC                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`, `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                                                                                                                                                    | response envelope、health route、selected-config 型契約                 |
| state / selector             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                                                                                                                                                                                                            | Renderer selector 境界と既存 capability 語彙                            |
| navigation / settings        | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`                                                                                                                                                                                                                                        | settings public shell / AuthGuard bypass / ViewType / renderView() 境界 |
| security boundary            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`, `.claude/skills/aiworkflow-requirements/references/security-principles.md`                                                                                                                                                                                                                              | terminal lane の禁止事項と Preload / IPC security 境界                  |
| governance                   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | same-wave sync、completed ledger、follow-up backlog、再発防止           |

### D. Implementation Anchor

| ファイルパス                                                      | 参照目的                                   |
| ----------------------------------------------------------------- | ------------------------------------------ |
| `packages/shared/src/types/auth-mode.ts`                          | AuthMode 型・AuthModeStatus DTO の実装正本 |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | capability 判定ロジックの実装正本          |

## 除外範囲

以下は Task01 のスコープ外であり、明示的に扱わない:

1. プロダクションコードの変更（Task01 は設計タスク）
2. `ViewType` / `renderView()` への route 追加・分岐実装
3. `settings` public shell / AuthGuard bypass の具体 wiring 実装
4. terminal handoff のコマンド構築ロジック改修
5. IPC handler の追加・変更
6. Zustand store / slice の実装変更
7. CTA コンポーネントの実装

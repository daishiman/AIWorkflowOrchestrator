# TASK-SDK-04: user-interaction-bridge-and-phase-ui

## 概要

`SkillCreatorWorkflowEngine` が保持する workflow state を、Preload / Renderer へ安全に橋渡しし、ユーザーが段階的に回答できる phase UI を定義する task 仕様書である。

Task04 の主題は単なる質問フォーム追加ではない。Task02 が owner として持つ `currentPhase`、`awaitingUserInput`、`verifyResult`、`resumeTokenEnvelope` を renderer が再計算せずに受け取り、Task03 の source provenance を説明可能な UI surface に載せることにある。

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-04                                                                  |
| タスク種別 | 設計                                                                         |
| 優先度     | 高                                                                           |
| ステータス | spec_created                                                                 |
| 上流ゲート | `root-workflow-pack/phase-1-requirements.md` から `phase-3-design-review.md` |
| 依存タスク | TASK-SDK-01, TASK-SDK-02                                                     |
| 後続タスク | TASK-SDK-05, TASK-SDK-06, TASK-SDK-07, TASK-SDK-08                           |
| 作成日     | 2026-03-26                                                                   |
| 更新日     | 2026-03-26                                                                   |

## 受入基準

| ID   | 基準                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1 | `currentPhase` / `awaitingUserInput` / `verifyResult` / `resumeTokenEnvelope` の source of truth が Task02 engine であると明記される |
| AC-2 | public interaction bridge が `skill-creator:*` 命名を維持し、shared contract first で設計される                                      |
| AC-3 | question kind が `single_select` / `free_text` / `secret` / `confirm` の 4 種で説明される                                            |
| AC-4 | phase UI が provenance summary、user input、handoff を別 block で表示し、renderer が owner にならない                                |
| AC-5 | `executePlan()` の `terminal_handoff` が console-only ではなく visible UI surface へ接続される前提が定義される                       |
| AC-6 | Task05 / Task06 / Task07 / Task08 へ渡す boundary が明示され、入口統合・verify detail・governance・resume semantics を抱え込まない   |

## スコープ

**含む**:

- workflow state snapshot の public bridge 設計
- user question request / response contract
- `SkillLifecyclePanel` を中心にした phase UI mapping
- provenance summary と handoff card の責務境界
- store cache と local draft state の分離

**含まない**:

- create 主導線の最終一本化
- verify / improve detail surface の最終 UX
- approval / disclosure copy の最終確定
- session persistence / invalidation semantics
- runtime policy resolver 自体の redesign

## 依存関係

| 種別        | 参照先                                                                       | 役割                                                            |
| ----------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| predecessor | `../../step-01-seq-task-01-manifest-contract-foundation/index.md`            | manifest foundation と source provenance の土台                 |
| predecessor | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`   | workflow state owner、`awaitingUserInput` / `verifyResult` 契約 |
| parallel    | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`      | provenance summary / source drift warning の入力                |
| downstream  | `../step-04-par-task-05-create-entry-mainline-unification/index.md`          | create mainline の入口統合                                      |
| downstream  | `../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`       | verify / improve / re-entry detail surface                      |
| downstream  | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` | approval / disclosure / terminal handoff 文言 hardening         |
| downstream  | `../step-06-seq-task-08-session-persistence-and-resume-contract/index.md`    | requestId / resume handoff point / compatibility の意味論       |

## 現行コードアンカー

| ファイル                                                                       | 現状の役割                                                               | Task04 での扱い                                                                           |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`         | workflow phase、`awaitingUserInput`、`verifyResult` を保持する owner     | public bridge に出す canonical snapshot の起点                                            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`          | `plan()` / `execute()` と engine 記録を接続し、`terminal_handoff` も返す | bridge read/write の orchestrator。public response union は維持                           |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                 | `skill-creator:plan` / `execute-plan` / `improve-*` handler を公開       | `get-workflow-state` / `submit-user-input` / state event を追加する配線点                 |
| `apps/desktop/src/preload/channels.ts`                                         | `skill-creator:*` channel allowlist と progress event を定義             | 新規 workflow bridge channel を追加し、命名と allowlist を同期                            |
| `apps/desktop/src/preload/skill-creator-api.ts`                                | runtime public API を Renderer へ公開                                    | snapshot getter、input submitter、state change listener を追加                            |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                         | generation state と current plan result を保持                           | workflow snapshot cache を追加する候補。renderer owner にはしない                         |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`           | LLM generation と execute 導線の主要 panel                               | phase badge、question host、provenance summary、handoff card の表示責務を持つ中心 surface |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`             | template / LLM mode を含む create wizard                                 | detail input capture 再利用先候補。mainline 決定は Task05                                 |
| `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | terminal handoff の再利用可能 UI                                         | execute handoff surface の第一候補。local で独自 handoff UI を増やしすぎない              |

## Current Canonical Facts From Branch

- `SkillCreatorWorkflowPhase` は `plan` / `review` / `execute` / `verify` / `improve` / `handoff` の 6 phase を持つ。
- `SkillCreatorWorkflowStateSnapshot` は既に `currentPhase`、`awaitingUserInput`、`verifyResult`、`phaseArtifacts`、`resumeTokenEnvelope`、`routeSnapshot?`、`sourceProvenance?` を持つ。
- `RuntimeSkillCreatorFacade.execute()` は `terminal_handoff` を public union で返し、Main 側では engine へ handoff 記録を残せる。
- 現時点の public IPC には workflow state getter / submit user input / state change event が存在しない。
- Renderer 側は `SkillLifecyclePanel` で `executePlan()` handoff を console-only で扱っており、visible UI connection が未完了である。
- `ViewType` / `renderView` では `skillCreate` / `skillAnalysis` が既に存在し、Task04 単独で新規 top-level route を追加する必要はない。

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | 質問フォーム追加ではなく、engine owner の state を Renderer が勝手に所有せず、安全に見せて答えを返せる橋を作ること                     |
| 依存関係・責務境界   | Task02 が phase/state owner、Task03 が provenance producer、Task04 は bridge + UI host、Task05/06/07/08 は downstream hardening を担当 |
| 価値とコストの不均衡 | phase UI、verify detail、mainline 統合、governance を同時に閉じると task が膨張する。Task04 は interaction bridge に限定する           |
| 改善優先順位         | 1) shared workflow snapshot 2) user input request/response 3) phase UI block 分割 4) handoff visible 化 5) downstream boundary 固定    |
| 4条件評価            | 価値性・実現性・整合性・運用性を満たすため、owner を engine に固定しつつ Renderer は説明責務のみに留める                               |

## ディレクトリ構成

```text
step-03-par-task-04-user-interaction-bridge-and-phase-ui/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/interaction-bridge-matrix.md
    ├── phase-2/phase-ui-mapping.md
    ├── phase-3/design-review-gate.md
    ├── phase-3/skill-compliance-and-elegance-review.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-11/screenshot-plan.json
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   ├── skill-feedback-report.md
    │   └── phase12-task-spec-compliance-check.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- Task01 / Task02 の contract を読了している
- source provenance は Task03 から受け取る前提に合意している
- `skillCreate` view 内で phase UI を成立させ、mainline 一本化は Task05 へ委譲する方針に合意している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` または workflow state 関連 shared types
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 非対象

- create 入口導線の最終一本化
- verify / improve panel の完成 UX
- approval / disclosure copy の最終化
- persistence / invalidation contract

### 完了イメージ

- `awaitingUserInput` を 4 種の UI input に対応づけられる
- `currentPhase` / `verifyResult` / provenance summary の見せ方を renderer owner なしで説明できる
- `executePlan()` handoff が `TerminalHandoffCard` など visible UI に接続される
- Task05 / 06 が同じ snapshot を前提に surface を拡張できる

### 並列実行メモ

- Task03 と並列可能だが provenance summary の shape を無断再定義しない
- Task05 と UI host が重なるため、どこを primary entry にするかは持ち込まない
- Task06 は verify / improve detail surface を追加するため、Task04 は phase summary と question host のみを閉じる
- Task07 は disclosure / approval / governance 文言の hardening を担当する

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)

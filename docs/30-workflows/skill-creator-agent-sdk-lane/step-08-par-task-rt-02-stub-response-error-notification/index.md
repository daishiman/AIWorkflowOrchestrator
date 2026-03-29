# TASK-RT-02: stub-response-error-notification

## 概要

`RuntimeSkillCreatorFacade` の `plan()` / `execute()` / `improve()` は、llmAdapter 未注入または resourceLoader 未使用時にスタブレスポンス（空データ）を返す。UI はこれを正常レスポンスとして受け取るため、ユーザーは何が問題なのか判断できない。本タスクは、スタブレスポンスを明示的なエラー返却に置き換え、IPC 経由で renderer に適切なエラー表示を行わせることを目的とする。

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | TASK-RT-02                        |
| タスク種別 | バグ修正 / 改善                   |
| 優先度     | P1                                |
| ステータス | spec_created                      |
| 上流ゲート | `../requirements-draft.md`        |
| 依存タスク | なし（TASK-RT-01 と並列実行可能） |
| 後続タスク | TASK-RT-03                        |
| 作成日     | 2026-03-29                        |
| 更新日     | 2026-03-29                        |

## 受入基準

| ID   | 基準                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| AC-1 | `plan()` が llmAdapter 未注入時にエラーを返す（空スタブではなく明示的エラー） |
| AC-2 | `execute()` が適切なセットアップなしで進行せずエラーを返す                    |
| AC-3 | `improve()` が degraded 状態時にエラーを返す                                  |
| AC-4 | エラーレスポンスに reason code とユーザー向けメッセージが含まれる             |
| AC-5 | IPC handler がこれらのエラーを捕捉し、UI 向けに正しくフォーマットする         |
| AC-6 | UI コンポーネントが degraded レスポンス受信時にエラー状態を表示する           |
| AC-7 | 既存の非 degraded パス（正常系）が変更されていない                            |

## スコープ

**含む**:

- `RuntimeSkillCreatorFacade.plan()` のスタブレスポンス → エラー返却への変換
- `RuntimeSkillCreatorFacade.execute()` のスタブレスポンス → エラー返却への変換
- `RuntimeSkillCreatorFacade.improve()` のスタブレスポンス → エラー返却への変換
- `RuntimeSkillCreatorPlanResult` インターフェースへの `status` / `degradedReason` フィールド追加（注: `RuntimeSkillCreatorPlanResponse` は union type のため、フィールド追加先は構成要素の `RuntimeSkillCreatorPlanResult` インターフェース）
- `creatorHandlers.ts` での IPC エラーハンドリング追加
- `SkillLifecyclePanel.tsx` / `SkillCreateWizard.tsx` でのエラー表示
- reason code 定義: `"llm_adapter_unavailable"` | `"resource_loader_unavailable"`
- ユニットテスト

**含まない**:

- llmAdapter 自体のエラーハンドリング強化（TASK-RT-01 の責務）
- llmAdapter / resourceLoader の自動リカバリー・再接続
- verify / re-verify パスのスタブ処理（TASK-P0-01 / P0-02 の責務）
- IPC チャネル追加（既存チャネルを利用）
- E2E テスト

## 依存関係

| 種別       | 参照先                                    | 役割                                  |
| ---------- | ----------------------------------------- | ------------------------------------- |
| upstream   | `../requirements-draft.md`                | FR-01 plan / FR-02 execute 契約の要件 |
| upstream   | `../root-workflow-pack/index.md`          | lane 共通不変条件と責務分離方針       |
| peer       | TASK-RT-01 (llmAdapter error propagation) | 並列実行。adapter 側エラー伝搬        |
| downstream | TASK-RT-03 (skill creation result panel)  | エラー状態の UI 表示を利用            |

## 現行コードアンカー

| ファイル                                                                     | 現状の役割                                                 | TASK-RT-02 での扱い                              |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` (L306) | plan() スタブ: `{ skillName: "", agents: [], ... }` を返す | エラーレスポンスに置き換える                     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | execute() / improve() にも同様のスタブパスが存在           | 同様にエラーレスポンスに置き換える               |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                               | IPC handler。現在スタブをそのまま渡している                | エラー検出と `IpcResult` 変換を追加する          |
| `packages/shared/src/types/skillCreator.ts`                                  | `RuntimeSkillCreatorPlanResponse` 型定義                   | `status` / `degradedReason` フィールドを追加する |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`         | plan/execute 結果の表示                                    | エラー状態の条件分岐と表示を追加する             |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`           | スキル作成ウィザード                                       | エラー状態の条件分岐と表示を追加する             |

## 問題の詳細

### 現行の問題コード（RuntimeSkillCreatorFacade.ts L306-327）

```typescript
if (
  !this.llmAdapter ||
  (!this.resourceLoader && !this.hasDynamicResourcePipeline())
) {
  const planResult = {
    planId,
    skillSpec,
    estimatedSteps: 3,
    skillName: "", // ← 空文字
    description: "", // ← 空文字
    agents: [], // ← 空配列
    scripts: [],
    triggers: [],
    anchors: [],
  };
  this.workflowEngine.recordPlanResult(planResult, decision, sourceProvenance);
  return planResult; // ← 成功のように見えるが実際は degraded
}
```

### 影響

- UI は空のスキル名、空のエージェントリストを受け取る
- ユーザーには「何も表示されない」状態になるが、エラーメッセージは出ない
- デバッグ困難: ログにもスタブ返却の旨が記録されない

## 設計方針

- 既存の `IpcResult` パターン（`{ success: false, error: "..." }`）を活用する
- `RuntimeSkillCreatorPlanResult` インターフェースに `status: "ok" | "degraded" | "error"` を追加する（`RuntimeSkillCreatorPlanResponse` は union type のため、フィールド追加先はその構成要素である `RuntimeSkillCreatorPlanResult`）
- `degradedReason` フィールドで具体的原因を伝達する
- reason code: `"llm_adapter_unavailable"` | `"resource_loader_unavailable"`
- renderer 側は `status !== "ok"` 時にエラー UI を表示する

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | スタブレスポンスが成功と区別できない問題を、型レベルで解消すること                                                  |
| 依存関係・責務境界   | Facade はエラー状態を返す。IPC handler は `IpcResult` に変換する。renderer はエラー UI を表示する。責務は三層に分離 |
| 価値とコストの不均衡 | 型追加 + 条件分岐変更で実装可能。コスト低・価値高                                                                   |
| 改善優先順位         | 1. 型拡張 2. plan() スタブ置換 3. execute()/improve() スタブ置換 4. IPC handler 5. renderer エラー表示              |
| 4条件評価            | 価値性: P1（UX 直結）/ 実現性: 高（既存パターン踏襲）/ 整合性: IpcResult 互換 / 運用性: reason code で診断可能      |

## ディレクトリ構成

```text
step-08-par-task-rt-02-stub-response-error-notification/
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
└── {outputs/
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/error-response-design.md
    ├── phase-2/reason-code-catalog.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-5/
    ├── phase-11/
    │   ├── manual-test-checklist.md
    │   ├── manual-test-result.md
    │   ├── manual-test-report.md
    │   └── discovered-issues.md
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   └── skill-feedback-report.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- `RuntimeSkillCreatorFacade.ts` の L306-327（plan スタブ）を読了している
- execute() / improve() の同様のスタブパスを読了している
- `creatorHandlers.ts` の IPC ハンドリングパターンを読了している
- `IpcResult` 型のパターンを理解している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `RuntimeSkillCreatorPlanResult` インターフェースに `status` / `degradedReason` フィールド追加（`RuntimeSkillCreatorPlanResponse` は union type のため直接フィールド追加不可）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — スタブ → エラー変換
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — エラー検出・フォーマット追加
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — エラー表示追加
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` — エラー表示追加
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` — テスト追加

### 非対象

- llmAdapter 自体のエラーハンドリング（TASK-RT-01）
- verify パスのスタブ処理（TASK-P0-01 / P0-02）
- IPC チャネル追加
- E2E テスト
- 自動リカバリー・再接続

### 完了イメージ

- llmAdapter 未注入時に `plan()` が `{ status: "error", degradedReason: "llm_adapter_unavailable", ... }` を返す
- execute() / improve() も同様にエラーレスポンスを返す
- IPC handler が `{ success: false, error: "LLMアダプタが利用できません" }` を renderer に返す
- renderer がエラーメッセージを表示する
- 正常系パスは一切変更なし

### 並列実行メモ

- TASK-RT-02 は TASK-RT-01 と並列実行可能
- shared type の `status` フィールド追加は RT-01 とのマージ競合に注意
- TASK-RT-03 は TASK-RT-02 完了後に着手

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

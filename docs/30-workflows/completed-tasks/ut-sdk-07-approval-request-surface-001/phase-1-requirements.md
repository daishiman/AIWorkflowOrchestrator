# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 1                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | -                                           |
| 後続Phase  | Phase 2                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |
| タスク分類 | UI task                                     |

## 目的

`SkillCreatorAPI` インターフェースに `onApprovalRequest` 購読メソッドが欠落しており、Skill Creator フローで `approval:request` イベントを受信できない状態を解消する。既存の `ApprovalSheet` と disclosure の責務を重複させず、approval flow を public surface に対称接続する。

## 背景

TASK-SDK-07 Phase 12 再監査により、`skill-creator-api.ts` の `SkillCreatorAPI` インターフェースに以下の非対称が発見された：

| メソッド            | 存在 | 説明                     |
| ------------------- | ---- | ------------------------ |
| `respondToApproval` | ✅   | 承認応答送信（送信方向） |
| `getDisclosureInfo` | ✅   | AI利用情報取得           |
| `onApprovalRequest` | ❌   | 承認要求受信購読（欠落） |

`APPROVAL_REQUEST` チャンネル（`approval:request`）は `ALLOWED_ON_CHANNELS` に登録済み（`channels.ts` line 777）のため、`safeOn` パターンで実装可能。実際の購読 surface は `getSkillCreatorApi()` 経由で取得する `window.skillCreatorAPI` / `window.electronAPI?.skillCreator` に寄せ、追加の別名 surface は使わない。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                            |
| ---------- | --------------- | --------------------------------- |
| SubAgent-A | Preload/API契約 | SkillCreatorAPI interface と実装  |
| SubAgent-B | Renderer/UI責務 | SkillLifecyclePanel approval UI   |
| SubAgent-C | テスト責務      | approval request テストケース設計 |
| SubAgent-D | 統合監査        | IPC契約整合・型整合・責務境界     |

## 実行タスク

- 要件抽出: 欠落メソッドの機能要件・型契約・受け入れ基準を定義する
- 命名規則分析: 既存コードの命名パターン（camelCase / kebab-case）を分析・記録する
- aiworkflow仕様抽出: resource-map起点で必要仕様をカテゴリ単位で抽出する
- 受け入れ基準化: 矛盾なし・漏れなし・整合あり・依存整合の判定基準を定義する
- artifact 命名 canonical 一覧確定: task root 生成時に先に確定させる

## 参照資料

### 実装・コード

| 資料名                    | パス                                                                 | 用途                                             |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Skill Creator Preload API | `apps/desktop/src/preload/skill-creator-api.ts`                      | SkillCreatorAPI interface・onApprovalRequest欠落 |
| 汎用 Preload API          | `apps/desktop/src/preload/index.ts`                                  | onApprovalRequest の参照実装（line 380付近）     |
| IPC チャンネル定義        | `apps/desktop/src/preload/channels.ts`                               | APPROVAL_REQUEST チャンネル登録確認（line 777）  |
| 共有 IPC チャンネル       | `packages/shared/src/ipc/channels.ts`                                | APPROVAL_CHANNELS 定義（line 139）               |
| SkillLifecyclePanel       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | approval request UI 接続先                       |
| useApprovalFlow hook      | `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`                 | approval flow state 管理パターン                 |
| approvalHandlers          | `apps/desktop/src/main/ipc/approvalHandlers.ts`                      | Main Process 側 approval push 実装               |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                                        | 用途                       |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約監査基準            |
| システムIPC仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | approval チャンネル仕様    |
| Agent SDK参照          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | Skill Creator surface 参照 |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC ライフサイクルパターン |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗契約                   |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート                 |
| タスク運用             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール             |
| リソースマップ         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止               |
| ApprovalSheet          | `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`                          | 再利用する approval UI     |
| SkillLifecyclePanel    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                        | public surface の消費先    |
| useApprovalFlow        | `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`                                        | execution console 対照実装 |

## 実行手順

1. resource-map.md を起点に対象カテゴリ（IPC/Interface/Renderer/Preload）を確定する。
2. `skill-creator-api.ts` の既存命名規則（camelCase メソッド名、`on` + PascalCase イベント名パターン）を分析・記録する。
3. `preload/index.ts` の `skillCreatorAPI` / `window.skillCreatorAPI` 公開パターンを参照して型契約を定義する。
4. `useApprovalFlow.ts` のコールバック型を確認しつつ、Skill Creator では同一の payload shape を local alias に留める。
5. 要件と受け入れ基準を矛盾なし・漏れなしの状態で固定する。
6. artifact 命名 canonical 一覧を確定する。

## 命名規則分析（Phase 1 必須）

| 対象               | 命名パターン                      | 例                                                                                                                                |
| ------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Preload メソッド   | camelCase                         | `onApprovalRequest`, `safeOn`                                                                                                     |
| IPC チャンネル定数 | UPPER_SNAKE_CASE                  | `APPROVAL_REQUEST`                                                                                                                |
| IPC チャンネル値   | kebab-case                        | `approval:request`                                                                                                                |
| コールバック型     | `(payload: T) => void` のパターン | `(payload: { operationType: string; description: string; destination?: string; sessionId: string; operationId: string }) => void` |

## 機能要件

| 要件ID | 要件                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| FR-01  | `SkillCreatorAPI` インターフェースに `onApprovalRequest` メソッドを追加する              |
| FR-02  | `onApprovalRequest` は `APPROVAL_REQUEST` チャンネルを `safeOn` で購読する               |
| FR-03  | `onApprovalRequest` はアンサブスクライブ関数 `() => void` を返す                         |
| FR-04  | `SkillLifecyclePanel.tsx` で `onApprovalRequest` を消費し既存 `ApprovalSheet` を表示する |
| FR-05  | `respondToApproval` との対称性（approve/reject action）を `ApprovalSheet` 経由で維持     |
| FR-06  | `getSkillCreatorApi()` の fallback 経路と `preload/index.ts` の公開 surface を対称に保つ |

## 非機能要件

| 要件ID | 要件                                                                |
| ------ | ------------------------------------------------------------------- |
| NFR-01 | TypeScript strict mode で型エラーなし                               |
| NFR-02 | 既存の `respondToApproval` / `getDisclosureInfo` の動作に影響しない |
| NFR-03 | `ALLOWED_ON_CHANNELS` の既存リストを変更しない                      |
| NFR-04 | Vitest 全テストが PASS する                                         |

## artifact 命名 canonical 一覧

| Phase | artifact 名                        | パス                                                     |
| ----- | ---------------------------------- | -------------------------------------------------------- |
| 1     | requirements-definition            | `outputs/phase-1/requirements-definition.md`             |
| 1     | acceptance-criteria                | `outputs/phase-1/acceptance-criteria.md`                 |
| 1     | aiworkflow-requirements-extraction | `outputs/phase-1/aiworkflow-requirements-extraction.md`  |
| 1     | branch-diff-coverage               | `outputs/phase-1/branch-diff-coverage.md`                |
| 1     | traceability-matrix                | `outputs/phase-1/traceability-matrix.md`                 |
| 2     | architecture-design                | `outputs/phase-2/architecture-design.md`                 |
| 2     | ipc-contract-design                | `outputs/phase-2/ipc-contract-design.md`                 |
| 2     | test-strategy                      | `outputs/phase-2/test-strategy.md`                       |
| 2     | dependency-consistency-matrix      | `outputs/phase-2/dependency-consistency-matrix.md`       |
| 3     | design-review-result               | `outputs/phase-3/design-review-result.md`                |
| 3     | gate-decision                      | `outputs/phase-3/gate-decision.md`                       |
| 3     | contradiction-checklist            | `outputs/phase-3/contradiction-checklist.md`             |
| 4     | test-specification                 | `outputs/phase-4/test-specification.md`                  |
| 4     | red-test-result                    | `outputs/phase-4/red-test-result.md`                     |
| 4     | integration-test-plan              | `outputs/phase-4/integration-test-plan.md`               |
| 5     | implementation-summary             | `outputs/phase-5/implementation-summary.md`              |
| 5     | changed-files                      | `outputs/phase-5/changed-files.md`                       |
| 5     | contract-diff                      | `outputs/phase-5/contract-diff.md`                       |
| 6     | expanded-test-cases                | `outputs/phase-6/expanded-test-cases.md`                 |
| 6     | regression-test-result             | `outputs/phase-6/regression-test-result.md`              |
| 6     | edge-case-result                   | `outputs/phase-6/edge-case-result.md`                    |
| 7     | coverage-plan                      | `outputs/phase-7/coverage-plan.md`                       |
| 7     | uncovered-analysis-plan            | `outputs/phase-7/uncovered-analysis-plan.md`             |
| 7     | traceability-coverage-report       | `outputs/phase-7/traceability-coverage-report.md`        |
| 8     | refactoring-plan                   | `outputs/phase-8/refactoring-plan.md`                    |
| 8     | post-refactor-test-plan            | `outputs/phase-8/post-refactor-test-plan.md`             |
| 8     | responsibility-boundary-map        | `outputs/phase-8/responsibility-boundary-map.md`         |
| 9     | quality-report                     | `outputs/phase-9/quality-report.md`                      |
| 9     | risk-register                      | `outputs/phase-9/risk-register.md`                       |
| 9     | causal-loop-check                  | `outputs/phase-9/causal-loop-check.md`                   |
| 10    | final-review-result                | `outputs/phase-10/final-review-result.md`                |
| 10    | corrective-action-plan             | `outputs/phase-10/corrective-action-plan.md`             |
| 10    | release-readiness-checklist        | `outputs/phase-10/release-readiness-checklist.md`        |
| 11    | manual-test-result                 | `outputs/phase-11/manual-test-result.md`                 |
| 11    | evidence-index                     | `outputs/phase-11/evidence-index.md`                     |
| 11    | screenshot-plan                    | `outputs/phase-11/screenshot-plan.md`                    |
| 11    | discovered-issues                  | `outputs/phase-11/discovered-issues.md`                  |
| 12    | implementation-guide               | `outputs/phase-12/implementation-guide.md`               |
| 12    | system-spec-update-summary         | `outputs/phase-12/system-spec-update-summary.md`         |
| 12    | documentation-changelog            | `outputs/phase-12/documentation-changelog.md`            |
| 12    | unassigned-task-detection          | `outputs/phase-12/unassigned-task-detection.md`          |
| 12    | skill-feedback-report              | `outputs/phase-12/skill-feedback-report.md`              |
| 12    | phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 受け入れ基準

| AC-ID | 基準                                                                                       |
| ----- | ------------------------------------------------------------------------------------------ |
| AC-01 | `SkillCreatorAPI` interface に `onApprovalRequest` メソッドが定義されている                |
| AC-02 | `skillCreatorAPI` オブジェクトに `onApprovalRequest` 実装が追加されている                  |
| AC-03 | `onApprovalRequest` が `APPROVAL_REQUEST` チャンネルを `safeOn` で正しく購読する           |
| AC-04 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を消費して既存 `ApprovalSheet` を表示する |
| AC-05 | approve / reject 操作が `respondToApproval` に接続されている                               |
| AC-06 | `preload/index.ts` の同名メソッドと型シグネチャが対称である                                |
| AC-07 | TypeScript コンパイルエラーなし（`pnpm typecheck` PASS）                                   |
| AC-08 | ESLint エラーなし（`pnpm lint` PASS）                                                      |
| AC-09 | Vitest テスト PASS（新規テストケースを含む）                                               |

## 成果物

| 成果物               | パス                                                    | 説明                   |
| -------------------- | ------------------------------------------------------- | ---------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`            | 機能要件と非機能要件   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                | 検証可能なAC一覧       |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md` | aiworkflow仕様抽出結果 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`               | ブランチ差分反映確認   |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`                | 要件と仕様の対応表     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 命名規則分析が記録されている
- [ ] artifact 命名 canonical 一覧が確定している
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 命名規則分析の実施
3. SubAgent-A/B/C の並列作業
4. SubAgent-D の統合判定
5. artifact 命名 canonical 一覧確定
6. 成果物出力
7. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 統合テスト連携

本 Phase で定義した受け入れ基準（AC-01〜09）は Phase 4 テストケース（TC-APPR-01〜18）に対応づけられ、Phase 7 トレーサビリティ網羅率確認まで継続的に参照される。

## 次のPhase

Phase 2: 設計

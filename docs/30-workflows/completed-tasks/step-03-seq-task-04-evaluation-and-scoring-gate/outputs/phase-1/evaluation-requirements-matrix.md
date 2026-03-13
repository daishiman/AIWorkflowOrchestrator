# Phase 1: 要件マトリクス

## 機能要件

| ID   | 要件                                                 | 実装根拠                                                              | 判定 |
| ---- | ---------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| FR-1 | create 直後に `draft` / `post_create` を取得できる   | `SkillLifecyclePanel.handlePrepare()` / `handleCreate()`              | PASS |
| FR-2 | execute 後に `post_execute` を取得し利用導線へ渡せる | `SkillLifecyclePanel` effect + `SkillCenterView` banner               | PASS |
| FR-3 | improve 後に差分付き `post_improve` を取得できる     | `useSkillAnalysis.ts` / `SkillCenterView.handleReevaluate()`          | PASS |
| FR-4 | 3軸の内訳を UI と履歴に同形で表示できる              | `LifecycleEvaluationSnapshot`, `SkillEvaluationPanel`, `ScoreDisplay` | PASS |
| FR-5 | hard block 時は `use_ready` を返さない               | `detectLifecycleHardBlocks()` + `buildLifecycleGateDecision()`        | PASS |
| FR-6 | Task05 側から再評価を要求できる                      | `SkillCenterView` の `再評価する` ボタン                              | PASS |
| FR-7 | 理由文を 1 文で表示できる                            | `LifecycleGateDecision.summary`                                       | PASS |

## 非機能要件

| ID    | 要件                                    | 根拠                                                                                      | 判定 |
| ----- | --------------------------------------- | ----------------------------------------------------------------------------------------- | ---- |
| NFR-1 | ボタン押下から gate 表示まで 100ms 以内 | 自動計算は pure function + store 更新のみ。Phase11 で UI 遅延は目視なし                   | PASS |
| NFR-2 | 評価関連 IPC 50ms 以内                  | preload は `invokeWithTimeout` 経由、追加 IPC は `skill:optimize:evaluate` の unwrap のみ | PASS |
| NFR-3 | Renderer direct IPC 禁止                | `useSkillAnalysis` / `SkillCenterView` / `SkillLifecyclePanel` は store selector 経由     | PASS |
| NFR-4 | hard block の再現性                     | `skillEvaluation.ts` の pure function と targeted test で固定                             | PASS |
| NFR-5 | manual test に screenshot と結果ログ    | Phase11 screenshot 6件 + `manual-test-result.md` で記録                                   | PASS |

## 受入基準

| ID   | 受入基準                                               | 実装 / 証跡                                                         | 判定 |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------------- | ---- |
| AC-1 | 4 checkpoint が定義されている                          | shared 型 + `skillEvaluationSlice` action 4種                       | PASS |
| AC-2 | 3軸に分割されている                                    | `PromptEvaluation` / `SkillAnalysis` / `ExecutionQualityEvaluation` | PASS |
| AC-3 | score に応じて改善・保存・利用へ分岐する               | `buildLifecycleGateDecision()`                                      | PASS |
| AC-4 | Task03 create / improve 導線に採点が組み込まれる       | `SkillLifecyclePanel` / `SkillAnalysisView`                         | PASS |
| AC-5 | Task05 利用導線で再評価と品質表示を再利用できる        | `SkillCenterView` banner + re-evaluate                              | PASS |
| AC-6 | Atent Team / SubAgent / Codex は内部 role のまま非露出 | UI 文言は `Planner` `Executor` `Improver` `Evaluator` に限定        | PASS |

## テスト / 証跡との対応

| 観点         | 自動テスト / 手動証跡                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| Gate helper  | `skillEvaluationSlice.test.ts`                                                        |
| Task03 UI    | `SkillLifecyclePanel.test.tsx`, `SkillAnalysisView.test.tsx`, `ScoreDisplay.test.tsx` |
| Task05 reuse | `SkillCenterView.test.tsx`, `TC-11-06-task05-re-evaluate.png`                         |
| IPC 契約     | `skill-api.test.ts`, `skill-api.contract.test.ts`                                     |
| Manual       | `outputs/phase-11/manual-test-result.md`                                              |

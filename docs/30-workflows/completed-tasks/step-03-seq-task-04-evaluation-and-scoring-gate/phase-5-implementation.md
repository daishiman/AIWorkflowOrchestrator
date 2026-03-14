# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 4                 |
| 後続Phase  | Phase 6                 |

## 目的

評価ロジックとゲート判定を実装し、Task03/05 の導線へ統合する。

## 実行タスク

- タスク1: スコア算出とゲート判定ロジックを実装する。
- タスク2: `skill:optimize:evaluate` 契約に沿って IPC 入出力を実装する。
- タスク3: `SkillAnalysisView` と `ScoreDisplay` の表示分岐を実装する。
- タスク4: Task03/05 の連携ポイントへ評価結果ハンドオフを実装する。
- タスク5: `.claude` 正本と mirror の仕様整合を検証する。

## 参照資料

| 参照資料         | パス                                                                                      | 目的                       |
| ---------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| IPCハンドラ      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                              | 評価チャネル実装           |
| 評価サービス     | `apps/desktop/src/main/services/skill/PromptOptimizer.ts`                                 | 評価アルゴリズム実装       |
| 分析UI           | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                        | 評価表示と導線実装         |
| スコアUI         | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`                             | スコア表示実装             |
| 分析Hook         | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                    | 状態遷移実装               |
| 型契約           | `packages/shared/src/types/skill-improver.ts`                                             | 評価型実装                 |
| IPC仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md` | 契約整合                   |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`            | バリデーション整合         |
| 依存Phase成果物  | phase-4-test-creation.md（Phase 4）                                                       | Phase 4 のテスト仕様を参照 |

## 実行手順

1. Phase 4 のテスト仕様を Red 状態で実行する。
2. Main 側の評価・ゲートロジックを実装する。
3. Renderer 側の表示・導線分岐を実装する。
4. Task03/05 ハンドオフを実装する。
5. テストを Green にし、契約整合を確認する。

## 統合テスト連携

- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts`
- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`
- 検証観点: 契約整合、導線分岐整合、評価再実行整合。

## 多角的チェック観点（AIが判断）

- 実装が設計マトリクスに一致するか。
- IPC契約とUI表示契約が一致するか。
- Task03/05 連携で評価結果が欠落しないか。

## サブタスク管理

| SubAgent   | 責務         | 実行方式 | 出力                           |
| ---------- | ------------ | -------- | ------------------------------ |
| SubAgent-A | Main実装     | 並列     | main-implementation-log.md     |
| SubAgent-B | Renderer実装 | 並列     | renderer-implementation-log.md |
| SubAgent-C | 契約検証     | 並列     | contract-validation-log.md     |

## 成果物

| 成果物       | パス                                        | 内容               |
| ------------ | ------------------------------------------- | ------------------ |
| 実装仕様     | `./phase-5-implementation.md`               | 実装対象と手順     |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装差分と検証結果 |

## 完了条件

- [x] スコア算出とゲート判定が実装されている
- [x] IPC契約に整合している
- [x] UI導線分岐が実装されている
- [x] Phase 4 テスト仕様が Green になっている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 6（テスト拡充）で境界ケースと失敗ケースを追加検証する。

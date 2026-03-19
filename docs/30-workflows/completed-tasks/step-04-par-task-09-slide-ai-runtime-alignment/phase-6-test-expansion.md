# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 6                                       |
| Phase名    | テスト拡充                              |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 5（実装）                         |
| 後続Phase  | Phase 7（カバレッジ確認）               |
| ステータス | completed                               |
| 作成日     | 2026-03-13                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の回帰範囲を広げ、edge case とライフサイクル全体のテストカバーを強化する。

## 実行タスク

- T-6-1: watch lifecycle 回帰テスト追加（TC-06-01）
- T-6-2: abort / timeout 系テスト追加（TC-06-02 ~ TC-06-03）
- T-6-3: sync progress 系テスト追加（TC-06-04）
- T-6-4: concurrent / edge case テスト追加（TC-06-05 ~ TC-06-06）
- T-6-5: 回帰計画成果物の作成

## 参照資料

| 参照資料             | パス                                                 | 内容                                                       |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Phase 5（実装）      | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                               |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する             |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する（廃止済み） |
| sync-manager         | `apps/desktop/src/main/slide/sync-manager.ts`        | SyncManager の実装を確認する                               |
| file-watcher         | `apps/desktop/src/main/slide/file-watcher.ts`        | FileWatcher の実装を確認する                               |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する      |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「回帰 guard を増やす根拠」だけを重点確認する。

| 参照資料                        | パス                                                                                   | 内容                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| api-ipc-system                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                  | slide IPC 契約と rename 対象の正本                        |
| interfaces-auth                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                 | auth-mode / capability transport の正本                   |
| llm-workspace-chat-edit         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`         | RuntimeResolver / guidance / handoff DTO の再利用元       |
| api-ipc-agent-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`              | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport |
| security-electron-ipc-core      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`      | sender / auth-mode / secret 境界の正本                    |
| arch-state-management-reference | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md` | handoffGuidance / stale state 防止 / dismiss 契約の正本   |
| ui-ux-feature-components        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`        | guidance / error / CTA surface の正本                     |

## 回帰テストケース定義

| TC-ID    | カテゴリ        | テスト名                                          | 期待結果                                                        | 対象ファイル                          |
| -------- | --------------- | ------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| TC-06-01 | watch lifecycle | watch-start → 構造変更 → status push → watch-stop | 全 lifecycle が正常完了し、最終状態が idle に戻る               | file-watcher.ts, ipc-handlers.ts      |
| TC-06-02 | abort 系        | slide:cancelExecution 中の reverseSync            | abort 後に sync status が idle に戻り、進行中の処理が中断される | skill-executor.ts, sync-manager.ts    |
| TC-06-03 | timeout 系      | 30秒 timeout 発生時の error push                  | `{ code: "TIMEOUT" }` error code + degraded UI 状態に遷移する   | skill-executor.ts, SlideWorkspace.tsx |
| TC-06-04 | sync progress   | progress 0→50→100 の push 系列                    | slideSlice の executionProgress が 0, 50, 100 の順で更新される  | store.ts                              |
| TC-06-05 | concurrent 系   | 同時 reverseSync リクエスト                       | MAX_CONCURRENT_EXECUTIONS 制限が動作し、超過分が拒否される      | sync-manager.ts                       |
| TC-06-06 | edge case       | watch 中の agent-client 廃止後パス                | Direct SDK が呼ばれず、RuntimeResolver 経由のみで処理される     | skill-executor.ts                     |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: Phase 5 実装の現状テストを実行する

```bash
cd apps/desktop && pnpm vitest run src/main/slide/ src/renderer/slide/
```

Phase 5 で追加されたテストが全 PASS することを確認してからテスト拡充に着手する。

### ステップ3: 実行タスクを T-6-1 から T-6-5 まで順に実施する

テスト拡充 の実行タスクを順に処理し、成果物へ反映する。

### ステップ4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の追加回帰と edge case を広げる。

## 多角的チェック観点

| 観点              | チェック内容                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- |
| ライフサイクル    | watch-start → 変更検出 → push → watch-stop の全フローがテストされているか             |
| 非同期制御        | abort / timeout / concurrent のタイミング依存テストが安定して動作するか（P13 対策）   |
| 状態遷移          | slideSlice の状態が各操作後に正しい値に遷移しているか                                 |
| agent-client 排除 | 廃止済み agent-client.ts のコードパスが一切呼ばれないことが検証されているか           |
| テスト安定性      | タイマーテストで `advanceTimersByTime` を使用し無限ループを回避しているか（P13 対策） |
| テスト独立性      | テスト間で状態を共有せず `beforeEach` でリセットしているか（P9 対策）                 |

## サブタスク管理

1. T-6-1: watch lifecycle 回帰テスト追加（TC-06-01）
2. T-6-2: abort / timeout 系テスト追加（TC-06-02 ~ TC-06-03）
3. T-6-3: sync progress 系テスト追加（TC-06-04）
4. T-6-4: concurrent / edge case テスト追加（TC-06-05 ~ TC-06-06）
5. T-6-5: 回帰計画成果物（`outputs/phase-6/regression-plan.md`）の作成

## 成果物

| 成果物   | パス                                 | 内容                         |
| -------- | ------------------------------------ | ---------------------------- |
| 回帰計画 | `outputs/phase-6/regression-plan.md` | 追加回帰と確認順序を整理する |

## タスク100%実行確認【必須】

- [ ] TC-06-01 ~ TC-06-06 の全回帰テストが実装されている
- [ ] watch lifecycle テスト（TC-06-01）が start → 変更 → push → stop の全フローを検証している
- [ ] abort テスト（TC-06-02）が進行中処理の中断と idle 復帰を検証している
- [ ] timeout テスト（TC-06-03）が TIMEOUT Error Code の push と degraded UI 遷移を検証している
- [ ] progress テスト（TC-06-04）が slideSlice の executionProgress 順次更新を検証している
- [ ] concurrent テスト（TC-06-05）が MAX_CONCURRENT_EXECUTIONS 制限の動作を検証している
- [ ] edge case テスト（TC-06-06）が Direct SDK 非呼び出しを `expect(directSdk).not.toHaveBeenCalled()` で検証している
- [ ] タイマーテストで `vi.advanceTimersByTime()` を使用している（P13 対策: `runAllTimers` 禁止）
- [ ] 全テスト（Phase 4 + Phase 6）が PASS する
- [ ] 回帰計画成果物が `outputs/phase-6/regression-plan.md` に出力されている

## 完了条件

- [ ] TC-06-01 ~ TC-06-06 の全回帰テストが実装され PASS している
- [ ] 主要 edge case（concurrent / agent-client 排除 / timeout）が定義されている
- [ ] Phase 4 の既存テストに回帰がないことが確認されている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む

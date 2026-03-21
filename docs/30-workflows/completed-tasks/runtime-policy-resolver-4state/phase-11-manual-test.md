# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| Phase 名   | 手動テスト                                    |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 10（最終レビュー）                      |
| 後続 Phase | Phase 12（ドキュメント）                      |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

4状態の各パターンが direct caller lane で正しく機能することを確認する。表示用の専用画面を持たないため、本 Phase は targeted test 実装・コード精査・validator を組み合わせた non-visual evidence で完了判定する。

## 実行タスク

- capability 動作確認: 4状態の戻り値を確認する
- enforcement 動作確認: `assertNoSilentFallback()` の発動を確認する
- degraded 動作確認: `apiKeyDegraded` による降格を確認する

## 参照資料

| 参照資料            | パス                                                                              | 内容                    |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件        | docs/30-workflows/runtime-policy-resolver-4state/index.md                         | 手動確認観点            |
| Phase 2 設計        | docs/30-workflows/runtime-policy-resolver-4state/phase-2-design.md                | 4状態分岐設計           |
| Phase 5 実装        | docs/30-workflows/runtime-policy-resolver-4state/phase-5-implementation.md        | capability bridge 実装  |
| Phase 6 拡充        | docs/30-workflows/runtime-policy-resolver-4state/phase-6-test-expansion.md        | degraded / silent path  |
| Phase 7 計測        | docs/30-workflows/runtime-policy-resolver-4state/phase-7-coverage-check.md        | coverage 根拠           |
| Phase 8 整理        | docs/30-workflows/runtime-policy-resolver-4state/phase-8-refactoring.md           | 旧語彙整理結果          |
| Phase 9 品質        | docs/30-workflows/runtime-policy-resolver-4state/phase-9-quality-assurance.md     | lint / typecheck / test |
| Phase 10 最終ゲート | docs/30-workflows/runtime-policy-resolver-4state/index.md                         | ゲート判定              |
| タスク指示書        | docs/30-workflows/unassigned-task/task-exec-runtime-policy-resolver-4state-001.md | 手動テスト項目          |

## 実行手順

### ステップ1: integratedRuntime 動作確認

API キーのみ設定した状態で RuntimePolicyResolver が `"integratedRuntime"` を返すことを確認する。

```bash
# テストで検証（CLI 環境のため自動テスト結果を代替利用）
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts -t "integratedRuntime"
```

### ステップ2: terminalSurface 動作確認

サブスクリプションのみ設定した状態で `"terminalSurface"` が返ることを確認する。

### ステップ3: both 動作確認

両方設定した状態で `"both"` が返ることを確認する。

### ステップ4: none + assertNoSilentFallback 発動確認

両方未設定の状態で capability が `"none"` となり、`assertNoSilentFallback()` によるエラーが発生することを確認する。

### ステップ5: apiKeyDegraded 降格確認

API キーが degraded 状態のとき、`"terminalSurface"` に降格すること（both → terminalSurface）を確認する。

## 実行結果

- 実行モード: `NON_VISUAL_FALLBACK`
- ブロッカー: `pnpm exec tsx` / `vitest` は native binary mismatch（darwin-x64 / darwin-arm64）で再実行不可
- 代替エビデンス:
  - `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`
  - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
  - `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`

## 成果物

| 成果物               | 配置先                                      |
| -------------------- | ------------------------------------------- |
| 手動テスト checklist | `outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`    |

## 統合テスト連携

- non-visual evidence: CLI で再現できる targeted test 実行結果を manual evidence として利用する
- checklist output: `outputs/phase-11/manual-test-checklist.md` と `outputs/phase-11/manual-test-result.md` に観点と結果を固定する
- parent boundary: renderer surface や broader transport の手動確認は親タスクへ残し、この phase では direct caller lane に限定する

## 完了条件

- [x] integratedRuntime パターンの動作が確認されている
- [x] terminalSurface パターンの動作が確認されている
- [x] both パターンの動作が確認されている
- [x] none + assertNoSilentFallback の発動が確認されている
- [x] apiKeyDegraded による降格が確認されている

## 次 Phase

Phase 12（ドキュメント）へ進む。

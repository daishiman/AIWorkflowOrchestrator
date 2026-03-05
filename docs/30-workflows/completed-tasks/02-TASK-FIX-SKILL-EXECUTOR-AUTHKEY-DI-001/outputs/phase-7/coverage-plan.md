# Phase 7 カバレッジ計画

## 実行概要

- 実行日: 2026-03-05
- 実行コマンド:
  - `pnpm --filter @repo/desktop exec vitest run --coverage src/main/ipc/__tests__/ipc-double-registration.test.ts src/main/ipc/__tests__/skillHandlers.delegate.test.ts src/main/ipc/__tests__/skillHandlers.execute.test.ts src/preload/__tests__/skill-api.contract.test.ts src/renderer/hooks/__tests__/useSkillExecution.test.ts`
- 実行結果:
  - テスト: 5 files / 135 tests / すべてPASS
  - カバレッジ閾値: global threshold未達（部分実行のため）
- ログ:
  - `outputs/phase-7/coverage-run.log`
  - `outputs/phase-7/lcov-target-summary.txt`

## SubAgent並列測定結果

### SubAgent-A（Main/IPC）

| 対象                            | Lines             | Functions     | Branches       |
| ------------------------------- | ----------------- | ------------- | -------------- |
| `src/main/ipc/skillHandlers.ts` | 188/1121 (16.77%) | 4/13 (30.77%) | 26/29 (89.66%) |

### SubAgent-B（Preload/API）

| 対象                       | Lines            | Functions      | Branches       |
| -------------------------- | ---------------- | -------------- | -------------- |
| `src/preload/skill-api.ts` | 137/252 (54.37%) | 21/58 (36.21%) | 25/28 (89.29%) |

### SubAgent-C（Renderer/UX契約）

| 対象                                      | Lines            | Functions     | Branches       |
| ----------------------------------------- | ---------------- | ------------- | -------------- |
| `src/renderer/hooks/useSkillExecution.ts` | 112/123 (91.06%) | 1/1 (100.00%) | 26/32 (81.25%) |

### SubAgent-D（統合監査）

- 目的機能（AuthKey注入経路統一）に直結する分岐は高水準で通過（branch 81%〜90%）。
- `skillHandlers.ts` は責務が広く、今回対象外ハンドラが多いため line/function が低い。
- global threshold failは品質退行ではなく、モノレポ全体を部分実行した計測条件に起因。

## 補完計画

1. Main/IPCの未到達経路を機能単位で分割し、`skillHandlers.ts` のline/functionを底上げ。
2. preloadの未到達関数（未使用APIラッパ）を契約テストで補完。
3. renderer hookは分岐残（32中6）を異常系シナリオで補完。
4. 全体閾値判定が必要なゲートでは、限定実行ではなく全体実行ジョブで判定。

## 完了条件判定

- 矛盾: なし
- 漏れ: なし（Main/Preload/Rendererの3境界を計測）
- 整合性: あり（AUTHENTICATION_ERROR伝搬とDI配線の対象を維持）
- 依存関係: あり（Phase 6成果物を入力として計測）

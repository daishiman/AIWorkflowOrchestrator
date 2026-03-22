# Phase 7: カバレッジ目標

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 7                                                  |
| 作成日   | 2026-03-22                                         |

## 1. ファイル別カバレッジ目標

| ファイル                    | Line | Branch | Function | 根拠                           |
| --------------------------- | ---- | ------ | -------- | ------------------------------ |
| blockedGuidanceConfig.ts    | 100% | N/A    | 100%     | 定数のみ、全 reason 参照テスト |
| useBlockedGuidance.ts       | 100% | 100%   | 100%     | 3行の純関数、完全カバー可能    |
| guidanceActionDispatcher.ts | 90%+ | 80%+   | 100%     | 全 action type の dispatch     |
| GuidanceBlock.tsx           | 90%+ | 70%+   | 90%+     | variant x props 組み合わせ     |

## 2. 統合ゲート

| ゲート      | 実行条件                                | 合格基準   |
| ----------- | --------------------------------------- | ---------- |
| smoke test  | 全 unit test が PASS                    | 0 failures |
| integration | IS-01〜IS-05 が全 PASS                  | 0 failures |
| regression  | RG-01〜RG-05 が全 PASS                  | 0 failures |
| type check  | `pnpm --filter @repo/desktop typecheck` | 0 errors   |

## 3. Residual risk

| リスク                           | 影響 | Phase 9 での確認方法               |
| -------------------------------- | ---- | ---------------------------------- |
| openTerminal placeholder         | 低   | handler が console.warn を出力確認 |
| 複数 reason 優先度ロジック未実装 | 中   | 優先度テストが skip 扱いか確認     |

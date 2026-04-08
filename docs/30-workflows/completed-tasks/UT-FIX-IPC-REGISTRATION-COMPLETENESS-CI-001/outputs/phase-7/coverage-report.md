# Phase 7 成果物: カバレッジレポート

## 実行日時: 2026-04-07

---

## 計測コマンド

```bash
cd apps/desktop
npx vitest run --coverage --coverage.include="src/main/ipc/creatorHandlers.ts" \
  "src/main/ipc/__tests__/creatorHandlers*" \
  "src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot"
```

---

## 計測結果（既存テスト + 新規スナップショットテスト合算）

| ファイル               | % Stmts | % Branch | % Funcs | % Lines | 未カバー行        |
| ---------------------- | ------- | -------- | ------- | ------- | ----------------- |
| `creatorHandlers.ts`   | 73.25   | 83.82    | 100.00  | 73.25   | ~705-810, 815-817 |
| 新規テストファイル本体 | 100.00  | 100.00   | 100.00  | 100.00  | -                 |

---

## 目標値との比較

| ファイル               | 目標 line | 実測 line | 判定     | 目標 branch | 実測 branch | 判定 |
| ---------------------- | --------- | --------- | -------- | ----------- | ----------- | ---- |
| `creatorHandlers.ts`   | 90%       | 73.25%    | **未達** | 80%         | 83.82%      | PASS |
| 新規テストファイル本体 | 100%      | 100%      | PASS     | 100%        | 100%        | PASS |

---

## 未達分析と判断

`creatorHandlers.ts` の line カバレッジ 73.25% は目標 90% に未達。  
未カバー行（705-810, 815-817）は各ハンドラのコールバック内部のロジック（`deleteSession`, `cleanupExpiredSessions`, `getGovernanceState`, `isValidSkillOutputReadyPayload` 等）。

**スコープ判断**: 本タスクのスコープは「IPC ハンドラ登録完全性の確認」であり、仕様書に「各 IPC ハンドラの処理ロジックテストは含まない」と明記されている。line 90% の達成には既存ハンドラロジックテストの拡充が必要であるため、本タスクのスコープ外と判断する。

- **新規スナップショットテスト本体**: 100%（PASS）
- **`creatorHandlers.ts` branch**: 83.82%（PASS）
- **`creatorHandlers.ts` functions**: 100%（PASS）
- **`creatorHandlers.ts` line**: 73.25%（未達 / スコープ外のため未タスクとして記録）

---

## ゲート判定

| 判定        | 理由                                                         | アクション                                   |
| ----------- | ------------------------------------------------------------ | -------------------------------------------- |
| 条件付 PASS | 新規テストとbranch/functionsは目標達成。line未達はスコープ外 | Phase 8 へ進む。line課題は未タスクとして記録 |

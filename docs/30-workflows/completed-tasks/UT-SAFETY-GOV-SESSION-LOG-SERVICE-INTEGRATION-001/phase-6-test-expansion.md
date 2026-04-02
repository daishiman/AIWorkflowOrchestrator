# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 6                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 目的

Phase 4〜5 で作成・実装したコア機能に対して、エッジケースと境界値のテストを追加する。

## 追加テストケース

### ADV-20: `getTerminalLog` — output が空配列のセッション

セッションは存在するが `output` が空の場合、`[]` を返すこと（SESSION_NOT_FOUND にはならない）。

### ADV-21: `getCopyCommand` — args なしのセッション

`args: []` の場合に `scriptPath` のみを返すこと（末尾スペースなし）。

### ADV-22: `getCopyCommand` — 複数 args のセッション

`args: ["--skill", "mySkill"]` の場合に `"scriptPath --skill mySkill"` を返すこと。

### ADV-23: `getTerminalLog` — manager が null（初期化前）

`getClaudeCliManager()` が null を返す場合に `[]` を返すこと（graceful fallback）。

### ADV-24: `getCopyCommand` — manager が null（初期化前）

`getClaudeCliManager()` が null を返す場合に `null` を返すこと（graceful fallback）。

## 実行確認コマンド

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts
```

期待: ADV-12〜ADV-24 全 PASS

## 完了条件チェックリスト

- [ ] ADV-20〜ADV-24 のテストが作成されている
- [ ] ADV-20〜ADV-24 が全 PASS
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

境界値と graceful fallback を追加し、SessionManager の結果変化に対する回帰を防ぐ。

## 実行タスク

- output が空のケースを確認する。
- args なし / 複数 args のケースを確認する。
- manager null の fallback を確認する。

## 参照資料

- `phase-5-implementation.md`
- `outputs/phase-4/test-plan.md`
- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`

## 成果物/実行手順

- 追加テストを `advancedConsoleIpc.test.ts` に統合する。
- `pnpm --filter @repo/desktop test -- --reporter=verbose apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts` を再実行する。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`

# Phase 6 拡張テストケース

## 追加ケース（SubAgent-A主導）

- 追加先: `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`

1. 回帰ケース

- `unregister後に再登録できる`
- 目的: `handlersRegistered` が解除後に再登録可能であることを保証

2. 異常系ケース

- `未登録状態でunregisterしても安全に終了する`
- 目的: 未登録解除で副作用がないことを保証

3. 耐久ケース

- `register/unregisterを複数回繰り返しても状態が壊れない`
- 目的: サイクル実行で状態破綻しないことを保証

## 既存ケース再確認（SubAgent-B/C）

- `ipc-double-registration.test.ts` の再登録統合ケース
- `agentSlice.executeSkill.preflight.test.ts` の preflight 契約ケース
- `useSkillExecution.test.ts` の hook 連携ケース

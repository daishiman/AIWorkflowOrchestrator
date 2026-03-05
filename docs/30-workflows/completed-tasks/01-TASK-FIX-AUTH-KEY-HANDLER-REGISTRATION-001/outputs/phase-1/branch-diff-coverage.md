# Phase 1 差分カバレッジ

## 観測した実装ギャップ

| ID     | 観測                                           | 現状     | 必要対応                                     |
| ------ | ---------------------------------------------- | -------- | -------------------------------------------- |
| GAP-01 | Preload は `authKey.exists` を公開             | 実装済み | 維持                                         |
| GAP-02 | Main `registerAllIpcHandlers` で auth-key 登録 | 未実施   | `registerAuthKeyHandlers` を登録処理へ追加   |
| GAP-03 | activate再登録時の auth-key 状態同期           | 明示不足 | `unregisterAuthKeyHandlers` を解除処理へ追加 |
| GAP-04 | 回帰テスト（index経由のauth-key登録保証）      | 不足     | Redテスト追加                                |

## 影響範囲

- Main: `apps/desktop/src/main/ipc/index.ts`
- Test: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 既存契約確認: `apps/desktop/src/main/ipc/authKeyHandlers.ts`, `apps/desktop/src/preload/index.ts`

## カバレッジ方針

- 実装修正: GAP-02, GAP-03
- テスト修正: GAP-04
- 契約維持確認: GAP-01

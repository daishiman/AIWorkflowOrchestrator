# RuntimeResolver deprecated 削除タスク

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスクID   | UT-CLEANUP-RUNTIME-RESOLVER-001                    |
| 優先度     | 低                                                 |
| 依存       | 全 surface の IRuntimePolicyResolver 移行完了      |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001（DD-1） |

---

## 目的

全 surface が IRuntimePolicyResolver に移行完了した後、deprecated となった RuntimeResolver.ts を安全に削除する。

---

## 前提条件

- `grep -rn "RuntimeResolver" apps/desktop/src/` の結果が RuntimeResolver.ts 本体のみであること
- 全 surface が IRuntimePolicyResolver のみを参照していることが確認されていること

---

## 実行手順

1. `grep -rn "RuntimeResolver" apps/desktop/src/` で残存箇所を確認
2. RuntimeResolver.ts 本体以外に参照がないことを検証
3. RuntimeResolver.ts を削除
4. RuntimeResolver に関連する型定義・エクスポートを削除
5. 関連テストの更新（RuntimeResolver 専用テストがあれば削除）
6. `pnpm typecheck && pnpm lint && pnpm test` で品質確認

---

## 完了条件

- [ ] RuntimeResolver に関するコードが apps/desktop/ 内に存在しないこと（contract-matrix.md § 5 の参照記録を除く）
- [ ] 全テストが PASS すること
- [ ] IRuntimePolicyResolver 経由のポリシー解決が全 surface で正常動作すること

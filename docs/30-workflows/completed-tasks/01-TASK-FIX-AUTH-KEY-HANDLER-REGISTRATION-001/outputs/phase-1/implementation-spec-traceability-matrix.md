# Phase 1 実装仕様トレーサビリティ行列

| 要件ID | 要件                              | 仕様根拠                                     | 実装対象                                           | テスト対象                                                   |
| ------ | --------------------------------- | -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| FR-01  | auth-key 4チャネルを起動時登録    | api-ipc-system.md, ipc-contract-checklist.md | `main/ipc/index.ts`                                | `ipc-double-registration.test.ts`                            |
| FR-02  | activate再登録で4チャネル再有効化 | architecture-implementation-patterns.md      | `main/ipc/index.ts`, `main/ipc/authKeyHandlers.ts` | `ipc-double-registration.test.ts`                            |
| FR-03  | exists の存在判定契約維持         | interfaces-auth.md, api-ipc-system.md        | `main/ipc/authKeyHandlers.ts`                      | `authKeyHandlers.test.ts`                                    |
| FR-04  | 冪等な登録/解除                   | security-electron-ipc.md, lessons-learned.md | `main/ipc/index.ts`, `main/ipc/authKeyHandlers.ts` | `ipc-double-registration.test.ts`, `authKeyHandlers.test.ts` |
| NFR-01 | Preload/Renderer後方互換維持      | security-api-electron.md                     | 変更なし（確認のみ）                               | `useSkillExecution` / `agentSlice` 系                        |
| NFR-02 | セキュリティ維持                  | security-principles.md                       | 変更なし（確認のみ）                               | `authKeyHandlers.test.ts`                                    |

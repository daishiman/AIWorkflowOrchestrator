# Phase 1 ブランチ差分カバレッジ

## 対象差分（実装予定）

| 区分           | ファイル                                                              | 目的                                              |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| Main/IPC       | `apps/desktop/src/main/ipc/skillHandlers.ts`                          | SkillExecutor生成時にAuthKeyServiceを注入         |
| Main/IPC初期化 | `apps/desktop/src/main/ipc/index.ts`                                  | authKeyService単一生成と共有配線                  |
| テスト         | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | registerSkillHandlersへauthKeyService受け渡し検証 |

## 根因カバレッジ

| 根因                                    | 現状                                                   | 対応差分                                                  | カバー状態 |
| --------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- | ---------- |
| SkillExecutorにAuthKeyServiceが渡らない | `registerSkillHandlers` が2引数のみで生成              | `registerSkillHandlers` 第3引数追加 + constructor引き渡し | 対応予定   |
| 認証サービス生成順序が後段              | `registerSkillHandlers` 呼び出し後にAuthKeyService生成 | 生成順序を前倒しし同一インスタンス共有                    | 対応予定   |
| preflightとMain判定の経路分離           | Rendererは`auth-key:exists`、Mainは未注入時env依存     | 同一AuthKeyService参照で経路統一                          | 対応予定   |

## 仕様要件との対応

| 要件  | 差分対象                                            | 判定方法                |
| ----- | --------------------------------------------------- | ----------------------- |
| FR-01 | `skillHandlers.ts`                                  | 型・実装レビュー        |
| FR-02 | `index.ts`                                          | 呼び出し配線レビュー    |
| FR-03 | `skillHandlers.ts` + `SkillExecutor.ts`既存契約活用 | 認証連携テスト          |
| FR-04 | `skillHandlers.ts`既存契約維持                      | 既存execute契約テスト   |
| FR-05 | `skillHandlers.ts`                                  | 既存2引数呼び出しテスト |

## 非対象差分（除外）

- Renderer実装ファイルのロジック変更
- AuthKeyService内部ストレージ実装
- IPCチャンネル追加/削除

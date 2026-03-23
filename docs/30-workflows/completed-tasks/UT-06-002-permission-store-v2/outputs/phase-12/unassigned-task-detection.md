# 未タスク検出レポート

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | UT-06-002  |
| 検出日   | 2026-03-23 |
| 検出件数 | 7件        |

## 検出結果

### UT-1: permission-store-handlers sender 検証追加

| 項目   | 値                                                                      |
| ------ | ----------------------------------------------------------------------- |
| ソース | Phase 3 MINOR-01 + Phase 10 MINOR-01                                    |
| 優先度 | 中                                                                      |
| 対象   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`                |
| 内容   | 全4ハンドラに validateIpcSender を適用                                  |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-1-sender-validation.md` |

### UT-2: before-quit セッション終了フック実装

| 項目   | 値                                                                       |
| ------ | ------------------------------------------------------------------------ |
| ソース | Phase 10 MINOR-03                                                        |
| 優先度 | 中                                                                       |
| 対象   | `apps/desktop/src/main/index.ts`                                         |
| 内容   | `app.on('before-quit')` で `revokeSessionEntries("app-quit")` を呼び出し |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-2-before-quit-hook.md`   |

### UT-3: calcExpiresAtLocal 重複解消

| 項目   | 値                                                                       |
| ------ | ------------------------------------------------------------------------ |
| ソース | Phase 10 MINOR-05                                                        |
| 優先度 | 低                                                                       |
| 対象   | `apps/desktop/src/main/services/skill/PermissionStore.ts`                |
| 内容   | ESM/CJS 解決問題を調査し、`@repo/shared` からの直接インポートに切り替え  |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-3-calc-expires-dedup.md` |

### UT-4: permission-store-handlers ロガー統一

| 項目   | 値                                                                       |
| ------ | ------------------------------------------------------------------------ |
| ソース | Phase 10 MINOR-07                                                        |
| 優先度 | 低                                                                       |
| 対象   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`                 |
| 内容   | `console.error`/`console.info` を `electron-log` に統一                  |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-4-logger-unification.md` |

### UT-5: revokeTool ハンドラ P42準拠 3段バリデーション適用

| 項目   | 値                                                                          |
| ------ | --------------------------------------------------------------------------- |
| ソース | Phase 10 MINOR-02                                                           |
| 優先度 | 低                                                                          |
| 対象   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`                    |
| 内容   | `String(args?.toolName ?? "")` を P42準拠 3段バリデーションに置換           |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-5-revoke-p42-validation.md` |

### UT-6: ハンドラ引数型 IPermissionStoreV2 化 + as unknown as キャスト解消

| 項目   | 値                                                                      |
| ------ | ----------------------------------------------------------------------- |
| ソース | Phase 10 MINOR-04 + MINOR-06                                            |
| 優先度 | 低                                                                      |
| 対象   | `permission-store-handlers.ts`, `PermissionStore.ts`                    |
| 内容   | 引数型 V1→V2 変更、ElectronStore 型パラメータ V2 化、as unknown as 除去 |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-6-handler-type-v2.md`   |

### UT-7: unregisterPermissionStoreHandlers テスト追加

| 項目   | 値                                                                            |
| ------ | ----------------------------------------------------------------------------- |
| ソース | テスト品質検証（Function Coverage 50% → 80%未達）                             |
| 優先度 | 低                                                                            |
| 対象   | `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts`       |
| 内容   | unregister 関数のテスト追加で Function Coverage 80%+ 達成                     |
| 指示書 | `docs/30-workflows/unassigned-task/UT-06-002-UT-7-unregister-handler-test.md` |

## 未タスク管理 3ステップ

| ステップ | 内容                                              | 状態 |
| -------- | ------------------------------------------------- | ---- |
| 1        | `docs/30-workflows/unassigned-task/` に指示書作成 | 完了 |
| 2        | `task-workflow.md` 残課題テーブルに登録           | 完了 |
| 3        | 関連仕様書に参照リンク追加                        | 完了 |

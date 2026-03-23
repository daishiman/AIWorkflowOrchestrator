# UT-SC-01-IPCRESULT-DEDUP: IpcResult<T> 型の二重定義解消

## メタ情報

```yaml
issue_number: 1513
```

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | UT-SC-01-IPCRESULT-DEDUP           |
| タスク名     | IpcResult 型の二重定義解消         |
| 優先度       | 低                                 |
| 分類         | リファクタリング                   |
| 見積もり規模 | 小規模                             |
| 検出元       | TASK-SC-01-IPC-WIRING-FIX Phase 10 |
| 作成日       | 2026-03-22                         |
| ステータス   | 未着手                             |

## 概要

`IpcResult<T>` インターフェースが `skillCreatorHandlers.ts` と `creatorHandlers.ts` の両方に定義されている。共通の場所に抽出して一元管理すべき。

## 影響範囲

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 対応方針

1. `apps/desktop/src/main/ipc/types.ts` に `IpcResult<T>` を定義
2. 両ファイルから重複定義を削除し、共通型をインポート
3. 既存テストが全 PASS することを確認

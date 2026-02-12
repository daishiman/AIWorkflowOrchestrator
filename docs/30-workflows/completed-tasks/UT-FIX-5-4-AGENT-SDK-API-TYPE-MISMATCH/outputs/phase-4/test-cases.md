# UT-FIX-5-4 テストケース一覧

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 4          |
| タスクID | UT-FIX-5-4 |
| 作成日   | 2026-02-10 |

## ランタイムテスト (agentSDKAPI.abort.test.ts)

| テストID     | テスト項目                                            | 期待結果                              | 状態   |
| ------------ | ----------------------------------------------------- | ------------------------------------- | ------ |
| ASDT-01      | `abort()` が `Promise` を返すことを検証               | 戻り値が `Promise` インスタンスである | 作成済 |
| ASDT-02      | `await abort()` でエラーなく待機できることを検証      | `await` 後に正常終了する              | 作成済 |
| ASDT-03      | IPC通信成功時にPromiseがresolveすることを検証         | `resolved` 状態になる                 | 作成済 |
| ASDT-04      | IPC通信失敗時にPromise rejectionが発生することを検証  | `rejected` 状態になる                 | 作成済 |
| ASDT-05      | 他のAgentSDKAPIメソッドと戻り値型が一貫していること   | 全メソッドがPromiseを返す             | 作成済 |
| ASDT-SAFE-01 | safeInvokeがAGENT_ABORTチャンネルで正しく呼び出される | 正しいチャンネルで呼び出し            | 作成済 |
| ASDT-SAFE-02 | 引数なしで呼び出し可能                                | チャンネル名のみで呼び出し            | 作成済 |

## 型レベルテスト (agentSDKAPI.types.test.ts)

| テストID     | テスト項目                                      | 期待結果           | 状態         |
| ------------ | ----------------------------------------------- | ------------------ | ------------ |
| ASDT-TYPE-01 | abort()がPromise<void>を返すこと                | 型が一致           | 作成済 (Red) |
| ASDT-TYPE-02 | abort()が引数なしの関数であること               | パラメータが空配列 | 作成済       |
| ASDT-TYPE-03 | abort()がdestroySessionと同じ戻り値型であること | 型が一致           | 作成済 (Red) |
| ASDT-TYPE-04 | abort()がresumeSessionと同じ戻り値型であること  | 型が一致           | 作成済 (Red) |
| ASDT-TYPE-05 | abort()がqueryと同じ戻り値型であること          | 型が一致           | 作成済 (Red) |

## Red状態のテスト（Phase 5で修正予定）

以下のテストは現在の型定義 `abort: () => void` では失敗する:

1. **ASDT-TYPE-01**: `abort()` が `void` を返すため、`Promise<void>` との型不一致
2. **ASDT-TYPE-03〜05**: 他メソッドは `Promise<void>` を返すが、`abort()` は `void`

## 次のPhase

Phase 5で型定義を修正し、Red状態のテストをGreen状態にする。

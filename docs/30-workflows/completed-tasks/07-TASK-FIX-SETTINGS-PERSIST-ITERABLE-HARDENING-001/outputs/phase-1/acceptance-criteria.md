# 受入基準

## タスク ID

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001

## 受入基準一覧

### AC-01: viewHistory が配列以外の値でも settings 遷移が例外なく継続するか

| 項目     | 内容                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 条件     | `state.viewHistory` が `undefined`、`null`、`"string"`、`123`、`{}` のいずれかである状態で `setCurrentView("settings")` を呼び出す |
| 期待結果 | `TypeError` が発生せず、`currentView` が `"settings"` に遷移し、`viewHistory` が有効な配列に復旧する                               |
| 判定     | Yes                                                                                                                                |

### AC-02: expandedFolders が iterable でない値でも hydrate が成功し、空 Set に復旧するか

| 項目     | 内容                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 条件     | localStorage に `expandedFolders` が `null`、`undefined`、`123`、`"string"`、`{}` のいずれかとして保存された状態で `customStorage.getItem()` を呼び出す |
| 期待結果 | `TypeError` が発生せず、`expandedFolders` が空の `Set` (`new Set()`) として復元される                                                                   |
| 判定     | Yes                                                                                                                                                     |

### AC-03: expandedFolders の setItem で非 Set 値が安全に配列化されるか

| 項目     | 内容                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 条件     | `state.expandedFolders` が `undefined`、`null`、`[]`、`["a", "b"]`（配列）、`"string"` のいずれかで `customStorage.setItem()` を呼び出す |
| 期待結果 | `TypeError` が発生せず、`expandedFolders` が有効な配列（非 Set の場合は `[]`）として JSON 直列化される                                   |
| 判定     | Yes                                                                                                                                      |

### AC-04: 破損 persist snapshot を使うユニットテストが存在するか

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 条件     | テストスイートに以下のケースが含まれること                                            |
| 期待結果 | (a) `expandedFolders` が非 iterable な値を持つ localStorage データでの getItem テスト |
|          | (b) `expandedFolders` が非 Set な値での setItem テスト                                |
|          | (c) `viewHistory` が非配列な値での setCurrentView テスト                              |
|          | (d) 各ケースで例外が発生せず、安全なデフォルト値に復旧することの検証                  |
| 判定     | Yes                                                                                   |

### AC-05: 既存の infinite-loop-prevention テストが引き続き PASS するか

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 条件     | 修正後にプロジェクトの既存テストスイートを実行する                            |
| 期待結果 | infinite-loop-prevention 関連テスト（P31 対策）を含む全既存テストが PASS する |
| 判定     | Yes                                                                           |

## 検証方法

| AC    | 検証手段                                                           |
| ----- | ------------------------------------------------------------------ |
| AC-01 | ユニットテスト: 非配列 viewHistory での setCurrentView 呼び出し    |
| AC-02 | ユニットテスト: 破損 localStorage データでの customStorage.getItem |
| AC-03 | ユニットテスト: 非 Set expandedFolders での customStorage.setItem  |
| AC-04 | テストファイルの存在確認とテストケース網羅性の確認                 |
| AC-05 | `pnpm --filter @repo/desktop test` の全テスト PASS 確認            |

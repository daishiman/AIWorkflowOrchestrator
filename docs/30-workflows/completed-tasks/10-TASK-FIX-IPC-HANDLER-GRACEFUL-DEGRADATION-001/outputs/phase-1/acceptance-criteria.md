# 受け入れ基準: IPC Handler Graceful Degradation

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| Phase    | 1 - 要件定義                                     |
| 作成日   | 2026-03-08                                       |

## 受け入れ基準

### AC-01: 単一障害でも後続登録が継続する

- **Given**: `registerAllIpcHandlers()` が呼び出される
- **When**: `registerSkillHandlers()` など 1 つの登録関数が例外を投げる
- **Then**:
  - [ ] 失敗したハンドラ名が記録される
  - [ ] `registerAuthKeyHandlers()` など依存のない後続登録が継続される

### AC-02: 失敗ハンドラ名がログへ出る

- **Given**: ハンドラ登録に失敗する
- **When**: `safeRegister` 相当の障害隔離処理が動く
- **Then**:
  - [ ] `[IPC] Failed to register {handlerName}: {message}` 形式でログが出力される
  - [ ] スタックトレースや生のホームディレクトリパスが出力されない

### AC-03: 失敗一覧を戻り値から取得できる

- **Given**: 複数ハンドラが失敗する
- **When**: `registerAllIpcHandlers()` が完了する
- **Then**:
  - [ ] `failureCount` が失敗件数と一致する
  - [ ] `failures` に `handlerName` / `errorMessage` / `errorCode: 4001` が含まれる

### AC-04: 正常系の既存挙動を維持する

- **Given**: 全ハンドラが正常に登録される
- **When**: `registerAllIpcHandlers()` が呼び出される
- **Then**:
  - [ ] `failureCount` は 0 である
  - [ ] `failures` は空配列である
  - [ ] 既存の正常起動動作に退行がない

### AC-05: 再登録フローが成立する

- **Given**: 一度 `registerAllIpcHandlers()` が呼び出されている
- **When**: `unregisterAllIpcHandlers()` の後に再度 `registerAllIpcHandlers()` を実行する
- **Then**:
  - [ ] 再登録後も正常に `failureCount === 0` を返せる
  - [ ] 非 IPC リスナーを含めて解除対称性が維持される

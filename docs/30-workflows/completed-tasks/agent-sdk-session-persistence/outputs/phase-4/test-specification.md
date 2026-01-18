# Phase 4: テスト仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | テスト仕様書                  |
| Phase      | 4                             |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 完了                          |

---

## 1. 概要

セッション永続化機能のテスト仕様を定義する。TDD Redフェーズとして、実装前に失敗するテストを作成した。

---

## 2. テストファイル一覧

| ファイル                          | 種別     | テスト数 |
| --------------------------------- | -------- | -------- |
| SessionPersistenceService.test.ts | ユニット | 18       |
| SessionStorage.test.ts            | ユニット | 15       |
| session-ipc.integration.test.ts   | 統合     | 14       |
| **合計**                          | -        | **47**   |

---

## 3. テストケース一覧

### 3.1 SessionPersistenceService テスト

#### loadSessions

| ID  | テストケース                     | 期待結果           |
| --- | -------------------------------- | ------------------ |
| S01 | セッションが存在しない場合       | 空配列を返す       |
| S02 | 永続化されたセッションがある場合 | 全セッションを返す |
| S03 | lastAccessedAtでソート           | 降順でソートされる |

#### saveSession

| ID  | テストケース           | 期待結果                |
| --- | ---------------------- | ----------------------- |
| S04 | 新規セッション保存     | セッションが保存される  |
| S05 | lastAccessedAt自動更新 | 保存時に更新される      |
| S06 | 無効なデータの検証     | Zodエラーがスローされる |

#### deleteSession

| ID  | テストケース             | 期待結果               |
| --- | ------------------------ | ---------------------- |
| S07 | 存在するセッション削除   | セッションが削除される |
| S08 | 関連メッセージも削除     | カスケード削除される   |
| S09 | 存在しないセッション削除 | エラーがスローされる   |

#### updateSession

| ID  | テストケース             | 期待結果                   |
| --- | ------------------------ | -------------------------- |
| S10 | セッションフィールド更新 | 指定フィールドが更新される |
| S11 | id/createdAtは更新不可   | 更新されない               |

#### loadMessages

| ID  | テストケース                   | 期待結果               |
| --- | ------------------------------ | ---------------------- |
| S12 | メッセージが存在しない場合     | 空配列を返す           |
| S13 | 特定セッションのメッセージ取得 | 該当メッセージを返す   |
| S14 | ページネーション対応           | limit/offsetが機能する |

#### saveMessage

| ID  | テストケース         | 期待結果                |
| --- | -------------------- | ----------------------- |
| S15 | メッセージ保存       | メッセージが保存される  |
| S16 | messageCount自動更新 | カウントが増加する      |
| S17 | 無効なデータの検証   | Zodエラーがスローされる |

#### clearAll / getStorageStats / enforceStorageLimits

| ID  | テストケース       | 期待結果                    |
| --- | ------------------ | --------------------------- |
| S18 | 全データ削除       | 全セッション/メッセージ削除 |
| S19 | ストレージ統計取得 | 正しい統計情報を返す        |
| S20 | LRU削除            | 古いセッションが削除される  |

---

### 3.2 SessionStorage テスト

#### constructor

| ID  | テストケース     | 期待結果                 |
| --- | ---------------- | ------------------------ |
| T01 | デフォルト初期化 | インスタンスが作成される |
| T02 | カスタムストア名 | 指定名で初期化される     |

#### getSessions / setSessions

| ID  | テストケース           | 期待結果                   |
| --- | ---------------------- | -------------------------- |
| T03 | セッションなし時の取得 | 空配列を返す               |
| T04 | セッション一覧取得     | 保存済みセッションを返す   |
| T05 | セッション保存         | セッションが保存される     |
| T06 | 既存セッション上書き   | 新しいデータで上書きされる |
| T07 | メタデータ自動更新     | lastUpdatedが更新される    |

#### getMessages / setMessages / deleteMessages

| ID  | テストケース                   | 期待結果                   |
| --- | ------------------------------ | -------------------------- |
| T08 | メッセージなし時の取得         | 空配列を返す               |
| T09 | 特定セッションのメッセージ取得 | 該当メッセージを返す       |
| T10 | メッセージ保存                 | メッセージが保存される     |
| T11 | 他セッションへの影響なし       | 分離されている             |
| T12 | メッセージ削除                 | 該当メッセージが削除される |

#### getMetadata / setMetadata / clear

| ID  | テストケース   | 期待結果             |
| --- | -------------- | -------------------- |
| T13 | メタデータ取得 | メタデータを返す     |
| T14 | メタデータ更新 | 値が更新される       |
| T15 | 全データクリア | 全データが削除される |

#### calculateSize / validation

| ID  | テストケース               | 期待結果             |
| --- | -------------------------- | -------------------- |
| T16 | サイズ計算                 | 概算サイズを返す     |
| T17 | 無効なセッションデータ検証 | エラーがスローされる |
| T18 | 無効なメッセージデータ検証 | エラーがスローされる |

---

### 3.3 IPC統合テスト

#### session:persist:load

| ID  | テストケース     | 期待結果                |
| --- | ---------------- | ----------------------- |
| I01 | セッションなし時 | success: true, data: [] |
| I02 | セッションあり時 | 全セッションを返す      |

#### session:persist:save

| ID  | テストケース         | 期待結果                         |
| --- | -------------------- | -------------------------------- |
| I03 | 正常保存             | success: true                    |
| I04 | バリデーションエラー | success: false, VALIDATION_ERROR |

#### session:persist:delete

| ID  | テストケース         | 期待結果                          |
| --- | -------------------- | --------------------------------- |
| I05 | 正常削除             | success: true                     |
| I06 | 存在しないセッション | success: false, SESSION_NOT_FOUND |

#### session:persist:update

| ID  | テストケース         | 期待結果                          |
| --- | -------------------- | --------------------------------- |
| I07 | 正常更新             | success: true                     |
| I08 | 存在しないセッション | success: false, SESSION_NOT_FOUND |

#### session:persist:loadMessages / saveMessage

| ID  | テストケース                   | 期待結果                         |
| --- | ------------------------------ | -------------------------------- |
| I09 | メッセージ取得（なし）         | success: true, data: []          |
| I10 | メッセージ取得（あり）         | 該当メッセージを返す             |
| I11 | ページネーション               | limit/offsetが機能する           |
| I12 | メッセージ保存                 | success: true                    |
| I13 | メッセージバリデーションエラー | success: false, VALIDATION_ERROR |

#### session:persist:clearAll / getStats / cleanup

| ID  | テストケース       | 期待結果                         |
| --- | ------------------ | -------------------------------- |
| I14 | 全削除（確認あり） | success: true                    |
| I15 | 全削除（確認なし） | success: false, VALIDATION_ERROR |
| I16 | 統計取得           | StorageStatsを返す               |
| I17 | LRUクリーンアップ  | CleanupResultを返す              |

---

## 4. テストデータ定義

### 4.1 モックセッション

```typescript
const createMockSession = (
  overrides?: Partial<PersistedSession>,
): PersistedSession => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  lastAccessedAt: Date.now(),
  isActive: false,
  messageCount: 0,
  title: "Test Session",
  ...overrides,
});
```

### 4.2 モックメッセージ

```typescript
const createMockMessage = (
  sessionId: string,
  overrides?: Partial<PersistedMessage>,
): PersistedMessage => ({
  id: crypto.randomUUID(),
  sessionId,
  role: "user",
  content: "Test message",
  timestamp: Date.now(),
  ...overrides,
});
```

---

## 5. モック定義

### 5.1 electron-store モック

```typescript
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    store: {},
  })),
}));
```

### 5.2 IPC モック

```typescript
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};

const mockHandlers = new Map<string, Function>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: Function) => {
      mockHandlers.set(channel, handler);
    },
    removeHandler: (channel: string) => {
      mockHandlers.delete(channel);
    },
  },
}));
```

---

## 6. テスト実行方法

### 6.1 全テスト実行

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="session"
```

### 6.2 個別ファイル実行

```bash
# SessionPersistenceService
pnpm --filter @repo/desktop test -- SessionPersistenceService.test.ts

# SessionStorage
pnpm --filter @repo/desktop test -- SessionStorage.test.ts

# IPC統合テスト
pnpm --filter @repo/desktop test -- session-ipc.integration.test.ts
```

### 6.3 カバレッジ付き実行

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="session"
```

### 6.4 ウォッチモード

```bash
pnpm --filter @repo/desktop test -- --watch --testPathPattern="session"
```

---

## 7. TDD Red状態の確認

### 7.1 期待される失敗

全47テストが以下の理由で失敗する：

1. **モジュール未存在**: `SessionPersistenceService`, `SessionStorage`が未実装
2. **IPCハンドラー未登録**: `registerSessionPersistenceHandlers`が未実装
3. **型未定義**: `@repo/shared`にPersistence関連型が未定義

### 7.2 Red状態確認コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="session" 2>&1 | head -50
```

期待される出力：

```
FAIL  src/main/services/session/__tests__/SessionPersistenceService.test.ts
FAIL  src/main/services/session/__tests__/SessionStorage.test.ts
FAIL  src/main/services/session/__tests__/session-ipc.integration.test.ts
```

---

## 8. 完了条件

- [x] テストケース一覧が整理されている
- [x] テストデータ・モック定義が整理されている
- [x] テスト実行方法が記載されている
- [x] TDD Red状態の確認方法が記載されている

---

## 9. 次のPhaseへの引き継ぎ

### Phase 5（実装）での目標

- 全47テストをGreen状態にする
- テストが示す仕様に従って実装を行う

### 参照すべき設計書

| 設計書                 | 用途                |
| ---------------------- | ------------------- |
| architecture-design.md | コンポーネント構成  |
| type-definitions.md    | 型定義・Zodスキーマ |
| ipc-design.md          | IPCチャンネル設計   |
| persistence-design.md  | electron-store設計  |

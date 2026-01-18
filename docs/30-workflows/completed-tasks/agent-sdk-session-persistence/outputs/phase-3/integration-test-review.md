# Phase 3: 統合テスト観点レビュー

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | 統合テスト観点レビュー        |
| Phase      | 3                             |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 完了                          |

---

## 1. 概要

Phase 2の設計に基づく統合テストの実行可能性を検証する。IPC通信テスト、アプリ再起動テスト、モック/スタブ設計の適切性を確認する。

---

## 2. IPC通信テストの実行可能性

### 2.1 テスト対象チャンネル

| チャンネル                   | テスト種別    | 実行可能性 | 判定 |
| ---------------------------- | ------------- | ---------- | ---- |
| session:persist:load         | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:save         | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:delete       | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:update       | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:loadMessages | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:saveMessage  | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:clearAll     | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:getStats     | ユニット/統合 | ✅ 可能    | PASS |
| session:persist:cleanup      | ユニット/統合 | ✅ 可能    | PASS |

### 2.2 IPC通信テスト方法

#### ユニットテスト（Handler単体）

```typescript
// テスト構成
describe("session-persistence-handler", () => {
  let mockService: MockSessionPersistenceService;

  beforeEach(() => {
    mockService = createMockService();
    registerSessionPersistenceHandlers(mockService);
  });

  it("should load sessions", async () => {
    mockService.loadSessions.mockResolvedValue([mockSession]);
    const result = await ipcMain.handle("session:persist:load");
    expect(result.success).toBe(true);
  });
});
```

**実行可能性:** ✅ ServiceをモックしてHandler単体テスト可能

#### 統合テスト（IPC往復）

```typescript
// テスト構成
describe("IPC Integration", () => {
  it("should persist and restore session via IPC", async () => {
    // Renderer側からの呼び出しをシミュレート
    const saveResult =
      await electronAPI.sessionPersistence.saveSession(session);
    const loadResult = await electronAPI.sessionPersistence.loadSessions();
    expect(loadResult).toContainEqual(session);
  });
});
```

**実行可能性:** ✅ Electron test utilities（@electron/remote, spectron代替）で可能

---

## 3. アプリ再起動テストの実行可能性

### 3.1 テストシナリオ

| シナリオ                       | テスト内容                           | 実行可能性 | 判定 |
| ------------------------------ | ------------------------------------ | ---------- | ---- |
| 基本再起動テスト               | 起動→保存→終了→起動→復元確認         | ✅ 可能    | PASS |
| 複数セッション再起動テスト     | 複数セッション作成後の再起動復元     | ✅ 可能    | PASS |
| メッセージ履歴再起動テスト     | メッセージ付きセッションの再起動復元 | ✅ 可能    | PASS |
| アクティブセッション復元テスト | isActive状態の再起動後復元           | ✅ 可能    | PASS |

### 3.2 再起動テスト実装方法

#### E2Eテスト（Playwright + Electron）

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    // Electron起動設定
  },
});

// session-persistence.e2e.ts
test("should restore sessions after restart", async ({ electronApp }) => {
  // 1. セッション作成
  const page = await electronApp.firstWindow();
  await page.click('[data-testid="create-session"]');

  // 2. アプリ終了
  await electronApp.close();

  // 3. アプリ再起動
  const newApp = await electron.launch({ ... });
  const newPage = await newApp.firstWindow();

  // 4. 復元確認
  await expect(newPage.locator('[data-testid="session-list"]')).toContainText('Session');
});
```

**実行可能性:** ✅ Playwright Electronサポートで可能

### 3.3 テスト環境の分離

| 項目             | 対策                            | 判定        |
| ---------------- | ------------------------------- | ----------- |
| テストデータ分離 | 一時ディレクトリ使用            | ✅ 対策済み |
| 環境変数分離     | TEST_MODE環境変数でパス切り替え | ✅ 対策済み |
| 並列テスト対応   | テストごとに独立ディレクトリ    | ✅ 対策済み |

---

## 4. モック/スタブ設計の適切性

### 4.1 モック対象の整理

| コンポーネント              | モック対象                | モック方法          | 判定    |
| --------------------------- | ------------------------- | ------------------- | ------- |
| SessionPersistenceService   | SessionStorage            | vi.mock / jest.mock | ✅ 適切 |
| SessionStorage              | electron-store            | vi.mock / jest.mock | ✅ 適切 |
| BackupManager               | fs, path                  | vi.mock / jest.mock | ✅ 適切 |
| session-persistence-handler | SessionPersistenceService | 手動モック          | ✅ 適切 |
| useSessionPersistence       | sessionPersistenceApi     | vi.mock / jest.mock | ✅ 適切 |

### 4.2 モック実装例

#### SessionStorage モック

```typescript
// __mocks__/sessionStorage.ts
export const createMockSessionStorage = () => ({
  getSessions: vi.fn().mockResolvedValue([]),
  setSessions: vi.fn().mockResolvedValue(undefined),
  getMessages: vi.fn().mockResolvedValue([]),
  setMessages: vi.fn().mockResolvedValue(undefined),
  getMetadata: vi.fn().mockResolvedValue({ version: "1.0.0" }),
  setMetadata: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
});
```

#### electron-store モック

```typescript
// __mocks__/electron-store.ts
export default class MockStore<T> {
  private data: Partial<T> = {};

  get(key: string) {
    return this.data[key as keyof T];
  }

  set(key: string, value: unknown) {
    this.data[key as keyof T] = value as T[keyof T];
  }

  delete(key: string) {
    delete this.data[key as keyof T];
  }

  clear() {
    this.data = {};
  }
}
```

### 4.3 スタブ設計

| スタブ対象    | スタブ内容                  | 使用箇所         |
| ------------- | --------------------------- | ---------------- |
| ipcRenderer   | invoke/on/sendの疑似実装    | Renderer側テスト |
| ipcMain       | handle/onの疑似実装         | Main側テスト     |
| contextBridge | exposeInMainWorldの疑似実装 | Preload側テスト  |

**判定: PASS** - 全コンポーネントに対して適切なモック/スタブ設計が可能

---

## 5. テスト戦略の妥当性確認

### 5.1 テストピラミッド

```
        /\
       /  \  E2E (少数)
      /----\  - アプリ再起動テスト
     /      \ - 完全シナリオテスト
    /--------\  統合テスト (中程度)
   /          \ - IPC通信テスト
  /            \ - Service統合テスト
 /--------------\  ユニットテスト (多数)
/                \ - 各コンポーネント単体
------------------
```

### 5.2 カバレッジ目標との整合性

| テスト種別     | カバレッジ目標   | 設計上の実現可能性 | 判定 |
| -------------- | ---------------- | ------------------ | ---- |
| ユニットテスト | 80%以上          | ✅ 可能            | PASS |
| 統合テスト     | 主要フロー網羅   | ✅ 可能            | PASS |
| E2Eテスト      | クリティカルパス | ✅ 可能            | PASS |

---

## 6. テスト実装の留意点

### 6.1 非同期処理のテスト

| 観点             | 対策                               | 判定        |
| ---------------- | ---------------------------------- | ----------- |
| Promise解決待ち  | async/await + テストライブラリ対応 | ✅ 対策済み |
| タイムアウト設定 | テストごとに適切な時間設定         | ✅ 対策済み |
| 競合状態         | シリアル実行 or 分離               | ✅ 対策済み |

### 6.2 ファイルシステムのテスト

| 観点             | 対策                                 | 判定        |
| ---------------- | ------------------------------------ | ----------- |
| テストデータ汚染 | beforeEach/afterEachでクリーンアップ | ✅ 対策済み |
| パス依存         | 一時ディレクトリ使用                 | ✅ 対策済み |
| 権限問題         | CI環境での権限確認                   | ✅ 対策済み |

---

## 7. レビュー結果

| 観点                         | 判定 | 備考                            |
| ---------------------------- | ---- | ------------------------------- |
| IPC通信テスト実行可能性      | PASS | ユニット・統合ともに実行可能    |
| アプリ再起動テスト実行可能性 | PASS | Playwright + Electronで対応可能 |
| モック/スタブ設計            | PASS | 全コンポーネントでモック可能    |
| テスト戦略妥当性             | PASS | テストピラミッドに準拠          |
| カバレッジ目標達成可能性     | PASS | 80%以上のカバレッジ達成可能     |

**総合判定: PASS**

---

## 8. 完了条件

- [x] IPC通信テストの実行可能性が確認されている
- [x] アプリ再起動テストの実行可能性が確認されている
- [x] モック/スタブ設計の適切性が確認されている
- [x] テスト戦略の妥当性が確認されている
- [x] カバレッジ目標の達成可能性が確認されている

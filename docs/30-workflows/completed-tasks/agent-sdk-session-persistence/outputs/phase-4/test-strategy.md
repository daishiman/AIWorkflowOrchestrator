# Phase 4: テスト戦略

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | テスト戦略                    |
| Phase      | 4                             |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 完了                          |

---

## 1. 概要

セッション永続化機能のテスト戦略を定義する。TDD（Test-Driven Development）アプローチに従い、実装前にテストを作成する。

---

## 2. テスト種別と対象

### 2.1 テストピラミッド

```
        /\
       /  \  E2E テスト（少数）
      /----\  アプリ再起動シナリオ
     /      \ 完全な永続化→復元フロー
    /--------\  統合テスト（中程度）
   /          \ IPC通信テスト
  /            \ electron-store連携
 /--------------\  ユニットテスト（多数）
/                \ SessionPersistenceService
------------------\ SessionStorage, BackupManager
```

### 2.2 テスト対象コンポーネント

| コンポーネント              | テスト種別 | 優先度 |
| --------------------------- | ---------- | ------ |
| SessionPersistenceService   | ユニット   | 高     |
| SessionStorage              | ユニット   | 高     |
| BackupManager               | ユニット   | 中     |
| MigrationManager            | ユニット   | 中     |
| session-persistence-handler | 統合       | 高     |
| sessionPersistenceApi       | 統合       | 高     |
| useSessionPersistence       | 統合       | 中     |

---

## 3. テストカバレッジ目標

### 3.1 カバレッジ基準

| メトリクス     | 目標値 | 最低許容値 |
| -------------- | ------ | ---------- |
| 行カバレッジ   | 90%    | 80%        |
| 分岐カバレッジ | 85%    | 75%        |
| 関数カバレッジ | 95%    | 85%        |

### 3.2 クリティカルパス

以下のパスは100%カバレッジを目標とする：

- セッション保存・復元フロー
- メッセージ保存・復元フロー
- LRU削除ロジック
- エラーハンドリング

---

## 4. モック戦略

### 4.1 モック対象

| 依存関係       | モック方法              | 理由                 |
| -------------- | ----------------------- | -------------------- |
| electron-store | vi.mock / in-memory実装 | ファイルシステム分離 |
| fs/path        | vi.mock                 | ファイル操作分離     |
| ipcMain        | 手動モック              | Electron依存分離     |
| ipcRenderer    | vi.mock                 | Electron依存分離     |

### 4.2 モック実装パターン

#### electron-store モック

```typescript
// __mocks__/electron-store.ts
export default class MockStore<T extends Record<string, unknown>> {
  private data: Partial<T> = {};
  private defaults: Partial<T>;

  constructor(options?: { defaults?: Partial<T> }) {
    this.defaults = options?.defaults ?? {};
    this.data = { ...this.defaults };
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.data[key] as T[K] | undefined;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.data[key] = value;
  }

  delete<K extends keyof T>(key: K): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = { ...this.defaults };
  }

  get store(): T {
    return this.data as T;
  }
}
```

#### IPC モック

```typescript
// test-utils/ipc-mock.ts
export const createMockIpcMain = () => {
  const handlers = new Map<string, Function>();

  return {
    handle: (channel: string, handler: Function) => {
      handlers.set(channel, handler);
    },
    invoke: async (channel: string, ...args: unknown[]) => {
      const handler = handlers.get(channel);
      if (!handler) throw new Error(`No handler for ${channel}`);
      return handler({}, ...args);
    },
    removeHandler: (channel: string) => {
      handlers.delete(channel);
    },
  };
};
```

---

## 5. テストデータ戦略

### 5.1 テストデータファクトリ

```typescript
// test-utils/factories.ts
import { v4 as uuidv4 } from "uuid";
import type { PersistedSession, PersistedMessage } from "@repo/shared";

export const createMockSession = (
  overrides?: Partial<PersistedSession>,
): PersistedSession => ({
  id: uuidv4(),
  createdAt: Date.now(),
  lastAccessedAt: Date.now(),
  isActive: false,
  messageCount: 0,
  title: "Test Session",
  ...overrides,
});

export const createMockMessage = (
  sessionId: string,
  overrides?: Partial<PersistedMessage>,
): PersistedMessage => ({
  id: uuidv4(),
  sessionId,
  role: "user",
  content: "Test message",
  timestamp: Date.now(),
  ...overrides,
});
```

### 5.2 境界値テストデータ

| テスト観点       | テストデータ               |
| ---------------- | -------------------------- |
| 空データ         | sessions: [], messages: {} |
| 最大セッション数 | 100セッション              |
| 最大メッセージ数 | 1000メッセージ/セッション  |
| 容量上限         | 50MB相当のデータ           |
| 不正データ       | 型不一致、欠損フィールド   |

---

## 6. テスト実行計画

### 6.1 実行順序

1. **ユニットテスト（Phase 4）**: Red状態確認
2. **実装（Phase 5）**: Green状態達成
3. **統合テスト（Phase 6）**: 統合シナリオ追加
4. **カバレッジ確認（Phase 7）**: 80%達成確認

### 6.2 実行コマンド

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="session"

# カバレッジ付き実行
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="session"

# ウォッチモード
pnpm --filter @repo/desktop test -- --watch --testPathPattern="session"
```

---

## 7. テスト環境

### 7.1 テストフレームワーク

| ツール                 | バージョン | 用途              |
| ---------------------- | ---------- | ----------------- |
| Vitest                 | ^2.x       | テストランナー    |
| @testing-library/react | ^15.x      | React Hook テスト |
| @playwright/test       | ^1.x       | E2Eテスト         |

### 7.2 環境分離

| 環境変数      | 値               | 説明             |
| ------------- | ---------------- | ---------------- |
| NODE_ENV      | test             | テストモード     |
| TEST_DATA_DIR | 一時ディレクトリ | テストデータ分離 |

---

## 8. 品質ゲート

### 8.1 Phase 4完了基準（TDD Red）

- [ ] 全テストファイルが作成されている
- [ ] テストが失敗することを確認（Red状態）
- [ ] テストケースが設計をカバーしている

### 8.2 Phase 5完了基準（TDD Green）

- [ ] 全テストが成功する（Green状態）
- [ ] 実装が設計に準拠している

### 8.3 Phase 7完了基準（カバレッジ）

- [ ] 行カバレッジ80%以上
- [ ] クリティカルパス100%カバー

---

## 9. リスクと対策

| リスク                   | 対策                                 |
| ------------------------ | ------------------------------------ |
| Electron依存のテスト困難 | モック戦略の徹底                     |
| 非同期処理のテスト不安定 | async/await、適切なタイムアウト      |
| テストデータ汚染         | beforeEach/afterEachでクリーンアップ |

---

## 10. 完了条件

- [x] テスト種別と対象が整理されている
- [x] テストカバレッジ目標が設定されている
- [x] モック戦略が決定されている
- [x] テストデータ戦略が策定されている
- [x] テスト実行計画が作成されている

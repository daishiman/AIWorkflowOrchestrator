# テスト仕様書: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-08                               |
| Phase        | 4 (テスト作成)                           |
| ドキュメント | テスト仕様書                             |

---

## 1. 概要

### 1.1 目的

TDD Red フェーズとして、認証キー管理基盤の実装より先にテストを作成する。テストは実装がない状態で失敗することを確認する。

### 1.2 テスト対象コンポーネント

| コンポーネント  | 責務                              | テストファイル             |
| --------------- | --------------------------------- | -------------------------- |
| AuthKeyService  | 認証キーの設定・取得・検証・削除  | AuthKeyService.test.ts     |
| SkillExecutor   | SDK 呼び出し時の認証キー連携      | SkillExecutor.auth.test.ts |
| authKeyHandlers | IPC ハンドラー（sender 検証含む） | authKeyHandlers.test.ts    |

---

## 2. テスト設計原則

### 2.1 TDD サイクル

1. **Red（失敗）**: テストを書き、実装なしで失敗することを確認
2. **Green（成功）**: テストを通す最小限の実装を行う
3. **Refactor（改善）**: コード品質を改善（テストは引き続き成功）

### 2.2 テストパターン

既存のテストファイルのパターンに準拠:

- `secureStorage.test.ts` - ストレージ暗号化テスト
- `SkillExecutor.test.ts` - SDK 連携テスト
- 既存 IPC ハンドラーテスト

### 2.3 モック戦略

| 依存モジュール       | モック方式            | 目的                     |
| -------------------- | --------------------- | ------------------------ |
| electron.safeStorage | `vi.mock('electron')` | 暗号化機能のシミュレート |
| electron-store       | モジュールモック      | ストレージ永続化のテスト |
| @anthropic-ai/sdk    | モジュールモック      | API 検証のテスト         |
| claude-agent-sdk     | モジュールモック      | SDK query() のテスト     |
| ipc-validator        | 関数モック            | sender 検証のテスト      |

---

## 3. テストファイル構成

### 3.1 ディレクトリ構造

```
apps/desktop/src/main/
├── services/
│   ├── auth/
│   │   └── __tests__/
│   │       └── AuthKeyService.test.ts      # 新規作成
│   └── skill/
│       └── __tests__/
│           └── SkillExecutor.auth.test.ts  # 新規作成
└── ipc/
    └── __tests__/
        └── authKeyHandlers.test.ts         # 新規作成
```

### 3.2 テストファイル責務

| ファイル                   | テスト対象         | カバレッジ目標 |
| -------------------------- | ------------------ | -------------- |
| AuthKeyService.test.ts     | サービス層ロジック | 90%            |
| SkillExecutor.auth.test.ts | SDK 認証連携       | 80%            |
| authKeyHandlers.test.ts    | IPC ハンドラー     | 90%            |

---

## 4. テストケース設計

### 4.1 AuthKeyService テストケース

#### 4.1.1 setKey

| テストケース                         | 期待結果                |
| ------------------------------------ | ----------------------- |
| 有効な API キーを保存できる          | 暗号化して store に保存 |
| safeStorage 不可時は警告を出して保存 | console.warn が呼ばれる |
| 空文字のキーはバリデーションエラー   | 例外スロー              |
| 無効なキー形式はバリデーションエラー | 例外スロー              |

#### 4.1.2 getKey

| テストケース               | 期待結果             |
| -------------------------- | -------------------- |
| 保存済みキーを復号して取得 | 復号されたキー文字列 |
| キー未設定時は null を返す | null                 |
| 環境変数からフォールバック | 環境変数の値         |

#### 4.1.3 deleteKey

| テストケース               | 期待結果                |
| -------------------------- | ----------------------- |
| 保存済みキーを削除         | store.delete が呼ばれる |
| 存在しないキーの削除は安全 | エラーなし              |
| 削除後はキャッシュもクリア | 再取得時に null         |

#### 4.1.4 validateKey

| テストケース               | 期待結果   |
| -------------------------- | ---------- |
| 有効なキーは true          | true       |
| 無効なキーは false         | false      |
| ネットワークエラーは false | false      |
| レートリミット時は例外     | 例外スロー |

#### 4.1.5 hasKey

| テストケース          | 期待結果 |
| --------------------- | -------- |
| キー設定時は true     | true     |
| キー未設定時は false  | false    |
| 環境変数のみでも true | true     |

### 4.2 SkillExecutor 認証連携テストケース

| テストケース                             | 期待結果                    |
| ---------------------------------------- | --------------------------- |
| AuthKeyService からキーを取得            | getKey() が呼ばれる         |
| キー未設定時は AUTHENTICATION_ERROR      | エラーレスポンス            |
| query() に apiKey オプションが設定される | options.apiKey が設定される |
| 環境変数フォールバック                   | 環境変数のキーが使用される  |
| AuthKeyService エラー時のハンドリング    | 適切なエラーレスポンス      |

### 4.3 authKeyHandlers テストケース

#### 4.3.1 auth-key:set

| テストケース         | 期待結果                                  |
| -------------------- | ----------------------------------------- |
| キーを保存できる     | { success: true }                         |
| バリデーションエラー | { success: false, error: "..." }          |
| sender 検証失敗      | { success: false, error: "Unauthorized" } |

#### 4.3.2 auth-key:validate

| テストケース     | 期待結果         |
| ---------------- | ---------------- |
| 有効なキーを検証 | { valid: true }  |
| 無効なキー       | { valid: false } |
| sender 検証失敗  | 例外スロー       |

#### 4.3.3 auth-key:delete

| テストケース     | 期待結果          |
| ---------------- | ----------------- |
| キーを削除できる | { success: true } |
| sender 検証失敗  | 例外スロー        |

#### 4.3.4 auth-key:exists

| テストケース           | 期待結果             |
| ---------------------- | -------------------- |
| キー設定あり           | { exists: true }     |
| キー設定なし           | { exists: false }    |
| レスポンスにキー値なし | key フィールドがない |

---

## 5. モック設計

### 5.1 electron モック

```typescript
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn(),
    encryptString: vi.fn(),
    decryptString: vi.fn(),
  },
}));
```

### 5.2 electron-store モック

```typescript
const mockStoreInstance = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

vi.mock("electron-store", () => ({
  default: vi.fn(() => mockStoreInstance),
}));
```

### 5.3 Anthropic SDK モック

```typescript
const mockAnthropicInstance = {
  messages: {
    create: vi.fn(),
  },
};

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(() => mockAnthropicInstance),
  Anthropic: vi.fn(() => mockAnthropicInstance),
}));
```

### 5.4 Claude Agent SDK モック

```typescript
const mockQuery = vi.fn().mockImplementation(() => ({
  stream: () => mockStreamGenerator(),
}));

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (args: unknown) => mockQuery(args),
}));
```

---

## 6. テスト実行

### 6.1 Red Phase 確認

```bash
# テストを実行して失敗を確認
pnpm --filter @repo/desktop test src/main/services/auth/__tests__/AuthKeyService.test.ts
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
pnpm --filter @repo/desktop test src/main/ipc/__tests__/authKeyHandlers.test.ts
```

### 6.2 期待される結果

- 全テストが `expect.fail()` で失敗する
- 失敗メッセージに "TDD Red Phase" が含まれる
- 実装完了後に `expect.fail()` を削除してテストを修正する

---

## 7. 完了条件

- [ ] 3つのテストファイルが作成されている
- [ ] 全テストケースが設計書に従って実装されている
- [ ] テスト実行時に全テストが失敗する（Red 状態）
- [ ] モックが適切に設定されている
- [ ] テスト仕様書が作成されている

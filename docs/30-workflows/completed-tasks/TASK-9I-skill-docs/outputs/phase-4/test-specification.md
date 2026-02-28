# TASK-9I テスト仕様書 (Phase 4)

## メタ情報

| 項目           | 値                                |
| -------------- | --------------------------------- |
| タスク ID      | TASK-9I-SKILL-DOCS                |
| Phase          | 4 (テスト作成)                    |
| 作成日         | 2026-02-28                        |
| テスト基盤     | Vitest 2.1.x                      |
| 対象パッケージ | `packages/shared`, `apps/desktop` |

## テストスコープ

### 3つのテストファイル

| #   | ファイルパス                                                               | テスト数 | カテゴリ | 対象                             |
| --- | -------------------------------------------------------------------------- | -------- | -------- | -------------------------------- |
| 1   | `packages/shared/src/types/__tests__/skill-docs.test.ts`                   | 8        | 型検証   | 5つの型インターフェース          |
| 2   | `apps/desktop/src/main/services/skill/__tests__/SkillDocGenerator.test.ts` | 24       | ユニット | SkillDocGenerator サービスクラス |
| 3   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.test.ts`           | 32       | ユニット | IPC ハンドラ（4チャンネル）      |

**合計: 64テスト**

## テスト環境

### テストフレームワーク

- **Vitest 2.1.x**: テストランナー・アサーション
- **vi.fn() / vi.mock()**: モック・スパイ
- **vi.hoisted()**: IPC テストでの `ipcMain.handle` マップ管理
- **vi.useFakeTimers()**: LLM タイムアウトテスト（G-16）

### テスト実行環境

- `packages/shared`: Node.js 環境（デフォルト）
- `apps/desktop`: happy-dom 環境（vitest.config.ts 設定）
- テスト実行は各パッケージディレクトリから行う（P40 対策）

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## モック戦略

### 1. electron モック（IPC テスト）

`vi.hoisted()` パターンで `ipcMain.handle` / `ipcMain.removeHandler` をモック化し、ハンドラ関数を `handlerMap` に登録・抽出して直接テストする。

```typescript
const { handlerMap, mockIpcMainHandle } = vi.hoisted(() => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  return {
    handlerMap: handlers,
    mockIpcMainHandle: vi.fn((channel, handler) => {
      handlers.set(channel, handler);
    }),
  };
});
```

### 2. ipc-validator モック

`validateIpcSender` と `toIPCValidationError` を `vi.hoisted()` で定義し、sender 検証の成功・失敗を切り替える。

### 3. SkillFileManager モック（サービステスト）

`readFile` と `listSkillFiles` を `vi.fn()` でモック化。`readFile` はスキルの SKILL.md 内容を返し、`listSkillFiles` はファイル一覧を返す。

### 4. fs/promises モック（exportToFile テスト）

`vi.mock("fs/promises")` でモジュール全体をモック化。`writeFile` の呼び出し引数を検証する。

### 5. LLMQueryFn モック（サービステスト）

`vi.fn().mockResolvedValue({ content: "Generated content" })` でLLM応答をモック化。タイムアウトテストでは `new Promise(() => {})` を返す。

## P42 準拠バリデーションテスト

全文字列引数に対して3段バリデーションを検証:

1. **型チェック**: `typeof` が `"string"` であること
2. **空文字列チェック**: `=== ""` で拒否
3. **トリム空文字列チェック**: `.trim() === ""` で拒否（スペースのみ入力の防止）

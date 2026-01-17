# テスト仕様書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 4                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、Claude Agent SDK統合に対するテスト設計を定義する。TDD原則に従い、実装前にテストを作成（Red状態）し、テストファーストで開発を進める。

---

## テスト戦略

### テストレベル

| レベル | 説明                         | ファイル                |
| ------ | ---------------------------- | ----------------------- |
| Unit   | 個々のモジュールの単体テスト | skill-executor.test.ts  |
| Unit   | 個々のモジュールの単体テスト | agent-client.test.ts    |
| 統合   | モジュール間の連携テスト     | sdk-integration.test.ts |

### テストフレームワーク

| ツール | 用途           |
| ------ | -------------- |
| Vitest | ユニットテスト |
| Vitest | 統合テスト     |
| vi     | モック・スパイ |

---

## テストカバレッジ目標

| メトリクス        | 目標値 |
| ----------------- | ------ |
| Line Coverage     | 80%+   |
| Branch Coverage   | 60%+   |
| Function Coverage | 80%+   |

### 対象ファイル

| ファイル          | Line目標 | Branch目標 | Function目標 |
| ----------------- | -------- | ---------- | ------------ |
| skill-executor.ts | 80%      | 60%        | 80%          |
| agent-client.ts   | 80%      | 60%        | 80%          |

---

## モック戦略

### AgentClientモック

```typescript
const mockAgentAPI = {
  query: vi.fn().mockResolvedValue({
    content: JSON.stringify({ changes: [] }),
    usage: { inputTokens: 100, outputTokens: 50 },
  }),
  abort: vi.fn(),
  getStatus: vi.fn().mockReturnValue("idle"),
  onMessage: vi.fn(() => () => {}),
};

vi.mock("../agent-client", () => ({
  getAgentAPI: vi.fn(() => mockAgentAPI),
  resetAgentAPI: vi.fn(),
}));
```

### Claude Agent SDKモック

```typescript
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: JSON.stringify({ changes: [] }) }],
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
    },
  })),
}));
```

### Electron safeStorageモック

```typescript
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn((str) => Buffer.from(str).toString("base64")),
    decryptString: vi.fn((buffer) => buffer.toString()),
  },
}));
```

---

## テスト実行方法

### コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト実行
pnpm --filter @repo/desktop test skill-executor
pnpm --filter @repo/desktop test agent-client
pnpm --filter @repo/desktop test sdk-integration

# カバレッジレポート生成
pnpm --filter @repo/desktop test:coverage
```

### 期待される結果（TDD: Red Phase）

- すべてのテストが失敗状態（Red）であること
- SDK統合後にテストがパスする設計になっていること

---

## テストケース概要

### skill-executor.test.ts

| カテゴリ       | テスト数 | 説明                         |
| -------------- | -------- | ---------------------------- |
| 基本動作       | 8        | execute, cancel, isExecuting |
| SDK統合        | 14       | SDK呼び出し、進捗、エラー    |
| Modifier Skill | 6        | 逆方向同期、結果フォーマット |

### agent-client.test.ts

| カテゴリ  | テスト数 | 説明                           |
| --------- | -------- | ------------------------------ |
| query     | 8        | クエリ実行、タイムアウト、中断 |
| abort     | 3        | 中断処理                       |
| getStatus | 4        | ステータス管理                 |
| onMessage | 4        | メッセージリスナー             |
| SDK統合   | 10       | APIキー、リクエスト設定、解析  |
| 境界値    | 3        | 空プロンプト、長文、最小TO     |

### sdk-integration.test.ts

| カテゴリ           | テスト数 | 説明                       |
| ------------------ | -------- | -------------------------- |
| API接続            | 2        | 初期化、認証               |
| データフロー       | 2        | 順方向、逆方向同期         |
| エラーハンドリング | 2        | SDK障害、タイムアウト      |
| 状態同期           | 1        | 進捗コールバック           |
| キャンセル         | 1        | 実行中キャンセル           |
| E2Eフロー          | 4        | 完全フロー、リカバリ       |
| 境界値             | 3        | 長パス、特殊文字、連続実行 |
| SDKシナリオ        | 5        | パラメータ、ストリーミング |

---

## 合計テストケース数

| ファイル                | テスト数 |
| ----------------------- | -------- |
| skill-executor.test.ts  | 28       |
| agent-client.test.ts    | 32       |
| sdk-integration.test.ts | 20       |
| **合計**                | **80**   |

---

## TDD状態確認

### Red Phase チェックリスト

- [x] skill-executor.tsのユニットテストが作成されている
- [x] agent-client.tsのユニットテストが作成されている
- [x] 統合テストシナリオが全カテゴリで定義されている
- [x] テストカバレッジ目標が設定されている
- [x] 境界値テストが含まれている
- [ ] すべてのテストが失敗状態（Red）

### 確認コマンド

```bash
# テスト実行（Red状態確認）
pnpm --filter @repo/desktop test

# 期待される結果
# - 一部のテストは現在のシミュレーション実装でパスする
# - SDK統合後にすべてのテストがパスする
```

---

## 次のステップ

Phase 5: 実装（TDD: Green） - テストをパスさせるための実装を行う

---

**作成日**: 2026-01-17
**Phase 4 テスト仕様書 完了**

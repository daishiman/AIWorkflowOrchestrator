# TASK-3-1-A テスト仕様書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-1-A |
| Phase      | 4          |
| 作成日     | 2026-01-24 |
| ステータス | 完了       |

---

## テスト方針

### TDD アプローチ

本タスクでは TDD（Test-Driven Development）の Red-Green-Refactor サイクルに従う。

1. **Red**: テストを先に作成（失敗状態）← Phase 4
2. **Green**: テストを通す実装 ← Phase 5
3. **Refactor**: リファクタリング ← Phase 8

---

## テストカテゴリ

### 1. ユニットテスト

| ファイル                                                               | 対象          | 目的                   |
| ---------------------------------------------------------------------- | ------------- | ---------------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` | SkillExecutor | メソッド単位の動作検証 |

### 2. 統合テスト

| ファイル                                                                           | 対象        | 目的               |
| ---------------------------------------------------------------------------------- | ----------- | ------------------ |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts` | SDK/IPC連携 | 実際の連携動作検証 |

---

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## モック戦略

### SDK モック

```typescript
// __mocks__/@anthropic-ai/claude-agent-sdk.ts
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn().mockResolvedValue({
    stream: vi.fn().mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield { type: "text", content: "Hello" };
        yield { type: "complete" };
      },
    }),
  }),
}));
```

### BrowserWindow モック

```typescript
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;
```

### UUID モック

```typescript
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("test-execution-id-1234"),
}));
```

---

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイル実行
pnpm --filter @repo/desktop test SkillExecutor

# カバレッジ付き実行
pnpm --filter @repo/desktop test --coverage

# ウォッチモード
pnpm --filter @repo/desktop test --watch
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |

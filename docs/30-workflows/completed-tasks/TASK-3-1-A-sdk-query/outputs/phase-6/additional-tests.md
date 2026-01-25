# Phase 6: 追加テスト一覧 - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目   | 内容                 |
| ------ | -------------------- |
| Phase  | 6                    |
| 作成日 | 2026-01-25           |
| 機能名 | TASK-3-1-A-sdk-query |

---

## 追加テスト概要

Phase 6で追加したテストケースの一覧。

### 追加テスト数

| カテゴリ                  | 追加数 |
| ------------------------- | ------ |
| Edge Cases                | 11     |
| Additional Error Handling | 5      |
| Integration - Extended    | 4      |
| **合計**                  | **20** |

---

## 1. エッジケーステスト（Edge Cases）

### 1.1 execute - edge cases

| テスト名                                    | 目的               | 検証内容                     |
| ------------------------------------------- | ------------------ | ---------------------------- |
| should handle empty prompt                  | 空プロンプト処理   | 空文字列でも実行が開始される |
| should handle very long prompt              | 長大プロンプト処理 | 10000文字のプロンプト対応    |
| should handle special characters in prompt  | 特殊文字処理       | XSS風文字列、引用符の処理    |
| should handle skill with empty allowedTools | 空ツールリスト     | allowedTools: [] での動作    |

### 1.2 stream handling - edge cases

| テスト名                                    | 目的                   | 検証内容                       |
| ------------------------------------------- | ---------------------- | ------------------------------ |
| should handle empty stream                  | 空ストリーム処理       | yield なしストリームの完了処理 |
| should handle stream with only errors       | エラーのみのストリーム | 複数エラーメッセージの処理     |
| should handle rapid message bursts          | 高速メッセージバースト | 100メッセージの連続処理        |
| should handle malformed messages gracefully | 不正メッセージ処理     | 未知フィールドのスキップ       |

### 1.3 abort - edge cases

| テスト名                                 | 目的               | 検証内容                  |
| ---------------------------------------- | ------------------ | ------------------------- |
| should handle abort before stream starts | ストリーム前中断   | 存在しないIDでのabort     |
| should handle multiple abort calls       | 複数回中断呼び出し | 2回連続abortの動作        |
| should handle abort after completion     | 完了後中断         | 実行完了後のabort呼び出し |

---

## 2. 追加エラーハンドリングテスト（Additional Error Handling）

| テスト名                                             | 目的                           | 検証内容                     |
| ---------------------------------------------------- | ------------------------------ | ---------------------------- |
| should handle network timeout with proper error code | タイムアウトエラーコード       | TIMEOUT エラーコード変換     |
| should handle rate limit error                       | レート制限エラー               | RateLimitError の処理        |
| should handle invalid response format                | 不正レスポンス                 | 文字列型メッセージの無視     |
| should clean up resources on error                   | エラー時リソースクリーンアップ | 状態が "error" に更新される  |
| should properly log errors with details              | エラーログ詳細                 | console.error の呼び出し確認 |

---

## 3. 統合テスト拡充（Integration - Extended）

| テスト名                                           | 目的                   | 検証内容                           |
| -------------------------------------------------- | ---------------------- | ---------------------------------- |
| should maintain message order in stream            | メッセージ順序保証     | First→Second→Third の順序維持      |
| should properly serialize tool_use message content | ツール使用シリアライズ | JSON.stringify による content 変換 |
| should include timestamp in all messages           | タイムスタンプ必須     | 全メッセージに timestamp 含む      |
| should handle execution with custom timeout        | カスタムタイムアウト   | timeout: 5000 の処理               |

---

## テストファイル構成

```
apps/desktop/src/main/services/skill/__tests__/
├── SkillExecutor.test.ts        # Phase 4 + Phase 6 テスト (48件)
└── SkillExecutor.integration.test.ts  # 統合テスト（別ファイル）
```

---

## テスト実行コマンド

```bash
# SkillExecutor テストのみ実行
pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.test.ts

# カバレッジ付き実行
pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.test.ts --coverage
```

---

## コードスニペット

### Edge Cases テスト例

```typescript
describe("Edge Cases", () => {
  describe("execute - edge cases", () => {
    it("should handle empty prompt", async () => {
      const emptyRequest: SkillExecutionRequest = {
        prompt: "",
        skillId: "test-skill",
      };

      const response = await executor.execute(emptyRequest, mockSkill);
      expect(response.executionId).toBeDefined();
    });

    it("should handle rapid message bursts", async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        type: "text",
        content: `Message ${i}`,
      }));

      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const msg of messages) {
            yield msg;
          }
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(true);
      expect(mockWebContents.send).toHaveBeenCalledTimes(101); // 100 + complete
    });
  });
});
```

---

## 参考資料

| 資料           | パス                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`         |
| Phase 6 仕様書 | `docs/30-workflows/TASK-3-1-A-sdk-query/phase-6-test-expansion.md`             |
| Phase 4 テスト | `docs/30-workflows/TASK-3-1-A-sdk-query/outputs/phase-4/test-specification.md` |

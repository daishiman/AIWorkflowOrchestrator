# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 6                           |
| Phase名    | テスト拡充                  |
| 前提Phase  | Phase 5                     |
| 後続Phase  | Phase 7                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

カバレッジ目標達成に向けた追加テストを作成し、エッジケースや異常系を網羅する。

## 背景

Phase 5 で基本実装が完了した。
本 Phase では、テストカバレッジを向上させ、実装の品質を高める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: 境界値や特殊ケースのテストを追加する

**実行手順**:

1. 境界値テストを追加する
2. 空値・null のハンドリングテストを追加する
3. 特殊文字のハンドリングテストを追加する

**テストケース**:

```typescript
describe("SkillExecutor - Edge Cases", () => {
  describe("sanitizeArgs エッジケース", () => {
    it("should handle empty args object", () => {
      const result = executor.sanitizeArgs({});
      expect(result).toEqual({});
    });

    it("should handle null values", () => {
      const result = executor.sanitizeArgs({ key: null });
      expect(result.key).toBeNull();
    });

    it("should handle undefined values", () => {
      const result = executor.sanitizeArgs({ key: undefined });
      expect(result.key).toBeUndefined();
    });

    it("should handle exactly 500 character strings", () => {
      const exactString = "a".repeat(500);
      const result = executor.sanitizeArgs({ content: exactString });
      expect(result.content).toBe(exactString);
    });

    it("should handle 501 character strings", () => {
      const longString = "a".repeat(501);
      const result = executor.sanitizeArgs({ content: longString });
      expect(result.content).toBe("a".repeat(500) + "... (省略)");
    });

    it("should handle deeply nested objects", () => {
      const args = {
        level1: {
          level2: {
            level3: {
              password: "secret",
            },
          },
        },
      };
      const result = executor.sanitizeArgs(args);
      expect(result.level1.level2.level3.password).toBe("[REDACTED]");
    });

    it("should handle arrays with mixed types", () => {
      const args = {
        items: ["string", 123, { password: "secret" }],
      };
      const result = executor.sanitizeArgs(args);
      expect(result.items).toEqual(args.items); // 配列は変更しない
    });

    it("should handle special characters in keys", () => {
      const args = { "special-key": "value" };
      const result = executor.sanitizeArgs(args);
      expect(result["special-key"]).toBe("value");
    });
  });

  describe("getPermissionReason エッジケース", () => {
    it("should handle empty command", () => {
      const reason = executor.getPermissionReason("Bash", { command: "" });
      expect(reason).toBe("コマンドを実行: ");
    });

    it("should handle missing file_path", () => {
      const reason = executor.getPermissionReason("Write", {});
      expect(reason).toBe("ファイルを作成: ");
    });

    it("should handle exactly 100 character command", () => {
      const command = "a".repeat(100);
      const reason = executor.getPermissionReason("Bash", { command });
      expect(reason).toBe(`コマンドを実行: ${command}`);
    });

    it("should handle 101 character command", () => {
      const command = "a".repeat(101);
      const reason = executor.getPermissionReason("Bash", { command });
      expect(reason.length).toBe("コマンドを実行: ".length + 100);
    });
  });
});
```

**期待される成果物**:

- エッジケーステストの追加

---

### タスク2: 異常系テスト追加

**目的**: エラーハンドリングのテストを追加する

**実行手順**:

1. ネットワークエラーのハンドリングテストを追加する
2. 中断（Abort）のハンドリングテストを追加する
3. 予期せぬエラーのハンドリングテストを追加する

**テストケース**:

```typescript
describe("SkillExecutor - Error Handling", () => {
  describe("PermissionRequest エラーハンドリング", () => {
    it("should handle AbortError gracefully", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      mockPermissionResolver.waitForResponse.mockRejectedValue(abortError);

      // Hook 呼び出しと結果検証
      // expect(result).toEqual({
      //   proceed: false,
      //   message: "権限確認がタイムアウトしました",
      // });
    });

    it("should handle unexpected errors", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Unexpected error"),
      );

      // Hook 呼び出しと結果検証
      // expect(result).toEqual({
      //   proceed: false,
      //   message: "権限確認がタイムアウトしました",
      // });
    });

    it("should handle null response from resolver", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue(null);

      // 適切なエラーハンドリングの検証
    });
  });

  describe("handlePermissionResponse エラーハンドリング", () => {
    it("should handle unknown requestId gracefully", () => {
      // 存在しないrequestIdでもエラーにならないことを確認
      expect(() => {
        executor.handlePermissionResponse("unknown-id", true);
      }).not.toThrow();
    });
  });
});
```

**期待される成果物**:

- 異常系テストの追加

---

### タスク3: 統合テスト追加

**目的**: コンポーネント間の連携をテストする

**実行手順**:

1. SkillExecutor と PermissionResolver の連携テストを追加する
2. IPC チャネルを介した通信テストを追加する

**テストケース**:

```typescript
describe("SkillExecutor - Integration Tests", () => {
  describe("SkillExecutor と PermissionResolver 連携", () => {
    it("should correctly pass requestId between request and response", async () => {
      const capturedRequestId: string[] = [];

      mockMainWindow.webContents.send.mockImplementation((channel, data) => {
        if (channel === "skill:permission:request") {
          capturedRequestId.push(data.requestId);
          // 即座に応答をシミュレート
          executor.handlePermissionResponse(data.requestId, true);
        }
      });

      mockPermissionResolver.waitForResponse.mockImplementation((requestId) => {
        return Promise.resolve({
          requestId,
          approved: true,
        });
      });

      // Hook 実行と検証
    });

    it("should maintain execution context across permission flow", async () => {
      const executionId = "exec-123";

      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-123",
        approved: true,
      });

      // 実行コンテキストが維持されることを検証
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          executionId,
        }),
      );
    });
  });

  describe("IPC 通信連携", () => {
    it("should send correctly formatted permission request", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // IPC メッセージの形式検証
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          executionId: expect.any(String),
          requestId: expect.any(String),
          toolName: expect.any(String),
          args: expect.any(Object),
          reason: expect.any(String),
        }),
      );
    });

    it("should send status updates at correct timing", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // ステータス更新のタイミング検証
      const sendCalls = mockMainWindow.webContents.send.mock.calls;

      // 権限リクエスト前に「権限が必要」ステータス
      // 承認後に「許可されました」ステータス
    });
  });
});
```

**期待される成果物**:

- 統合テストの追加

---

### タスク4: カバレッジ確認

**目的**: テストカバレッジが目標に達しているか確認する

**実行手順**:

1. カバレッジレポートを生成する
2. 目標カバレッジと比較する
3. 不足している箇所を特定する

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --coverage --run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
```

**目標カバレッジ**:

| メトリクス        | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**期待される成果物**:

- カバレッジレポート
- 不足箇所の特定

---

### タスク5: 追加テスト実装（カバレッジ不足時）

**目的**: カバレッジ不足箇所のテストを追加する

**実行手順**:

1. カバレッジレポートから不足箇所を特定する
2. 不足箇所のテストを追加する
3. 再度カバレッジを確認する

**期待される成果物**:

- 追加テスト
- 更新されたカバレッジレポート

---

## 参照資料

| 参照資料             | パス                | 内容           |
| -------------------- | ------------------- | -------------- |
| Phase 4 テスト       | `outputs/phase-04/` | 基本テスト     |
| Phase 5 実装         | `outputs/phase-05/` | 実装コード     |
| テストカバレッジ基準 | skill プロンプト    | カバレッジ目標 |

---

## 成果物

| 成果物             | パス                                                                              | 内容             |
| ------------------ | --------------------------------------------------------------------------------- | ---------------- |
| 拡張テスト         | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts` | 追加テストケース |
| カバレッジレポート | `outputs/phase-06/coverage-report.md`                                             | カバレッジ結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

本 Phase で統合テストを追加する。

**統合テストの追加アクション**:

- [ ] SkillExecutor と PermissionResolver の連携テスト追加
- [ ] IPC チャネルを介した通信テスト追加
- [ ] エンドツーエンドの権限フローテスト追加

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] 統合テストが追加されている
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-07-coverage-verification.md`

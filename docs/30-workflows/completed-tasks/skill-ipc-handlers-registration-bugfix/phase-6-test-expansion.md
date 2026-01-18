# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡充                             |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-17                             |
| 機能名     | skill-ipc-handlers-registration-bugfix |

---

## 目的

Phase 5で実装した修正に対して、エッジケースや異常系のテストを追加し、
テストカバレッジを向上させる。

## 背景

基本的な修正は完了しているが、以下の観点でテストを拡充する必要がある:

- エッジケース（空配列、null、undefined）
- 異常系（IPCエラー、タイムアウト）
- 境界値（長い文字列、特殊文字）

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: 境界値やエッジケースのテストを追加する

**実行手順**:

1. 空配列のテストケースを追加
2. 空文字列のテストケースを追加
3. 特殊文字を含むIDのテストケースを追加
4. 長い文字列のテストケースを追加

**テストケース例**:

```typescript
describe("skillAPI edge cases", () => {
  describe("import", () => {
    it("should handle empty array", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      window.electronAPI = { invoke: mockInvoke };

      await skillAPI.import([]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", { skillIds: [] });
    });

    it("should handle special characters in skill ids", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      window.electronAPI = { invoke: mockInvoke };

      await skillAPI.import(["skill-with-日本語", "skill/with/slash"]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill-with-日本語", "skill/with/slash"],
      });
    });
  });

  describe("remove", () => {
    it("should handle empty string", async () => {
      const mockInvoke = vi
        .fn()
        .mockResolvedValue({ success: false, error: "Invalid skill id" });
      window.electronAPI = { invoke: mockInvoke };

      const result = await skillAPI.remove("");

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", { skillId: "" });
    });
  });
});
```

**期待される成果物**:

- 追加されたエッジケーステスト

---

### タスク2: 異常系テスト追加

**目的**: IPCエラーやタイムアウトなど異常系のテストを追加する

**実行手順**:

1. IPCエラー時のテストケースを追加
2. 戻り値がnullの場合のテストケースを追加
3. OperationResult.successがfalseの場合のテストケースを追加

**テストケース例**:

```typescript
describe("skillAPI error handling", () => {
  describe("import", () => {
    it("should handle IPC error", async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error("IPC Error"));
      window.electronAPI = { invoke: mockInvoke };

      await expect(skillAPI.import(["skill-1"])).rejects.toThrow("IPC Error");
    });

    it("should handle operation failure", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        success: false,
        error: "Import failed",
      });
      window.electronAPI = { invoke: mockInvoke };

      const result = await skillAPI.import(["skill-1"]);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Import failed");
    });
  });

  describe("getDetail", () => {
    it("should handle null response", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        success: true,
        data: null,
      });
      window.electronAPI = { invoke: mockInvoke };

      const result = await skillAPI.getDetail("non-existent");

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
});
```

**期待される成果物**:

- 追加された異常系テスト

---

### タスク3: 統合テストシナリオ追加

**目的**: preload⇔main間の統合テストを追加する

**実行手順**:

1. 正常系の統合テストシナリオを作成
2. 異常系の統合テストシナリオを作成
3. 複数操作の連続実行シナリオを作成

**テストシナリオ例**:

```typescript
describe("IPC Integration Tests", () => {
  describe("skill management flow", () => {
    it("should complete full skill import flow", async () => {
      // 1. スキル一覧取得
      // 2. スキルインポート
      // 3. インポート済みスキル確認
    });

    it("should complete full skill removal flow", async () => {
      // 1. インポート済みスキル確認
      // 2. スキル削除
      // 3. 削除確認
    });
  });
});
```

**期待される成果物**:

- `outputs/phase-6/integration-test-scenarios.md`: 統合テストシナリオ

---

### タスク4: カバレッジレポート生成

**目的**: 現時点のテストカバレッジを確認する

**実行手順**:

1. カバレッジ付きでテストを実行
2. カバレッジレポートを確認
3. カバレッジが不足している箇所を特定
4. 追加が必要なテストを洗い出す

**実行コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage
```

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`: カバレッジレポート

---

## 参照資料

| 参照資料         | パス                               | 内容             |
| ---------------- | ---------------------------------- | ---------------- |
| Phase 4成果物    | `outputs/phase-4/`                 | 基本テストコード |
| Phase 5成果物    | `outputs/phase-5/`                 | 実装コード       |
| テスト戦略設計書 | `outputs/phase-2/test-strategy.md` | テスト計画       |

### システム仕様（aiworkflow-requirements）

> テスト拡充時に必ず以下のシステム仕様を確認し、仕様に準拠したテストを作成してください。

| 参照資料            | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| IPC Handler Pattern | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCハンドラー登録パターン |

---

## 成果物

| 成果物             | パス                                            | 内容               |
| ------------------ | ----------------------------------------------- | ------------------ |
| エッジケーステスト | `apps/desktop/src/**/*.test.ts`                 | 境界値テスト       |
| 異常系テスト       | `apps/desktop/src/**/*.test.ts`                 | エラーハンドリング |
| 統合テストシナリオ | `outputs/phase-6/integration-test-scenarios.md` | 統合テスト設計     |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`            | カバレッジ状況     |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6の統合テスト連携アクション**:

- 統合テストの拡充（全引数形式のカバレッジ向上）
- エラーケースの統合テストを追加
- 複数操作の連続実行テストを追加

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] 統合テストシナリオが設計されている
- [ ] カバレッジレポートが生成されている
- [ ] 全テストがパスしている
- [ ] 全成果物が配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-handlers-registration-bugfix/phase-7-coverage-check.md`

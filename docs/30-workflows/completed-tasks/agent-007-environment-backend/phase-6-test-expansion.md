# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 6                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- ユニットテスト拡充: 境界値・異常系テストの追加
- 統合テスト実行: IPC経由のテスト実行
- セキュリティテスト拡充: XSS攻撃パターンのテスト追加

## 参照資料

| 資料名     | パス                                                    | 説明          |
| ---------- | ------------------------------------------------------- | ------------- |
| 実装コード | `apps/desktop/src/main/services/environment/`           | Phase 5成果物 |
| テスト     | `apps/desktop/src/main/services/environment/__tests__/` | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容            |
| ---------------- | ------------------------------------------------------------------------------ | --------------- |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | XSS対策パターン |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPCチャネル                  | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### 3. 追加テストケース

#### ContentExtractor追加テスト

```typescript
describe("ContentExtractor (extended)", () => {
  it("should handle empty string", () => {
    const result = extractor.extractCodeBlocks("");
    expect(result).toHaveLength(0);
  });

  it("should handle nested code blocks", () => {
    // ネストされたコードブロックのテスト
  });

  it("should handle code block with special characters", () => {
    // 特殊文字を含むコードブロック
  });

  it("should handle very large content", () => {
    // 大きなコンテンツの処理
  });
});
```

#### ContentSanitizer追加テスト（セキュリティ）

```typescript
describe("ContentSanitizer (security)", () => {
  it("should remove onerror handlers", () => {});
  it("should remove onmouseover handlers", () => {});
  it("should remove onfocus handlers", () => {});
  it("should remove base tag", () => {});
  it("should handle nested script tags", () => {});
  it("should handle encoded script tags", () => {});
  it("should handle SVG with embedded scripts", () => {});
  it("should handle javascript: URLs", () => {});
  it("should handle data: URLs", () => {});
});
```

#### TempFileManager追加テスト

```typescript
describe("TempFileManager (extended)", () => {
  it("should handle concurrent file saves", () => {});
  it("should handle file save errors gracefully", () => {});
  it("should handle cleanup errors gracefully", () => {});
});
```

### 4. 統合テスト拡充

```typescript
describe("Environment Integration Tests (extended)", () => {
  describe("エラーハンドリング", () => {
    it("should handle undefined input", async () => {});
    it("should handle null input", async () => {});
    it("should handle malformed markdown", async () => {});
  });

  describe("パフォーマンス", () => {
    it("should process large content within timeout", async () => {});
    it("should handle multiple concurrent requests", async () => {});
  });
});
```

### 5. 統合テスト再実行

```bash
pnpm --filter @repo/desktop test:integration
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                        | 目標 |
| ------------------ | ------------------------------- | ---- |
| IPC接続テスト      | 3チャネル疎通・レスポンス形式   | 100% |
| データフローテスト | 抽出→サニタイズ→保存→返却の往復 | 100% |
| エラーハンドリング | 異常入力時のエラー返却          | 80%+ |
| セキュリティテスト | XSS攻撃パターン全除去           | 100% |

## 成果物

| 成果物             | パス                                                             | 説明               |
| ------------------ | ---------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                             | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                            | 統合テスト実行結果 |
| テストファイル     | `apps/desktop/src/main/services/environment/__tests__/*.test.ts` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している
- [ ] セキュリティテストが拡充されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. カバレッジ測定
2. ギャップ分析
3. ContentExtractor追加テスト
4. ContentSanitizer追加テスト（セキュリティ）
5. TempFileManager追加テスト
6. 統合テスト拡充
7. 統合テスト再実行
8. カバレッジレポート作成
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認

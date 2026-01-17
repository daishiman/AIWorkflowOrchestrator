# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 6                           |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

テストカバレッジを向上させ、エッジケース・異常系のテストを追加する。

## 実行タスク

### タスク1: エッジケーステスト追加

**目的**: 境界値・エッジケースのテストを追加する

**手順**:

1. 各モジュールの境界値テスト追加
2. 空入力・null値のテスト追加
3. 最大値・最小値のテスト追加

**追加テストケース**:

```typescript
describe("Edge Cases", () => {
  describe("CliProcessManager", () => {
    it("should handle empty command arguments");
    it("should handle very long command arguments");
    it("should handle special characters in arguments");
    it("should handle maximum concurrent processes");
  });

  describe("SkillExecutor", () => {
    it("should handle empty skill path");
    it("should handle skill path with special characters");
    it("should handle very long skill names");
    it("should handle empty prompt");
    it("should handle very long prompt");
  });

  describe("SessionManager", () => {
    it("should handle session ID collision");
    it("should handle maximum session limit");
    it("should handle rapid create/destroy cycles");
  });
});
```

**期待される成果物**:

- エッジケーステストファイル

### タスク2: 異常系テスト追加

**目的**: エラー・例外ケースのテストを追加する

**手順**:

1. CLI不在時のエラーハンドリングテスト
2. プロセス異常終了テスト
3. IPC通信エラーテスト
4. タイムアウトテスト

**追加テストケース**:

```typescript
describe("Error Handling", () => {
  describe("CLI Errors", () => {
    it("should handle CLI not found error");
    it("should handle CLI permission denied error");
    it("should handle CLI execution timeout");
    it("should handle CLI crash during execution");
  });

  describe("Process Errors", () => {
    it("should handle SIGTERM signal");
    it("should handle SIGKILL signal");
    it("should handle out of memory error");
    it("should handle zombie process");
  });

  describe("IPC Errors", () => {
    it("should handle invalid channel name");
    it("should handle malformed request");
    it("should handle renderer disconnect");
    it("should handle main process unavailable");
  });

  describe("Skill Errors", () => {
    it("should handle skill not found");
    it("should handle skill permission denied");
    it("should handle skill syntax error");
    it("should handle skill runtime error");
  });
});
```

**期待される成果物**:

- 異常系テストファイル

### タスク3: 統合テスト拡充

**目的**: 統合テストのカバレッジを向上させる

**手順**:

1. エンドツーエンドシナリオテスト追加
2. 並列実行テスト追加
3. リソースクリーンアップテスト追加
4. 長時間実行テスト追加

**追加テストケース**:

```typescript
describe("Integration Tests", () => {
  describe("End-to-End Scenarios", () => {
    it("should execute skill and return complete result");
    it("should stream output during long execution");
    it("should abort execution and clean up");
    it("should handle multiple sequential executions");
  });

  describe("Parallel Execution", () => {
    it("should execute multiple skills in parallel");
    it("should isolate parallel session state");
    it("should handle parallel abort requests");
    it("should clean up all parallel sessions");
  });

  describe("Resource Management", () => {
    it("should release all resources on completion");
    it("should release resources on error");
    it("should release resources on abort");
    it("should handle resource exhaustion");
  });

  describe("Long Running", () => {
    it("should handle 60-second execution");
    it("should maintain stream during long execution");
    it("should allow abort during long execution");
  });
});
```

**期待される成果物**:

- 統合テストファイル

### タスク4: セキュリティテスト追加

**目的**: セキュリティ関連のテストを追加する

**手順**:

1. パストラバーサルテスト追加
2. 入力バリデーションテスト追加
3. 権限チェックテスト追加
4. サンドボックステスト追加

**追加テストケース**:

```typescript
describe("Security Tests", () => {
  describe("Path Traversal", () => {
    it('should reject "../" in skill path');
    it("should reject absolute paths outside allowed directory");
    it("should reject symbolic links to outside directory");
    it("should reject encoded path traversal attempts");
  });

  describe("Input Validation", () => {
    it("should reject shell injection in arguments");
    it("should reject command chaining attempts");
    it("should sanitize special characters");
    it("should validate Zod schemas strictly");
  });

  describe("Permission Checks", () => {
    it("should verify skill is in whitelist");
    it("should reject unauthorized skill execution");
    it("should validate sender in IPC communication");
  });

  describe("Sandbox", () => {
    it("should restrict file system access");
    it("should restrict network access");
    it("should restrict environment variable access");
  });
});
```

**期待される成果物**:

- セキュリティテストファイル

## 参照資料

| 資料名        | パス                                                                        | 説明           |
| ------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 4テスト | Phase 4成果物                                                               | 既存テスト     |
| Phase 5実装   | Phase 5成果物                                                               | 実装コード     |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |

### システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様を参照してください。

| 参照資料         | パス                                                                         | 内容               |
| ---------------- | ---------------------------------------------------------------------------- | ------------------ |
| セキュリティ要件 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティテスト |
| テスト戦略       | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`      | テスト方針         |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| カテゴリ           | 追加テスト内容                     |
| ------------------ | ---------------------------------- |
| CLI接続            | 異常終了、再接続、バージョン互換性 |
| IPC通信            | 高負荷、タイムアウト、切断回復     |
| プロセス管理       | ゾンビプロセス、リソースリーク     |
| ストリーミング     | 大量データ、バッファオーバーフロー |
| セッション管理     | 並列上限、状態不整合               |
| エラーハンドリング | カスケード障害、部分的回復         |

## 成果物

| 成果物             | パス                                   | 説明               |
| ------------------ | -------------------------------------- | ------------------ |
| エッジケーステスト | `*/__tests__/*-edge-cases.test.ts`     | 境界値テスト       |
| 異常系テスト       | `*/__tests__/*-error-handling.test.ts` | エラーテスト       |
| 統合テスト         | `*/__tests__/*-integration.test.ts`    | 統合テスト         |
| セキュリティテスト | `*/__tests__/*-security.test.ts`       | セキュリティテスト |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`   | カバレッジ状況     |

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] 統合テストが拡充されている
- [ ] セキュリティテストが追加されている
- [ ] 全テストが通過する
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. エッジケーステスト追加
2. 異常系テスト追加
3. 統合テスト拡充
4. セキュリティテスト追加
5. 全テスト通過確認
6. カバレッジレポート作成
7. 成果物の配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 全追加テストが作成されている
- [ ] カバレッジ目標を達成
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 6

# テスト実行（カバレッジ付き）
pnpm --filter @repo/desktop test -- --run --coverage
```

## 次のPhase

Phase 7: カバレッジ確認

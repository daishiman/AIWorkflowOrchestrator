# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 6                                   |
| 機能名 | UT-06-005-abort-skip-retry-fallback |
| 作成日 | 2026-03-16                          |

## 目的

Phase 4 で作成した基本テストに加え、境界値・異常系・並行実行・冪等性のテストケースを追加し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を目指す。

## 実行タスク

- タスク1: retryCount 境界値テストの追加
- タスク2: 異常系テストの追加（abort 4ステップの各段階エラー）
- タスク3: 並行実行テストの追加
- タスク4: 冪等性テストの拡充
- タスク5: timeout 境界値テストの追加

## 参照資料

| 資料名         | パス                                                                            | 説明                 |
| -------------- | ------------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | 基本テスト           |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                         | 実装コード           |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/PermissionStore.ts`                       | revokeSessionEntries |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                                         | 内容                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                  | カバレッジ基準                                                     |
| コンポーネントテスト       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`            | テスト設計パターン                                                 |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラー分類                                                         |
| エラーハンドリング（コア） | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細） | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| セキュリティ（スキル実行） | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed原則                                                    |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | DI/状態遷移パターン                                                |
| Agent SDK Executor（コア） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode         |
| Agent SDK Executor（詳細） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |

## 実行手順

### ステップ1: retryCount 境界値テスト（タスク1）

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`（既存ファイルに追加）

| #   | テストケース                                            | 期待結果                                     | 対応AC |
| --- | ------------------------------------------------------- | -------------------------------------------- | ------ |
| B-1 | retryCount=0 での Permission 拒否（1回目のリトライ）    | `{ action: "retry", retryCount: 1 }`         | AC-06  |
| B-2 | retryCount=1 での Permission 拒否（2回目のリトライ）    | `{ action: "retry", retryCount: 2 }`         | AC-06  |
| B-3 | retryCount=2 での Permission 拒否（境界: abort遷移）    | `{ action: "abort", reason: "max_retries" }` | AC-07  |
| B-4 | retryCount=3 での Permission 拒否（上限超過後の再呼出） | `{ action: "abort", reason: "max_retries" }` | AC-08  |

### ステップ2: 異常系テスト（タスク2）

abort 4ステップの各段階でエラーが発生した場合のテスト。

| #   | テストケース                                              | 期待結果                                                   | 対応NFR |
| --- | --------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| E-1 | cancelAll が例外を投げた場合                              | 後続ステップ（revokeSessionEntries, log, IPC）が実行される | NFR-1   |
| E-2 | revokeSessionEntries が例外を投げた場合                   | log と IPC は実行され、状態は `aborted` に遷移する         | NFR-1   |
| E-3 | IPC send が例外を投げた場合                               | 状態は `aborted` に遷移し、エラーがログに記録される        | NFR-1   |
| E-4 | cancelAll と revokeSessionEntries が両方例外を投げた場合  | 状態は `aborted` に遷移する（fail-closed）                 | NFR-1   |
| E-5 | handlePermissionResponse に不正な response が渡された場合 | abort に遷移する（fail-closed: NFR-1）                     | NFR-1   |

### ステップ3: 並行実行テスト（タスク3）

複数の Permission リクエストが同時に処理される場合のテスト。

| #   | テストケース                              | 期待結果                                         | 対応AC   |
| --- | ----------------------------------------- | ------------------------------------------------ | -------- |
| C-1 | 2つの Permission リクエストが同時に abort | 両方の requestId の retryCounters がクリアされる | AC-03    |
| C-2 | 1つが skip、もう1つが abort               | skip 側は running、abort 側は aborted に遷移     | AC-04/02 |
| C-3 | 1つが retry 中にもう1つが abort           | abort が優先され、retry 側もキャンセルされる     | AC-01    |

### ステップ4: 冪等性テスト拡充（タスク4）

| #   | テストケース                    | 期待結果                                        | 対応AC |
| --- | ------------------------------- | ----------------------------------------------- | ------ |
| I-1 | 同一 executionId への二重 abort | 2回目は no-op（cancelAll 等が追加呼出されない） | AC-03  |
| I-2 | abort 後の skip 呼び出し        | skip が無視される（状態が aborted のため）      | AC-03  |
| I-3 | abort 後の retry 呼び出し       | retry が無視される（状態が aborted のため）     | AC-03  |

### ステップ5: timeout 境界値テスト（タスク5）

**P13注意**: `advanceTimersByTime` を使用。`runAllTimers` は禁止。

| #   | テストケース                                   | 期待結果                             | 対応AC |
| --- | ---------------------------------------------- | ------------------------------------ | ------ |
| T-1 | 299999ms 経過時点（timeout 直前）              | abort に遷移していない               | AC-09  |
| T-2 | 300000ms 経過時点（timeout ちょうど）          | abort に遷移する                     | AC-09  |
| T-3 | 300001ms 経過時点（timeout 直後）              | abort に遷移している                 | AC-09  |
| T-4 | timeout 直前（299999ms）に approved が来た場合 | abort に遷移せず approved として処理 | AC-09  |

```typescript
// P13準拠: 境界値テイマーテスト
it("should not abort at 299999ms", async () => {
  vi.advanceTimersByTime(299999);
  expect(executor.getExecutionState()).not.toBe("aborted");
});

it("should abort at 300000ms", async () => {
  vi.advanceTimersByTime(300000);
  expect(executor.getExecutionState()).toBe("aborted");
});
```

### ステップ6: カバレッジ確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts
```

## 統合テスト連携【必須】

Phase 6 では境界値・異常系・並行実行のテストを追加し、統合ポイントのエラー耐性を検証する。

| 統合テストシナリオ | テストケース                                        | 検証ポイント                            |
| ------------------ | --------------------------------------------------- | --------------------------------------- |
| abort エラー耐性   | cancelAll/revokeSessionEntries のエラー時の後続実行 | fail-closed 原則での統合動作            |
| 並行 abort         | 複数リクエストの同時 abort                          | retryCounters の一括クリアと IPC 通知   |
| timeout 境界       | 299999ms/300000ms/300001ms での動作                 | タイマーと abort フローの統合タイミング |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                  | 仕様参照先                                             |
| ------------------ | ----------------------------------------- | ------------------------------------------------------ |
| セキュリティ       | fail-closed の異常系テストが必要          | `aiworkflow-requirements: security-skill-execution.md` |
| エラーハンドリング | abort 各ステップのエラー伝搬テストが必要  | `aiworkflow-requirements: error-handling.md`           |
| テスト設計         | P9/P13 準拠の境界値・タイマーテストが必要 | `.claude/rules/06-known-pitfalls.md`                   |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                 | 仕様参照先                                             |
| -------------------- | ---------------------------------------- | ------------------------------------------------------ |
| バックエンド（Main） | 境界値・異常系・並行実行テスト（Main側） | `aiworkflow-requirements: security-skill-execution.md` |
| IPC通信              | IPC 通知の異常系テスト                   | `aiworkflow-requirements: error-handling.md`           |

**テスト環境の注意事項**:

| Pitfall | 内容                                  | 対策                                        |
| ------- | ------------------------------------- | ------------------------------------------- |
| P9      | テスト間の状態リーク                  | `beforeEach` で retryCounters もリセット    |
| P13     | タイマーテストの無限ループ            | `advanceTimersByTime` で1ステップずつ進める |
| P40     | テスト実行ディレクトリ依存            | `cd apps/desktop` してから実行              |
| P41     | v8 カバレッジのインライン関数カウント | コールバック実行を明示的に検証              |

## 成果物

| 成果物             | パス                                                                            | 説明               |
| ------------------ | ------------------------------------------------------------------------------- | ------------------ |
| 拡充テスト         | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | 追加テストケース   |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                            | カバレッジ計測結果 |

## 完了条件

- [ ] retryCount 境界値テスト（B-1〜B-4）が追加されている
- [ ] 異常系テスト（E-1〜E-5）が追加されている
- [ ] 並行実行テスト（C-1〜C-3）が追加されている
- [ ] 冪等性テスト（I-1〜I-3）が追加されている
- [ ] timeout 境界値テスト（T-1〜T-4）が追加されている
- [ ] 全テストが GREEN（PASS）である
- [ ] タイマーテストが `advanceTimersByTime` を使用している（P13 準拠）
- [ ] テスト間で状態を共有していない（P9 準拠）
- [ ] 既存テスト（permission.test.ts, retry.test.ts）が全て PASS している（AC-12）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4/5 成果物）
2. retryCount 境界値テスト追加（タスク1）
3. 異常系テスト追加（タスク2）
4. 並行実行テスト追加（タスク3）
5. 冪等性テスト拡充（タスク4）
6. timeout 境界値テスト追加（タスク5）
7. カバレッジ確認
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 6
```

## 次のPhase

Phase 7: カバレッジ確認 - Line 80%+, Branch 60%+, Function 80%+ の達成を確認する。未達の場合は Phase 6 へ戻る。

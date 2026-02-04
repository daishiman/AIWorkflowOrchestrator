# Phase 7: テストカバレッジ確認

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 7                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

### Task 7-1: カバレッジ再測定

```bash
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="features/search"
```

### Task 7-2: E2Eテスト実行

```bash
pnpm --filter @repo/desktop test:e2e -- search.spec.ts
```

### Task 7-3: 結果評価

カバレッジが基準を満たしているか確認する。

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果 |
| ------------------------ | ---- | ---- |
| ユニットテストLine       | 80%+ | TBD  |
| ユニットテストBranch     | 60%+ | TBD  |
| ユニットテストFunction   | 80%+ | TBD  |
| 結合テストAPI（IPC）     | 100% | TBD  |
| 結合テストシナリオ正常系 | 100% | TBD  |
| 結合テストシナリオ異常系 | 80%+ | TBD  |
| E2Eテスト                | 100% | TBD  |

## カバレッジ未達時の対応

カバレッジ未達やテスト失敗がある場合、Phase 6へ戻って拡充する。

| 状況          | 対応                      |
| ------------- | ------------------------- |
| Line < 80%    | Phase 6へ戻る             |
| Branch < 60%  | Phase 6へ戻る             |
| E2Eテスト失敗 | Phase 5へ戻る（実装修正） |

## 成果物

| 成果物             | パス                                 | 説明       |
| ------------------ | ------------------------------------ | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 再測定結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] E2Eテストが全て成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 7-1: カバレッジ再測定
2. Task 7-2: E2Eテスト実行
3. Task 7-3: 結果評価
4. カバレッジレポート出力

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 7-1〜7-3）を100%実行完了
- [ ] カバレッジ基準達成が確認されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

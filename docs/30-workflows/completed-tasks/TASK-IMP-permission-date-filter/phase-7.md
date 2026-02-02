# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 7                               |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測
- カバレッジレポート作成: 最終的なカバレッジ結果の記録

## 参照資料

| 資料名             | パス                                                                         | 説明          |
| ------------------ | ---------------------------------------------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                         | Phase 6成果物 |
| テストファイル     | `apps/desktop/src/renderer/components/settings/PermissionSettings/*.test.ts` | テストコード  |

## 実行手順

### 1. カバレッジ再測定

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/renderer/components/settings/PermissionSettings/
```

### 2. カバレッジ結果の確認

以下の基準を満たすことを確認:

| 指標              | 最低基準 | 推奨基準 | 結果 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -    |
| Branch Coverage   | 60%      | 70%      | -    |
| Function Coverage | 80%      | 90%      | -    |

### 3. ファイル別カバレッジ確認

| 対象ファイル                   | Line | Branch | Function |
| ------------------------------ | ---- | ------ | -------- |
| permissionHistory.ts（型定義） | -    | -      | -        |
| dateFilterUtils.ts             | -    | -      | -        |
| PermissionHistoryFilter.tsx    | -    | -      | -        |
| PermissionHistoryPanel.tsx     | -    | -      | -        |

### 4. 未達の場合の対応

カバレッジ未達がある場合、Phase 6へ戻って拡充する。

| 状況                    | 対応                                    |
| ----------------------- | --------------------------------------- |
| Line Coverage < 80%     | 未到達行のテストケースをPhase 6で追加   |
| Branch Coverage < 60%   | 未到達分岐のテストケースをPhase 6で追加 |
| Function Coverage < 80% | 未到達関数のテストケースをPhase 6で追加 |
| 全基準達成              | Phase 8へ進行                           |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| ユニットテストLine     | 80%+ | -    |
| ユニットテストBranch   | 60%+ | -    |
| ユニットテストFunction | 80%+ | -    |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 仕様参照先           |
| -------------- | -------- | -------------------- |
| パフォーマンス | 適用     | テスト実行時間の確認 |

## 成果物

| 成果物             | パス                                 | 説明       |
| ------------------ | ------------------------------------ | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 再測定結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] ファイル別のカバレッジが記録されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. カバレッジ再測定の実施
2. カバレッジ結果の確認・記録
3. 未達時のPhase 6差戻し判定
4. カバレッジレポートの作成
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 7                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

### Task 7-1: カバレッジ再測定

```bash
pnpm --filter @repo/desktop test:coverage
```

**測定対象ファイル:**

- `apps/desktop/src/main/ipc/permission-handlers.ts`
- `apps/desktop/src/preload/skill-api.ts`（権限確認関連部分）
- `apps/desktop/src/renderer/hooks/usePermissionDialog.ts`
- `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx`

### Task 7-2: カバレッジ基準判定

**ユニットテストカバレッジ:**

| ファイル                 | Line | Branch | Function | 判定 |
| ------------------------ | ---- | ------ | -------- | ---- |
| permission-handlers.ts   | -    | -      | -        | -    |
| skill-api.ts（権限部分） | -    | -      | -        | -    |
| usePermissionDialog.ts   | -    | -      | -        | -    |
| PermissionDialog.tsx     | -    | -      | -        | -    |
| **合計**                 | -    | -      | -        | -    |

**判定基準:**

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 7-3: 統合テスト実行

```bash
pnpm --filter @repo/desktop test
```

**結合テストカバレッジ:**

| 指標                         | 目標 | 結果 | 判定 |
| ---------------------------- | ---- | ---- | ---- |
| IPCチャンネル                | 100% | -    | -    |
| モジュール間インターフェース | 100% | -    | -    |
| 正常系シナリオ               | 100% | -    | -    |
| 異常系シナリオ               | 80%+ | -    | -    |
| 外部連携ポイント             | 100% | -    | -    |

### Task 7-4: 未達時の対応

カバレッジ未達や統合テスト失敗がある場合、Phase 6へ戻って拡充する。

**未達時のアクションプラン:**

| 未達項目              | 対応アクション                         |
| --------------------- | -------------------------------------- |
| Line Coverage未達     | 未テスト行を特定し、テスト追加         |
| Branch Coverage未達   | 条件分岐のテストケース追加             |
| Function Coverage未達 | 未テスト関数を特定し、テスト追加       |
| 統合テスト失敗        | 失敗原因を特定し、実装またはテスト修正 |

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果       | 判定 |
| ------------------------ | ---- | ---------- | ---- |
| ユニットテストLine       | 80%+ | {{RESULT}} | -    |
| ユニットテストBranch     | 60%+ | {{RESULT}} | -    |
| ユニットテストFunction   | 80%+ | {{RESULT}} | -    |
| 結合テストIPC            | 100% | {{RESULT}} | -    |
| 結合テストシナリオ正常系 | 100% | {{RESULT}} | -    |
| 結合テストシナリオ異常系 | 80%+ | {{RESULT}} | -    |

## 参照資料

| 資料名             | パス                                  | 説明          |
| ------------------ | ------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | Phase 6成果物 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | Phase 6成果物 |

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

## 完了条件

- [ ] カバレッジ再測定が完了している
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

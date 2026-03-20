# Phase 7: カバレッジ確認

## メタ情報

| 項目          | 値                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 7                                                                                                                       |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                                                |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                                                    |
| 作成日        | 2026-03-20                                                                                                              |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-6-test-expansion.md` |

## 目的

Phase 6で追加したテストを含めて最終カバレッジを計測し、プロジェクトのカバレッジ基準（Line 80%以上・Branch 60%以上）を達成していることを確認する。未達の場合は Phase 6 に戻り追加テストを作成する。

## 実行タスク

### Task 1: カバレッジ計測コマンド

```bash
# WorkspaceView全体のカバレッジ
cd apps/desktop && pnpm vitest run \
  src/renderer/views/WorkspaceView \
  --coverage \
  --coverage.reporter=text \
  --coverage.reporter=html \
  --coverage.include="src/renderer/views/WorkspaceView/**"
```

### Task 2: カバレッジ基準確認テーブル

計測結果を記録する（Phase 7実行時に更新する）。

| ファイル                                | Line目標 | Line実績 | Branch目標 | Branch実績 | 判定   |
| --------------------------------------- | -------- | -------- | ---------- | ---------- | ------ |
| `mapLLMErrorToStreamingError.ts`        | 90%      | 未計測   | 80%        | 未計測     | 未確認 |
| `StreamingErrorDisplay.tsx`             | 85%      | 未計測   | 70%        | 未計測     | 未確認 |
| `useWorkspaceChatController.ts`（差分） | 80%      | 未計測   | 70%        | 未計測     | 未確認 |

### Task 3: 判定と対応

| 判定         | 条件                                | 対応                   |
| ------------ | ----------------------------------- | ---------------------- |
| PASS         | 全ファイルが目標カバレッジを達成    | Phase 8 へ進む         |
| FAIL（軽微） | 1-2ファイルが目標を 5% 未満で下回る | Phase 6 に戻り補完     |
| FAIL（重大） | 複数ファイルが目標を大幅に下回る    | Phase 4-6 を再レビュー |

### Task 4: v8カバレッジプロバイダの注意（P41対策）

Vitestの v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントする（P41）。`StreamingErrorDisplay` 内のコールバック（`onClick={onDismiss}` 等）が実行されないとFunction Coverageが低下する場合がある。

テストで各コールバックを明示的に呼び出していることを確認する:

- `onDismiss` コールバック: C-06テストで確認
- `onRetry` コールバック: C-08テストで確認
- `onOpenSettings` コールバック: C-07テストで確認

## 参照資料

| ドキュメント     | パス                                                                                                                    | 参照目的           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 6 拡充     | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-6-test-expansion.md` | 追加テスト一覧     |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                                                      | カバレッジ基準定義 |
| P41 v8カバレッジ | `.claude/rules/06-known-pitfalls.md`                                                                                    | インライン関数対策 |

## 実行手順

1. **Task 1**: カバレッジ計測コマンドを実行する
2. **Task 2**: 結果を確認テーブルに記録する
3. **Task 3**: 判定を行い PASS/FAIL を記録する
4. FAIL の場合は Phase 6 に戻り追加テストを作成する
5. PASS の場合は Phase 8 へ進む

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                                   | パス                                                                                                                    | 形式       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| カバレッジ確認結果（Task 2テーブル更新） | 本ファイルのTask 2セクション                                                                                            | インライン |
| Phase 7 仕様書（本ファイル）             | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-7-coverage-check.md` | Markdown   |

## 完了条件

- [ ] カバレッジ計測コマンドを実行済み
- [ ] Task 2テーブルに実績値を記録済み
- [ ] `mapLLMErrorToStreamingError.ts`: Line 90%以上・Branch 80%以上
- [ ] `StreamingErrorDisplay.tsx`: Line 85%以上・Branch 70%以上
- [ ] `useWorkspaceChatController.ts`（差分）: Line 80%以上・Branch 70%以上
- [ ] 全テストが Green であること
- [ ] PASS判定が記録済み

## 次Phase

- PASS: Phase 8: リファクタリング (`phase-8-refactoring.md`)
- FAIL: Phase 6: テスト拡充 に戻る (`phase-6-test-expansion.md`)

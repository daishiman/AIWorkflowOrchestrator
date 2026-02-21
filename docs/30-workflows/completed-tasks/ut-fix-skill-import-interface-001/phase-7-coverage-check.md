# Phase 7: カバレッジ確認 — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 7（カバレッジ確認）                  |
| 機能名   | skill:import IPCインターフェース修正 |
| タスクID | UT-FIX-SKILL-IMPORT-INTERFACE-001    |
| 作成日   | 2026-02-21                           |

## 目的

Phase 5（実装）・Phase 6（テスト拡充）で作成したテストが、プロジェクトのカバレッジ基準を充足しているか検証する。未達の場合はPhase 6に戻り、追加テストを作成する。

## 実行タスク

- レポート生成: カバレッジレポートを生成する
- 基準比較: カバレッジ値を合格ラインと比較する
- 差分対応: 未達時にPhase 6へ戻る判断とフィードバックを記録する

## 参照資料

| 資料                        | パス                                                                            | 用途                           |
| --------------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| Phase 5 実装                | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-5-implementation.md` | 実装範囲の確認                 |
| Phase 6 テスト拡充          | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-6-test-expansion.md` | テスト追加内容の確認           |
| コード品質ルール            | `.claude/rules/02-code-quality.md`                                              | カバレッジ基準の定義           |
| P41: v8カバレッジプロバイダ | `.claude/rules/06-known-pitfalls.md#P41`                                        | インライン関数カウントの注意点 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                       |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------- |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ達成基準         |
| テスト実装         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | カバレッジ不足時の追加観点 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 異常系網羅観点             |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 契約関連テスト漏れ防止     |

## 実行手順

### Step 1: カバレッジレポート生成

以下のコマンドでカバレッジレポートを生成する:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage
```

### Step 2: カバレッジ基準との比較

以下の基準と比較する:

| 指標              | 最低基準 | 推奨基準 | Phase 7 合格ライン |
| ----------------- | -------- | -------- | ------------------ |
| Line Coverage     | 80%      | 90%      | 80%以上            |
| Branch Coverage   | 60%      | 70%      | 60%以上            |
| Function Coverage | 80%      | 90%      | 80%以上            |

### Step 3: P41対策 — v8カバレッジプロバイダの注意点

Vitestのv8カバレッジプロバイダは、インライン arrow function（`getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする。以下を確認する:

- `validateIpcSender` のオプションオブジェクト内のコールバックが実行されているか
- セキュリティテストでコールバックの戻り値を明示的に検証しているか（`mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` で呼び出し確認）

Function Coverageが低い場合、インライン関数の未実行が原因の可能性がある。

### Step 4: 未達時の判断

カバレッジが最低基準に未達の場合:

1. 未カバー行・未カバー分岐を特定する
2. Phase 6に戻り、不足テストケースを追加する
3. 再度Phase 7を実行する

カバレッジが最低基準を満たしている場合:

1. カバレッジレポートのスクリーンショットまたは数値を記録する
2. Phase 8（リファクタリング）へ進む

### Step 5: カバレッジ結果の記録

以下の形式で結果を記録する:

```markdown
## カバレッジ結果

| 指標              | 結果    | 基準（最低/推奨） | 判定  |
| ----------------- | ------- | ----------------- | ----- |
| Line Coverage     | \_\_\_% | 80% / 90%         | ✅/❌ |
| Branch Coverage   | \_\_\_% | 60% / 70%         | ✅/❌ |
| Function Coverage | \_\_\_% | 80% / 90%         | ✅/❌ |
```

## 統合テスト連携

- skill:importハンドラのカバレッジのみを対象とする
- skill:removeハンドラのカバレッジは別タスク（UT-FIX-SKILL-REMOVE-INTERFACE-001）で確認済み
- テストファイル全体（`skillHandlers.test.ts`）のカバレッジも参考値として記録する

## 多角的チェック観点

| 観点              | 確認内容                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| Line Coverage     | skill:importハンドラの全行が80%以上カバーされているか                        |
| Branch Coverage   | バリデーション分岐（型チェック・空文字列・トリム空文字列）が検証されているか |
| Function Coverage | ハンドラ関数・内部ヘルパー関数が80%以上カバーされているか                    |
| P41対策           | インライン関数がFunction Coverageを不当に低下させていないか                  |
| カバレッジ除外    | テストファイル自体・モック定義がカバレッジ計測から除外されているか           |

## 成果物

| 成果物                 | パス                                 |
| ---------------------- | ------------------------------------ |
| カバレッジ確認レポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] Line Coverage が80%以上である
- [ ] Branch Coverage が60%以上である
- [ ] Function Coverage が80%以上である
- [ ] P41対策（インライン関数カウント）が考慮されている
- [ ] カバレッジ結果が記録されている
- [ ] 未達の場合はPhase 6へのフィードバックが完了している

## 次のPhase

- カバレッジ基準を満たしている場合: Phase 8（リファクタリング）へ進む
- カバレッジ基準に未達の場合: Phase 6（テスト拡充）に戻る

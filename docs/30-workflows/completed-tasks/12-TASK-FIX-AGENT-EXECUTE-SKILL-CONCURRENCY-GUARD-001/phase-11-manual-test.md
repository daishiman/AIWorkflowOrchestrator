# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                                        |
| -------- | --------------------------------------------------------- |
| Phase    | 11                                                        |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001        |
| 実施日   | 2026-03-09                                                |
| 検証方式 | Vite harness + Playwright スクリーンショット + 補助テスト |

## 目的

実行中ガードが UI 上で視覚的に成立していることを、スクリーンショット証跡で確認する。あわせて、視覚では見えない回復経路は対象テストで補完する。

## 実行タスク

- 画面証跡取得: AgentView / AgentExecutionView / ChatPanel の実行中状態を撮影する
- TC同期: TC 単位で screenshot と結果表を同期する
- 補助検証: 非視覚項目は補助テストで補完する

## 参照資料

| 資料                                                   | 用途                  |
| ------------------------------------------------------ | --------------------- |
| `outputs/phase-2/design-document.md`                   | 実行中 UI の意図確認  |
| `outputs/phase-5/implementation-record.md`             | 実装結果の確認        |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | Store ガード実装確認  |
| `outputs/phase-6/test-expansion-record.md`             | 拡充テスト観点の確認  |
| `outputs/phase-7/coverage-report.md`                   | 事前カバレッジ確認    |
| `outputs/phase-8/refactoring-record.md`                | refactor 後の構造確認 |
| `outputs/phase-9/quality-assurance-record.md`          | 品質ゲート結果        |
| `outputs/phase-11/manual-test-record.md`               | 実施ログ              |
| `outputs/phase-11/manual-test-result.md`               | TC 単位の結果表       |
| `outputs/phase-11/screenshot-plan.json`                | 撮影計画              |
| `outputs/phase-10/final-review-record.md`              | 前段 PASS の確認      |

## テストケース

| テストケース | 画面               | 観点   | 期待結果                                                                 |
| ------------ | ------------------ | ------ | ------------------------------------------------------------------------ |
| TC-11-01     | AgentView          | 実行中 | ExecuteButton が描画されない                                             |
| TC-11-02     | AgentExecutionView | 実行中 | メッセージ入力が disabled、キャンセル導線が見える                        |
| TC-11-03     | ChatPanel          | 実行中 | `skill-management-toggle` が disabled、`SkillStreamingView` が表示される |

## 画面カバレッジマトリクス

| テストケース | 対象UI                         | 状態   | 証跡                                                      | 備考                          |
| ------------ | ------------------------------ | ------ | --------------------------------------------------------- | ----------------------------- |
| TC-11-01     | AgentView / ExecuteButton      | 実行中 | `screenshots/TC-11-01-agent-view-executing.png`           | 実行ボタン非表示              |
| TC-11-02     | AgentExecutionView             | 実行中 | `screenshots/TC-11-02-agent-execution-disabled-input.png` | 入力 disabled                 |
| TC-11-03     | ChatPanel / SkillStreamingView | 実行中 | `screenshots/TC-11-03-chat-panel-disabled-toggle.png`     | toggle disabled + stream 表示 |

## 実行手順

```bash
node apps/desktop/scripts/capture-task-12-concurrency-guard-phase11.mjs
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001
```

## 成果物/実行手順

- 成果物:
  - `outputs/phase-11/manual-test-record.md`
  - `outputs/phase-11/manual-test-result.md`
  - `outputs/phase-11/screenshot-plan.json`
  - `outputs/phase-11/screenshots/*.png`
- 実行手順:
  1. capture script を実行する
  2. `manual-test-result.md` と `phase-11-manual-test.md` の証跡欄を同期する
  3. screenshot coverage validator を実行する

## 補助検証

- エラー後の回復: `agentSlice-concurrency-guard.test.ts` の T-09/T-10 で確認
- listener 復元経路: `setupSkillListeners.ts` から `_handleComplete` / `_handleError` への復元を `manual-test-record.md` に記録
- 実行中の再入抑止: T-05/T-12 で確認

## 統合テスト連携

- T-05 / T-09 / T-10 / T-12 を手動証跡の補助根拠として使う
- 視覚証跡 3 件と非視覚テスト 2 系統を合わせて Phase 11 完了とする

## 成果物

| 成果物             | パス                                     | 説明                 |
| ------------------ | ---------------------------------------- | -------------------- |
| 手動テスト記録     | `outputs/phase-11/manual-test-record.md` | 実行ログと補助検証   |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | TC 単位の判定表      |
| 撮影計画           | `outputs/phase-11/screenshot-plan.json`  | 取得対象とファイル名 |
| スクリーンショット | `outputs/phase-11/screenshots/`          | TC-11-01〜03         |

## 完了条件

- [x] TC-11-01〜03 がすべて PASS
- [x] 画面カバレッジマトリクスに screenshot 参照が記録されている
- [x] `manual-test-result.md` に TC 単位の証跡が記録されている
- [x] `validate-phase11-screenshot-coverage` が PASS する状態まで同期されている
- [x] 補助検証（回復経路 / listener 復元）が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12: ドキュメント更新

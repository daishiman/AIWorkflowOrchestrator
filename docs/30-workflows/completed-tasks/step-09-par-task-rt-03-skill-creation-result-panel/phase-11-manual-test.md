# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 11                          |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

実際の Electron アプリケーション上で plan/execute 結果パネルの表示を人手で確認し、UX の妥当性と視覚的な品質を検証する。raw detail の保持/破棄と terminal_handoff の既存導線も確認する。

## 実行タスク

- 正常な plan 結果の表示確認
- 正常な execute 結果の表示確認
- エラー状態の表示確認
- ワークフロー state 遷移に伴うパネル切り替え確認
- raw detail の保持/破棄確認
- terminal_handoff の既存導線確認

## テストケース

| テストケース | 観点             | 手順                                                                  | 期待結果                                                                                                                           |
| ------------ | ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `TC-11-01`   | plan 結果表示    | スキル作成ウィザードで plan を実行し、結果パネルを確認する            | skillName, description, agents, scripts, triggers, anchors が表示される                                                            |
| `TC-11-02`   | execute 結果表示 | plan 承認後に execute を実行し、結果パネルを確認する                  | success badge + skillName + sessionId / resultSubtype / stopReason / permissionDenials / sdkEvents / sourceProvenance が表示される |
| `TC-11-03`   | plan エラー表示  | 無効な入力で plan を実行し、エラーパネルを確認する                    | ErrorBanner が赤系背景で表示される                                                                                                 |
| `TC-11-04`   | パネル切り替え   | plan → review → execute → verify とフローを進め、パネル遷移を確認する | 各 phase で対応するパネルが表示される                                                                                              |
| `TC-11-05`   | ダークモード表示 | ダークモードに切り替えて各パネルを確認する                            | コントラスト比が十分で文字が読める                                                                                                 |
| `TC-11-06`   | 折りたたみ操作   | skillSpec の折りたたみを展開/閉じる                                   | スムーズに開閉し、内容が正しく表示される                                                                                           |
| `TC-11-07`   | 再試行ボタン     | execute 失敗後に再試行ボタンをクリックする                            | execute が再実行される                                                                                                             |
| `TC-11-08`   | terminal_handoff | terminal_handoff の plan/execute response を確認する                  | detail panel は表示せず既存 handoff 導線が表示される                                                                               |
| `TC-11-09`   | raw detail state | panel を閉じて再度開く                                                | raw detail が破棄され、前回の detail が残らない                                                                                    |

## 画面カバレッジマトリクス

| テストケース | 対象               | 画面/証跡                                      | 実施方針                         |
| ------------ | ------------------ | ---------------------------------------------- | -------------------------------- |
| `TC-11-01`   | plan 結果パネル    | `outputs/phase-11/screenshots/placeholder.png` | スクリーンショット               |
| `TC-11-02`   | execute 結果パネル | `outputs/phase-11/screenshots/placeholder.png` | スクリーンショット               |
| `TC-11-03`   | エラーパネル       | `outputs/phase-11/screenshots/placeholder.png` | スクリーンショット               |
| `TC-11-04`   | パネル遷移         | `outputs/phase-11/screenshots/placeholder.png` | 画面遷移の記録                   |
| `TC-11-05`   | ダークモード       | `outputs/phase-11/screenshots/placeholder.png` | ダークモードスクリーンショット   |
| `TC-11-06`   | 折りたたみ         | `outputs/phase-11/screenshots/placeholder.png` | 開閉前後のスクリーンショット     |
| `TC-11-07`   | 再試行             | `outputs/phase-11/screenshots/placeholder.png` | ボタン操作のスクリーンショット   |
| `TC-11-08`   | terminal_handoff   | `outputs/phase-11/screenshots/placeholder.png` | handoff 導線のスクリーンショット |
| `TC-11-09`   | raw detail state   | `outputs/phase-11/screenshots/placeholder.png` | 再 open 前後のスクリーンショット |

## 参照資料

| 資料名                 | パス                             | 説明           |
| ---------------------- | -------------------------------- | -------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md` | baseline suite |
| Phase 5 実装           | `phase-5-implementation.md`      | コンポーネント |
| Phase 6 test expansion | `phase-6-test-expansion.md`      | edge case      |
| Phase 9 QA             | `phase-9-quality-assurance.md`   | quality gate   |
| Phase 10 final review  | `phase-10-final-review.md`       | AC matrix      |

## 実行手順

### ステップ1: 正常な plan 結果を確認する

- Electron アプリを起動し、スキル作成ウィザードから plan を実行する
- PlanResultDetailPanel が表示されることを確認する
- skillName, description, estimatedSteps badge, agents リスト, scripts リスト, triggers タグ, anchors タグが全て表示されていることを確認する
- skillSpec の折りたたみが動作することを確認する
- raw detail が SkillLifecyclePanel の local state として保持されることを確認する

### ステップ2: 正常な execute 結果を確認する

- plan 承認後に execute を実行する
- ExecuteResultDetailPanel が表示されることを確認する
- success badge が緑で表示されることを確認する
- skillName が表示されていることを確認する
- sessionId / resultSubtype / stopReason / permissionDenials / sdkEvents / sourceProvenance が文字列として崩れず表示されることを確認する

### ステップ3: エラー状態を確認する

- 無効な入力や接続エラーの状況で plan/execute のエラーを確認する
- ErrorBanner が赤系背景で表示されることを確認する
- エラーメッセージが読みやすく表示されていることを確認する
- 再試行ボタンが機能することを確認する

### ステップ4: ダークモードと視覚品質を確認する

- ダークモードに切り替えて全パネルを確認する
- テキストのコントラスト比が十分であることを確認する
- バッジ、タグ、ボーダーの色がダークモードで適切であることを確認する
- terminal_handoff の既存カードが detail panel と見分けられることを確認する

## 統合テスト連携

- Phase 12 に walkthrough 結果を反映する
- 発見された Blocker は Phase 13 の blocked 条件に追加する

## 成果物

| 成果物            | パス                                        | 説明                       |
| ----------------- | ------------------------------------------- | -------------------------- |
| manual checklist  | `outputs/phase-11/manual-test-checklist.md` | 人手確認項目               |
| manual result     | `outputs/phase-11/manual-test-result.md`    | 実施結果                   |
| manual report     | `outputs/phase-11/manual-test-report.md`    | walkthrough 所見           |
| discovered issues | `outputs/phase-11/discovered-issues.md`     | Blocker / Note / Info 分類 |

## 完了条件

- [ ] 正常な plan 結果の表示を確認した
- [ ] 正常な execute 結果の表示を確認した
- [ ] エラー状態の表示を確認した
- [ ] ダークモードでの表示品質を確認した
- [ ] **本Phase内の全タスクを100%実行完了**

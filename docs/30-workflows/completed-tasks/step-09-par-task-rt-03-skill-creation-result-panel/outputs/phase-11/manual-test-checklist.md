# Phase 11: 手動テストチェックリスト

## 対象タスク: TASK-RT-03 Skill Creation Result Panel

## テストケース一覧

| TC       | テスト名               | 手順                                                 | 期待結果                                                                                      |
| -------- | ---------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| TC-11-01 | Plan 結果表示          | skill 作成の prepare 実行 → review 画面確認          | skillName, description, agents, scripts, triggers, anchors, estimatedSteps が正しく表示される |
| TC-11-02 | Execute 結果表示       | plan 承認 → execute 実行 → verify 画面確認           | success/failure バッジが表示され、executeId がフッターに表示される                            |
| TC-11-03 | エラー状態表示         | LLM アダプター未接続で prepare 実行                  | ErrorBanner が赤系背景で表示され、再試行ボタンが表示される                                    |
| TC-11-04 | パネル遷移             | plan → review → execute → verify の全フロー実行      | 各フェーズで適切なパネルが表示/非表示され、前フェーズのパネルが隠れる                         |
| TC-11-05 | ダークモード           | ダークモードに切り替えてパネル表示確認               | CSS 変数（--bg-secondary, --text-primary 等）による色切り替えが正常に動作する                 |
| TC-11-06 | skillSpec 折りたたみ   | PlanResultDetailPanel の Skill Spec ボタンをクリック | 展開/折りたたみが正常動作し、アイコンが ▶/▼ に切り替わる                                      |
| TC-11-07 | 再試行ボタン           | 失敗時の再試行ボタンをクリック                       | onRetry コールバックが実行され、handlePrepare/handleExecutePlan が再実行される                |
| TC-11-08 | terminal_handoff       | terminal_handoff レスポンスを受信                    | Detail panel は表示されず、既存の handoff カードが表示される                                  |
| TC-11-09 | raw detail 保持/クリア | plan 表示後にキャンセル → 新規 prepare 実行          | キャンセルで state が null 化され、新規 prepare で新しいデータが反映される                    |

## 前提条件

- Electron デスクトップアプリが起動していること
- スキル作成ワークフローにアクセス可能であること
- LLM アダプターが接続済み（TC-11-03 を除く）

## 備考

- TC-11-01 〜 TC-11-09 は自動ユニットテスト（53 テスト）でもカバーされている
- ダークモード（TC-11-05）は CSS 変数ベースのため、OS テーマ設定またはアプリ内トグルで切り替え可能

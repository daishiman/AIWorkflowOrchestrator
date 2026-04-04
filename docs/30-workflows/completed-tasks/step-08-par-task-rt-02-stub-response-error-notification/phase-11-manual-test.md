# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 11                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

## 目的

implementation_complete / docs-heavy task として、設計文書ウォークスルーと current UI 導線の整合を確認する。今回の code wave（renderer 変更）に伴い、実画面の screenshot 証跡を取得して記録する。

## 実行タスク

- 仕様書の自己完結性を確認する
- current file path と参照リンクの実在を確認する
- plan logical error の UI 導線を walkthrough で確認する
- screenshot 昇格要否を判定する

## 参照資料

| 資料名            | パス                                                                             | 説明             |
| ----------------- | -------------------------------------------------------------------------------- | ---------------- |
| Phase 10 結果     | `phase-10-final-review.md`                                                       | AC / blocker     |
| Phase 11 テンプレ | `.agents/skills/task-specification-creator/references/phase-template-phase11.md` | docs-only ルール |

## テストケース

| テストケース | 内容                                                            | 期待結果                                                                                  |
| ------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TC-11-01     | `requirements-draft.md` / root pack 参照の確認                  | 参照切れなし                                                                              |
| TC-11-02     | plan logical error の仕様記述追跡                               | facade → ipc → renderer の導線が自己完結                                                  |
| TC-11-03     | execute 抑止の記述確認                                          | `execute()` false-success 修正を要求していない                                            |
| NV-11-01     | screenshot 昇格判定                                             | code wave ありのため screenshot 証跡を残す                                                |
| TC-11-04     | APIキーなしでスキル作成 → execute がエラーを返すことを確認      | `_executeInternal()` の `!this.llmAdapter` ガードが発動し、explicit error response が返る |
| TC-11-05     | LLMAdapter 未注入時の execute → UI にエラー表示されることを確認 | `SkillLifecyclePanel` にエラーメッセージが表示され、再試行ボタンが表示される              |

## 画面カバレッジマトリクス

| テストケース | 対象                                 | 種別   | 証跡方針                                                                   |
| ------------ | ------------------------------------ | ------ | -------------------------------------------------------------------------- |
| TC-11-01     | workflow docs                        | VISUAL | `outputs/phase-11/screenshots/TC-01-step1-initial-dark.png`                |
| TC-11-02     | skill create flow 設計               | VISUAL | `outputs/phase-11/screenshots/TC-03-step2-configure-dark.png`              |
| TC-11-03     | execute guard 設計                   | VISUAL | `outputs/phase-11/screenshots/TC-06-step3-error-dark.png`                  |
| TC-11-04     | execute llmAdapter guard（実装済み） | CODE   | `outputs/phase-11/screenshots/RT-02-01-skill-create-wizard-error-dark.png` |
| TC-11-05     | UI エラー表示（execute 後）          | VISUAL | `outputs/phase-11/screenshots/RT-02-02-skill-lifecycle-error-state.png`    |

## 統合テスト連携

- Phase 12 で walkthrough 結果と screenshot 判定理由を記録する

## 成果物

| 成果物                   | パス                                             | 説明                          |
| ------------------------ | ------------------------------------------------ | ----------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`      | 実施項目                      |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`         | walkthrough 結果              |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`         | 所見                          |
| 視覚レビュー             | `outputs/phase-11/ui-sanity-visual-review.md`    | Apple UI/UX 観点の確認        |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`          | blocker / note / info         |
| capture metadata         | `outputs/phase-11/phase11-capture-metadata.json` | screenshot 昇格時のみ実体生成 |

## 完了条件

- [x] docs-only walkthrough の結果が記録されている
- [x] 参照リンク実在確認が終わっている
- [x] screenshot 昇格要否が明記されている
- [x] 発見事項が分類されている
- [x] **本Phase内の全タスクを100%実行完了**

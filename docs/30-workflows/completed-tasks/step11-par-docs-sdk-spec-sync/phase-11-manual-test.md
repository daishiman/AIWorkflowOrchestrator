# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 11                                  |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

更新した仕様書を人の目で読み、意図した内容が正しく伝わるか、読みやすいかを確認する。grep / validator では検出できない意味的な問題（wording の誤解・情報の欠落）を手動テストで検知する。

## 実行タスク

- SDK-02 対象 3 ファイルを通読し、current owner 化が自然な文脈で伝わることを確認する
- SDK-04 対象 4 ファイルのパス修正箇所を目視確認し、リンクが正しい場所を指すことを確認する
- 手動テストチェックリストを作成する
- 手動テスト結果を記録する

## 手動テスト観点

| 観点                     | 確認内容                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------- |
| 文脈の自然さ（SDK-02）   | `SkillCreatorWorkflowEngine` の current owner 記述が前後の文脈と整合しているか         |
| 情報の完結性（SDK-02）   | system spec を読んだだけで workflow engine の役割が理解できるか                        |
| パスの正確性（SDK-04）   | `resource-map.md`、`quick-reference.md`、`topic-map.md` のリンク先が実在するか         |
| 導線の一貫性（SDK-04）   | `task-workflow-completed.md` の TASK-SDK-04 記録から、実際のワークフロー配下へ辿れるか |
| 未完了感なし（共通）     | 更新後の文書を読んで「作業中」「未確定」の印象を受けないか                             |
| docs-only の確認（共通） | 更新内容がすべて docs ファイルであり、コードへの影響を記述していないか                 |

## 参照資料

| 資料名                | パス                                              | 説明                       |
| --------------------- | ------------------------------------------------- | -------------------------- |
| Phase 2 対応表        | `outputs/phase-2/canonical-sync-target-matrix.md` | SDK-02 / SDK-04 の対象整理 |
| Phase 6 拡張結果      | `outputs/phase-6/test-expansion-summary.md`       | 追加観点の確認基盤         |
| Phase 7 カバレッジ    | `outputs/phase-7/coverage-summary.md`             | AC 達成状況の前提          |
| Phase 8 正規化結果    | `outputs/phase-8/refactoring-summary.md`          | wording 正規化済みの前提   |
| Phase 9 QA 結果       | `outputs/phase-9/qa-summary.md`                   | 機械検証の最終結果         |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-summary.md`        | 手動テスト開始の前提条件   |
| Phase 5 更新内容      | `outputs/phase-5/implementation-sequencing.md`    | 更新した 7 ファイルの一覧  |

## 統合テスト連携

- docs-only タスクのため実装コード向け統合テストは追加せず、`outputs/phase-4/test-matrix.md` に定義した grep / validator / index 再生成を統合ゲートとして扱う。
- Phase 11 では更新した仕様書の文脈・パス・wording を目視確認し、機械検証では検出できない意味的な問題の有無を manual-test-result に記録する。
- docs-only representative evidence として `outputs/phase-11/screenshot-plan.json` を `captureRequired: false` で保持し、`outputs/phase-11/screenshots/placeholder.png` を validator 互換の非視覚証跡として扱う。
- 依存元は Phase 1 要件定義、Phase 2 設計、Phase 5 実装、Phase 6 テスト拡充、Phase 7 カバレッジ確認、Phase 8 正規化結果、Phase 9 QA 結果、Phase 10 最終レビューであり、手動テストはこれらの成果物を目視確認する。

## 成果物

| 成果物                 | パス                                           | 説明                              |
| ---------------------- | ---------------------------------------------- | --------------------------------- |
| 手動テスト計画         | `phase-11-manual-test.md`                      | 手動テスト観点の定義              |
| manual test checklist  | `outputs/phase-11/manual-test-checklist.md`    | 確認項目のチェックリスト          |
| manual test result     | `outputs/phase-11/manual-test-result.md`       | テスト結果の記録                  |
| screenshot plan        | `outputs/phase-11/screenshot-plan.json`        | docs-only representative evidence |
| screenshot placeholder | `outputs/phase-11/screenshots/placeholder.png` | validator 互換の非視覚証跡        |

## 完了条件

- [ ] SDK-02 対象 3 ファイルの通読確認が完了している
- [ ] SDK-04 対象 4 ファイルのパス・リンク目視確認が完了している
- [ ] 手動テストチェックリストが作成されている
- [ ] 手動テスト結果が記録されている
- [ ] docs-only representative evidence bundle が作成されている
- [ ] Phase 12（ドキュメント更新）へ渡せる結果が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. SDK-02 対象ファイルの通読確認
3. SDK-04 対象ファイルの目視確認
4. 手動テストチェックリストと結果の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 12 で使用する手動テスト結果が固定されている

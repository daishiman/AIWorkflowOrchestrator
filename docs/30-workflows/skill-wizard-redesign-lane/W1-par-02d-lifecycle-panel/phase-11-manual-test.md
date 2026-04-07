# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 11                                                       |
| Phase名    | 手動テスト                                               |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 10: 最終レビュー                                   |
| 次Phase    | Phase 12: ドキュメント整備                               |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

実際にアプリを起動して SkillLifecyclePanel を操作し、削除要素の非表示・ウィザードボタンの動作・UX を人間の目で検証する。

## タスク分類確認

- 本 Phase は UI task であり、スクリーンショット撮影と視覚レビューを必須とする
- `manual-test-checklist.md`、`manual-test-result.md`、`manual-test-report.md`、`ui-sanity-visual-review.md`、`discovered-issues.md`、`screenshot-plan.json`、`screenshot-coverage.md`、`phase11-capture-metadata.json` を同一 wave で揃える
- Phase 12 ではこの証跡を `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の根拠として再利用する

## テスト方式（UI task）

| 区分           | 正本成果物                                       | 目的                                       | 備考                              |
| -------------- | ------------------------------------------------ | ------------------------------------------ | --------------------------------- |
| チェックリスト | `outputs/phase-11/manual-test-checklist.md`      | 「何を」「どの TC で」実施したかの対応表   | MT と TC の紐づけを正本にする     |
| 結果（実測）   | `outputs/phase-11/manual-test-result.md`         | 手動テストの実行結果（PASS/FAIL と所見）   | 各 TC に 1 つ以上の証跡を紐づける |
| レポート       | `outputs/phase-11/manual-test-report.md`         | 実施概要、結論、残課題、次アクション       | 要約を残す                        |
| 視覚レビュー   | `outputs/phase-11/ui-sanity-visual-review.md`    | 視覚品質（テーマ/余白/階層/密度）の評価    | UI/UX 変更なら必須                |
| 発見課題       | `outputs/phase-11/discovered-issues.md`          | 発見した課題（0件でも出力）                | 未解決なら Phase 12 へ引き継ぐ    |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`          | 撮影対象、TC-ID、状態、テーマの対応表      | 自動撮影の正本                    |
| 画面カバレッジ | `outputs/phase-11/screenshot-coverage.md`        | 画面状態と証跡の網羅率                     | 必須項目[A][B] 100% を確認        |
| 画面証跡       | `outputs/phase-11/screenshots/`                  | 実際の PNG 証跡                            | 全 TC の証跡を保存                |
| メタデータ     | `outputs/phase-11/phase11-capture-metadata.json` | capture 実行時刻、コマンド、証跡 inventory | 再撮影時の根拠                    |

## テストケース

| テストケース | 観点         | 内容                                                                                                                                                                                     |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-11-01     | 削除要素     | `skill-lifecycle-request-input` / `skill-lifecycle-create-button` / `skill-lifecycle-prepare-button` が DOM に存在しないことを確認する                                                   |
| TC-11-02     | 新規表示     | 「1. スキルを作成する」セクション、説明文、`skill-lifecycle-open-wizard-button` が表示されていることを確認する                                                                           |
| TC-11-03     | クリック動作 | `skill-lifecycle-open-wizard-button` をクリックし、`onOpenSkillWizard` が 1 回呼ばれ、呼び出し元でウィザードを開く導線が成立することを確認する                                           |
| TC-11-04     | 既存保持     | 「2. スキルを確認する」以降のセクションと既存ボタンが影響を受けていないことを確認する                                                                                                    |
| TC-11-05     | 視覚品質     | ホバー状態、ダークモード、`var(--text-secondary)`、`lifecycleButtonStyles.primary`、矢印「→」の表示を確認する                                                                            |
| TC-11-06     | 証跡同期     | `manual-test-checklist.md`、`manual-test-result.md`、`manual-test-report.md`、`screenshot-plan.json`、`screenshot-coverage.md`、`phase11-capture-metadata.json` が一致することを確認する |

## 画面カバレッジマトリクス

| テストケース | 画面状態                  | 優先度   | 証跡                                                                          | 備考                               |
| ------------ | ------------------------- | -------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| TC-11-01     | desktop / idle            | [A] 必須 | `outputs/phase-11/screenshots/TC-11-01-skill-lifecycle-hidden-controls.png`   | 旧入力・旧ボタンの非表示確認       |
| TC-11-02     | desktop / primary section | [A] 必須 | `outputs/phase-11/screenshots/TC-11-02-skill-lifecycle-open-wizard.png`       | 新セクションと導線ボタンの表示確認 |
| TC-11-03     | desktop / interaction     | [A] 必須 | `outputs/phase-11/screenshots/TC-11-03-skill-lifecycle-open-wizard-click.png` | クリック後の callback / 導線確認   |
| TC-11-04     | desktop / legacy section  | [A] 必須 | `outputs/phase-11/screenshots/TC-11-04-skill-lifecycle-legacy-preserved.png`  | 既存セクションへの影響なし         |
| TC-11-05     | dark / hover / review     | [A] 必須 | `outputs/phase-11/screenshots/TC-11-05-skill-lifecycle-visual-review.png`     | 視覚品質とテーマ差分               |
| TC-11-06     | artifact sync             | [A] 必須 | `outputs/phase-11/phase11-capture-metadata.json`                              | checklist / plan / coverage の同期 |

## 実行手順

1. Phase 10 の最終レビューと Phase 2 の設計文書を確認する
2. `manual-test-checklist.md` に TC-ID と MT-ID の対応を固定する
3. `screenshot-plan.json` を作成し、必要な画面状態を列挙する
4. スクリーンショットを撮影し、`manual-test-result.md`、`manual-test-report.md`、`ui-sanity-visual-review.md`、`screenshot-coverage.md` を同期する
5. 発見課題を `discovered-issues.md` に記録し、必要なら Phase 12 の未タスク検出へ引き継ぐ

## 参照資料

| 資料名                  | パス                                                                                   | 説明                                 |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| 最終レビュー            | `outputs/phase-10/final-review-result.md`                                              | 直前成果物                           |
| 設計書                  | `outputs/phase-2/design.md`                                                            | UI仕様参照                           |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | manual test と Phase 12 の共通ガイド |
| Phase 11 撮影ガイド     | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md`    | screenshot / evidence の手順         |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Phase 12 連携の根拠                  |

## 成果物

| 成果物                   | パス                                             | 説明                       |
| ------------------------ | ------------------------------------------------ | -------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`      | MT-ID / TC-ID の対応表     |
| テスト結果               | `outputs/phase-11/manual-test-result.md`         | ケース別結果               |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`         | 実施概要、結論、残課題     |
| 視覚レビュー             | `outputs/phase-11/ui-sanity-visual-review.md`    | テーマ/余白/階層の視覚評価 |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`          | 発見した課題               |
| スクリーンショット       | `outputs/phase-11/screenshots/`                  | スクリーンショット証跡     |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.json`          | 撮影計画                   |
| カバレッジレポート       | `outputs/phase-11/screenshot-coverage.md`        | 画面カバレッジ結果         |
| キャプチャメタデータ     | `outputs/phase-11/phase11-capture-metadata.json` | capture 実行時のメタデータ |

## 完了条件

- [ ] TC-11-01〜TC-11-06 の手動テストが全て実行済みで PASS
- [ ] `manual-test-checklist.md` に MT-ID と TC-ID の対応が記録されている
- [ ] `manual-test-result.md` に実行結果と証跡が紐づいている
- [ ] `manual-test-report.md` と `ui-sanity-visual-review.md` が作成されている
- [ ] `screenshot-plan.json` と `screenshot-coverage.md` が一致している
- [ ] `phase11-capture-metadata.json` に capture 時刻・コマンド・証跡 inventory が記録されている
- [ ] `screenshots/` に証跡 PNG が配置済み
- [ ] `discovered-issues.md` に 0件でも記録している
- [ ] Phase 12 へ引き継ぐ blocker / follow-up が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] `artifacts.json` / `outputs/artifacts.json` の整合要件を確認している
- [ ] Phase 末尾で完了記録と Phase 12 への依存引き渡しを明記している

## 次Phase

→ [Phase 12: ドキュメント整備](./phase-12-docs.md)

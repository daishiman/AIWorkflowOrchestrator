# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| Phase名    | 手動テスト検証                          |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 10: 最終レビュー                  |
| 次Phase    | Phase 12: ドキュメント更新              |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

自動テストでは検証が困難なナビゲーション動作、視覚的なレイアウト、ユーザー体験を手動で確認する。スクリーンショットとテストケース対応表を残し、Phase 12 で再利用できる証跡を作る。

## タスク分類確認

- 本 Phase は UI/UX 変更タスクであり、スクリーンショット撮影を必須とする
- `manual-test-checklist.md`、`manual-test-result.md`、`screenshot-plan.json`、`screenshot-coverage.md` を同一 wave で揃える
- Phase 12 ではこの証跡を `implementation-guide.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` の根拠として再利用する

## テスト方式（UI/UX変更タスク）

| 区分           | 正本成果物                                       | 目的                                       | 備考                               |
| -------------- | ------------------------------------------------ | ------------------------------------------ | ---------------------------------- |
| チェックリスト | `outputs/phase-11/manual-test-checklist.md`      | 「何を」「どの TC で」実施したかの対応表   | MT と TC の紐づけを正本にする      |
| 結果（実測）   | `outputs/phase-11/manual-test-result.md`         | 手動テストの実行結果（PASS/FAIL と所見）   | 各 TC に 1 つ以上の証跡を紐づける  |
| レポート       | `outputs/phase-11/manual-test-report.md`         | 実施概要、結論、残課題、次アクション       | 要約を残す                         |
| 視覚レビュー   | `outputs/phase-11/ui-sanity-visual-review.md`    | 視覚品質（テーマ/余白/階層/密度）の評価    | UI/UX 変更なら推奨ではなく必須扱い |
| 発見課題       | `outputs/phase-11/discovered-issues.md`          | 発見した課題（0件でも出力）                | 未解決なら Phase 12 へ引き継ぐ     |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`          | 撮影対象、TC-ID、状態、テーマの対応表      | 自動撮影の正本                     |
| 画面カバレッジ | `outputs/phase-11/screenshot-coverage.md`        | 画面状態と証跡の網羅率                     | 必須項目[A][B] 100% を確認         |
| 画面証跡       | `outputs/phase-11/screenshots/`                  | 実際の PNG 証跡                            | 全 TC の証跡を保存                 |
| メタデータ     | `outputs/phase-11/phase11-capture-metadata.json` | capture 実行時刻、コマンド、証跡 inventory | 再撮影時の根拠                     |

## 実行タスク

- Task 11-1: デスクトップナビゲーション動作確認
- Task 11-2: ルーティング遷移確認
- Task 11-3: 後方互換性確認
- Task 11-4: モバイルビュー確認
- Task 11-5: エッジケース手動確認
- Task 11-6: 記録・カバレッジ・Phase 12 への引き継ぎ

### 手動テスト観点

| 観点         | 検証項目                             |
| ------------ | ------------------------------------ |
| 操作性       | クリック、キーボード、ショートカット |
| a11y         | ARIA、フォーカス移動、フォーカス復元 |
| 表示         | desktop / tablet / mobile の視認性   |
| レスポンシブ | 画面幅ごとのレイアウト崩れ有無       |

## テストケース

| テストケース | 観点         | 内容                                                                                                           |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------- |
| TC-11-01     | 一次導線     | メインナビゲーションの「スキル作成」から `SkillLifecyclePanel` が直接開くことを確認する                        |
| TC-11-02     | 後方互換     | `SkillCreateWizard` への既存導線が引き続き動作することを確認する                                               |
| TC-11-03     | 遷移         | `SkillLifecyclePanel` → 他画面 → `SkillLifecyclePanel` の往復が正常であることを確認する                        |
| TC-11-04     | モバイル     | モバイルナビゲーションから `SkillLifecyclePanel` に到達でき、レイアウトが崩れないことを確認する                |
| TC-11-05     | エッジケース | 起動直後、複数タブ、戻る/進む、遅延時の挙動を確認する                                                          |
| TC-11-06     | 証跡同期     | `manual-test-checklist.md`、`screenshot-plan.json`、`screenshot-coverage.md`、PNG 証跡が一致することを確認する |

## 画面カバレッジマトリクス

| テストケース | 画面状態                | 優先度   | 証跡                                                                        | 備考                               |
| ------------ | ----------------------- | -------- | --------------------------------------------------------------------------- | ---------------------------------- |
| TC-11-01     | desktop / idle          | [A] 必須 | `outputs/phase-11/screenshots/TC-11-01-desktop-skill-lifecycle-primary.png` | 入口の正本確認                     |
| TC-11-02     | desktop / legacy access | [A] 必須 | `outputs/phase-11/screenshots/TC-11-02-desktop-skill-create-wizard.png`     | 後方互換確認                       |
| TC-11-03     | desktop / round trip    | [A] 必須 | `outputs/phase-11/screenshots/TC-11-03-desktop-route-round-trip.png`        | 往復遷移確認                       |
| TC-11-04     | mobile / responsive     | [A] 必須 | `outputs/phase-11/screenshots/TC-11-04-mobile-skill-lifecycle.png`          | レイアウト確認                     |
| TC-11-05     | non-visual / edge       | [B] 必須 | `outputs/phase-11/screenshots/` または `NON_VISUAL` 根拠                    | 起動直後・複数タブ・遅延時         |
| TC-11-06     | artifact sync           | [A] 必須 | `outputs/phase-11/phase11-capture-metadata.json`                            | checklist / plan / coverage の同期 |

## 実行手順

1. Phase 10 の最終レビューと Phase 2 の設計文書を確認する
2. `manual-test-checklist.md` に TC-ID と MT-ID の対応を固定する
3. `screenshot-plan.json` を作成し、必要な画面状態を列挙する
4. スクリーンショットを撮影し、`manual-test-result.md`、`manual-test-report.md`、`ui-sanity-visual-review.md`、`screenshot-coverage.md` を同期する
5. 発見課題を `discovered-issues.md` に記録し、必要なら Phase 12 の未タスク検出へ引き継ぐ

## 参照資料

| 参照資料                | パス                                                                                        | 内容                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 10                | `outputs/phase-10/final-review-result.md`                                                   | 最終レビュー結果                     |
| Phase 2                 | `outputs/phase-2/design-document.md`                                                        | 期待される動作の根拠                 |
| ナビゲーション契約      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 期待されるナビゲーション動作         |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | manual test と Phase 12 の共通ガイド |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      | 実体確認と validator 基準            |
| 撮影手順                | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | 証跡取得手順                         |

## 統合テスト連携

- 手動結果を統合シナリオの最終証跡として扱う
- 画面証跡とテストケース ID を対応付ける
- Phase 12 へ結果を渡し、未解決課題は unassigned-task に昇格する

## 成果物

| 成果物                   | パス                                             | 内容                       |
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
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] `artifacts.json` / `outputs/artifacts.json` の整合要件を確認している
- [ ] Phase 末尾で完了記録と Phase 12 への依存引き渡しを明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)

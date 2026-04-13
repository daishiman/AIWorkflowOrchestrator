# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 12                            |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 作成日 | 2026-04-13                    |

## 目的

実装完了後の成果を、`task-specification-creator` と `aiworkflow-requirements` の正本へ同期する。
この Phase では実装コードは触らず、仕様・台帳・履歴・未タスク・フィードバックを分離して記録する。

---

## 中学生レベル概念説明

このフェーズでやることは、ひとことで言うと「直したあとに説明書もそろえる」ことです。

たとえば、アプリの中に「アプリが送った手紙の一覧を見る本棚」を追加したとします。
本棚を作ったのに説明書が古いままだと、あとで誰かが見たときに「これ、本当に今の動き？」と迷います。
そこで Phase 12 では、次の5つをまとめて整えます。

1. わかりやすい実装ガイドを書く（2パート構成）
2. どの仕様書をどう直したかを記録する
3. 変更の履歴を残す
4. まだ残っている課題を見つけて記録する
5. このスキルと仕様書がちゃんと合っているかを確認する

これで、実装と説明書のズレを最小にできます。

---

## 事前チェック【必須】

Phase 12 を始める前に、次を先に確認する。

1. `LOGS.md` は `aiworkflow-requirements` と `task-specification-creator` の両方を更新対象に含める
2. `SKILL.md` の変更履歴テーブルを両方更新対象に含める
3. `topic-map.md` / `keywords.json` の再生成が必要かを確認する
4. planned wording（「仕様策定のみ」「実行予定」「保留として記録」など）を残さない
5. Phase 13 は user approval がない限り blocked のままにする

---

## 実行タスク

| Task      | 内容                                                 | 主成果物                                                 |
| --------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 2パート構成の実装ガイド作成                          | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec update summary 作成                      | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | documentation changelog と artifacts.json / 履歴同期 | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | unassigned task detection 作成                       | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | skill feedback report 作成                           | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check 作成              | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## 参照資料

| 資料名                                         | パス                                                                                                                  | 説明                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 11 手動テスト結果                        | `outputs/phase-11/manual-test-result.md`                                                                              | VISUAL スクリーンショット確認元 |
| Phase 10 最終レビュー結果                      | `outputs/phase-10/final-review-result.md`                                                                             | AC-1〜AC-5 の最終照合結果       |
| Phase 3 設計レビュー結果                       | `outputs/phase-3/design-review-result.md`                                                                             | MINOR / MAJOR の確認元          |
| Phase 1 受入基準                               | `outputs/phase-1/acceptance-criteria.md`                                                                              | Phase 12 で回収する前提の確認元 |
| analyticsAdapter 正本                          | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`                                                                 | 直接参照するアダプター          |
| Phase 12 テンプレート                          | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` / `phase-template-phase12-detail.md` | 出力名・必須タスクの根拠        |
| P50チェック結果                                | `outputs/phase-1/p50-check-result.md`                                                                                 | Phase 1 成果物                  |
| スコープ定義                                   | `outputs/phase-1/scope-definition.md`                                                                                 | Phase 1 成果物                  |
| 設計判断記録                                   | `outputs/phase-2/design-decisions.md`                                                                                 | Phase 2 成果物                  |
| コンポーネントインターフェース定義             | `outputs/phase-2/component-interface.md`                                                                              | Phase 2 成果物                  |
| 実装結果                                       | `outputs/phase-5/implementation-result.md`                                                                            | Phase 5 成果物                  |
| Green確認結果（全テストPASS）                  | `outputs/phase-5/green-confirmation.md`                                                                               | Phase 5 成果物                  |
| リファクタリング結果（変更なし・既に最適状態） | `outputs/phase-8/refactoring-result.md`                                                                               | Phase 8 成果物                  |
| 品質チェック結果（typecheck/lint/test全PASS）  | `outputs/phase-9/quality-check-result.md`                                                                             | Phase 9 成果物                  |
| AC-1〜AC-5検証記録                             | `outputs/phase-10/ac-verification.md`                                                                                 | Phase 10 成果物                 |
| 手動テストレポート                             | `outputs/phase-11/manual-test-report.md`                                                                              | Phase 11 成果物                 |
| 発見課題（ISSUE-P11-01）                       | `outputs/phase-11/discovered-issues.md`                                                                               | Phase 11 成果物                 |
| UIサニティVisualレビュー                       | `outputs/phase-11/ui-sanity-visual-review.md`                                                                         | Phase 11 成果物                 |
| キャプチャメタデータ                           | `outputs/phase-11/phase11-capture-metadata.json`                                                                      | Phase 11 成果物                 |

---

## 実行手順

### Task 12-1: 実装ガイド作成（2パート構成）

`implementation-guide.md` は 2パート構成とする。

#### Part 1: 中学生レベルの説明

- なぜ必要かを先に書く
- 日常生活でのたとえ話を最低1つ入れる
- 専門用語を使う場合は、その場で簡単に説明する
- `AnalyticsDashboardPanel` を追加する理由を、順番を崩さずに説明する

#### Part 2: 技術者向け詳細

- `AnalyticsDashboardPanel` の TypeScript インターフェース定義を記載する
- `getAnalyticsAdapter()` を直接呼ぶ方針を記載する
- dev-only 診断ブロックの条件分岐を記載する
- 設定画面への統合方法を記載する
- エラーケースとフォールバック動作を列挙する

### Task 12-2: system spec update summary 作成（4サブステップ）

`system-spec-update-summary.md` には、実際に更新すべき正本を1か所にまとめる。

#### Step 1-A: 完了タスク記録 + LOGS.md x2 + topic-map 更新

- `task-workflow-backlog.md` から `UT-W3-ANALYTICS-DASHBOARD-001` を完了扱いへ移す
- `task-workflow-completed.md` に完了記録を追加する
- 仕様 row を current facts に更新する
- `LOGS.md` を `aiworkflow-requirements` と `task-specification-creator` の両方で更新する

#### Step 1-B: 実装状況テーブル更新

- `AnalyticsDashboardPanel` コンポーネントの追加を反映する
- `SettingsView` への統合状況を反映する
- dev-only 診断ブロックの追加を反映する

#### Step 1-C: 関連タスクテーブル更新

- 未タスクとして残すものは明示して分類する
- `UT-W3-ANALYTICS-ADAPTER-001` との依存関係を更新する

#### Step 2: 必要な場合のみ system spec を更新

- 新規インターフェース / 型 / 定数の変更がある場合だけ更新する
- UI 統合のみなら更新不要と明記する
- 更新不要の場合でも、理由は `system-spec-update-summary.md` に書く

### Task 12-3: documentation changelog と履歴同期

`documentation-changelog.md` では、変更の前後と根拠を短く記録する。

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-w3-analytics-dashboard-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-w3-analytics-dashboard-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:system spec update summary,outputs/phase-12/documentation-changelog.md:documentation changelog,outputs/phase-12/unassigned-task-detection.md:unassigned task detection,outputs/phase-12/skill-feedback-report.md:skill feedback report,outputs/phase-12/phase12-task-spec-compliance-check.md:phase12 compliance check"
```

### Task 12-4: unassigned task detection（0件でも出力必須）

`unassigned-task-detection.md` には、0件でも必ず結果を書く。

確認元:

- Phase 3 の MINOR 指摘
- Phase 10 の MINOR / residual issue
- Phase 11 の VISUAL レビューで出た所見
- `TODO` / `FIXME` / `HACK` / `XXX`

### Task 12-5: スキルフィードバックレポート（改善なしでも出力必須）

`skill-feedback-report.md` には、改善点がなくても `改善点なし` と書く。

確認観点:

- `task-specification-creator` スキルの指示が適切に機能したか
- Phase 8〜13 のフォーマットに改善余地があるか
- analytics dashboard の spec で繰り返し使えるノウハウがあるか

### Task 12-6: phase12-task-spec-compliance-check（root evidence）

`phase12-task-spec-compliance-check.md` には、次を確認する。

- Task 12-1〜12-6 が全て完了している
- `implementation-guide.md` が 2パート構成である
- `system-spec-update-summary.md` が Step 1-A〜2 を含む
- `documentation-changelog.md` が current / baseline を含む
- `unassigned-task-detection.md` が 0件でも出力されている
- `skill-feedback-report.md` が省略されていない

---

## タスク100%実行確認【必須】

- [ ] Task 12-1〜12-6 の全成果物を作成済み
- [ ] `implementation-guide.md` が 2パート構成になっている
- [ ] `system-spec-update-summary.md` が Step 1-A〜2 を含んでいる
- [ ] `documentation-changelog.md` が current / baseline を含んでいる
- [ ] `unassigned-task-detection.md` が 0件でも出力されている
- [ ] `skill-feedback-report.md` が省略されていない

---

## 次Phase

**Phase 13: PR作成** — user approval 後にのみ実施する。

**Phase 13 開始条件**: Phase 12 の全完了条件を満たすこと。

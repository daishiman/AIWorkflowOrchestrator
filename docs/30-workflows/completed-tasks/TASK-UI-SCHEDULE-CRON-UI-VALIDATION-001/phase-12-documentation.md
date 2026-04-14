# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 12                                      |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| タスク名   | VisualCronPicker UIバリデーション整理   |
| 前提Phase  | Phase 11                                |
| 後続Phase  | Phase 13                                |
| 作成日     | 2026-04-13                              |
| ステータス | 完了                                    |

## 目的

実装ガイド・システム仕様書更新・ドキュメント更新履歴・未タスク検出・スキルフィードバック・
準拠チェックの6タスクを完了させ、Phase 11 の VISUAL 証跡と
`task-workflow` / `task-workflow-completed` / `task-workflow-backlog` / `LOGS.md` / `SKILL.md` / `topic-map.md`
の同波同期まで含めて閉じる。

## 実行タスク

- Task 12-1: 実装ガイドを 2 パート構成で作成する
- Task 12-2: システム仕様書更新サマリーを作成する
- Task 12-3: ドキュメント更新履歴を作成する
- Task 12-4: 未タスク検出レポートを作成する
- Task 12-5: スキルフィードバックレポートを作成する
- Task 12-6: Phase 12 準拠チェックを作成する

---

## 必須タスク一覧（Task 12-1〜12-6）

| タスクID  | 内容                                              | 状態 |
| --------- | ------------------------------------------------- | ---- |
| Task 12-1 | 実装ガイド作成（Part 1 / Part 2）                 | 完了 |
| Task 12-2 | システム仕様書更新（Step 1-A〜1-G / Step 2A・2B） | 完了 |
| Task 12-3 | ドキュメント更新履歴作成                          | 完了 |
| Task 12-4 | 未タスク検出レポート                              | 完了 |
| Task 12-5 | スキルフィードバックレポート                      | 完了 |
| Task 12-6 | Phase 12 準拠チェック                             | 完了 |

---

## 参照資料

| 資料名                   | パス                                                         | 用途                          |
| ------------------------ | ------------------------------------------------------------ | ----------------------------- |
| Phase 2 設計             | `phase-2-design.md`                                          | バリデーション設計の前提      |
| Phase 5 実装             | `phase-5-implementation.md`                                  | 実装内容の確認                |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                  | テスト内容の確認              |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`                                  | カバレッジ結果の確認          |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                     | リファクタリング有無の確認    |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`                               | 品質ゲート結果の確認          |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                     | Phase 11 成果物（VISUAL証跡） |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                  | Phase 11 成果物（VISUAL証跡） |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`                      | Phase 11 成果物（VISUAL証跡） |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`                     | Phase 11 成果物（VISUAL証跡） |
| UI/UX視覚レビュー        | `outputs/phase-11/ui-sanity-visual-review.md`                | Phase 11 成果物（VISUAL証跡） |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.json`                      | Phase 11 VISUAL証跡           |
| 画面カバレッジ           | `outputs/phase-11/screenshot-coverage.md`                    | Phase 11 VISUAL証跡           |
| スクリーンショット群     | `outputs/phase-11/screenshots/*.png`                         | Phase 11 VISUAL証跡           |
| キャプチャメタデータ     | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | Phase 11 VISUAL証跡           |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                    | AC確認                        |

---

## 実行手順

### Task 12-1: 実装ガイド作成（Part 1 / Part 2）

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの説明

---

##### なぜこの修正が必要だったの？

スケジュール機能では「毎週○曜日に実行する」や「毎月○日に実行する」という設定ができます。
でも、曜日を一つも選ばなかったり、存在しない日付（0日や32日）を入力してしまったとき、
画面に何も表示されず、間違った設定のまま保存できてしまう問題がありました。

例えると、**料理のレシピで材料が不足しているときに、アラートを出さずに調理を続けてしまう**ようなものです。
「卵がない状態でオムレツを作ろうとしている」のに誰も止めてくれない、ということです。

##### 料理レシピで例えると

| 状況                                  | 画面の動き（修正前）       | 画面の動き（修正後）                                |
| ------------------------------------- | -------------------------- | --------------------------------------------------- |
| 月・水・金を選んで「週次」設定        | 正常に保存できる           | 正常に保存できる（変わらず）                        |
| 曜日を何も選ばずに「週次」設定        | エラーなし・そのまま保存可 | 「曜日を選んでください」エラーが表示される          |
| 1〜31の範囲の日付で「月次」設定       | 正常に保存できる           | 正常に保存できる（変わらず）                        |
| 0や32など存在しない日付で「月次」設定 | エラーなし・そのまま保存可 | 「日付は1〜31の範囲で入力してください」が表示される |

##### 解決策

`VisualCronPicker.tsx` というUIコンポーネントにバリデーション処理を追加しました。
入力値が不正なとき、画面にわかりやすいエラーメッセージを表示する仕組みです。
これにより、ユーザーは設定ミスをその場で気づいて直すことができます。

---

#### Part 2: 技術者向けの説明

##### 問題の詳細

`VisualCronPicker` コンポーネントでは、以下の2パターンで不正な入力が素通りしていた。

1. `frequency: "weekly"` で `weekdays` が空配列の場合 — UIバリデーションが未実装
2. `frequency: "monthly"` で `dayOfMonth` が `0` または `32以上` の場合 — UIバリデーションが未実装

いずれも `cronConverter.ts` 側にはガード処理が存在するが、UIレベルでのフィードバックがなく、
ユーザーは設定ミスに気づけない状態だった。

`value` ベースの既存 contract では、月次 cron 式に `0 9 0 * *` や `0 9 32 * *` のような不正値が混ざっても、
parser が `VisualCronConfig` に復元してしまうため、UI 側で最終的に `monthlyError` を判定する必要がある。

##### 修正のポイント

| 項目           | 内容                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| 対象ファイル   | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  |
| テストファイル | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` |
| 修正内容1      | weekly + 空曜日: バリデーションエラーメッセージをUIに表示                             |
| 修正内容2      | monthly + 無効日付（0・32以上）: バリデーションエラーメッセージをUIに表示             |
| 表示制御       | エラー時は保存ボタンを `disabled` にする（または親コンポーネントへ状態通知）          |

##### TypeScriptインターフェースとAPIシグネチャ（参考）

```typescript
// バリデーションエラー状態の型定義例
interface CronValidationError {
  field: "weekdays" | "dayOfMonth";
  message: string;
}

// コンポーネントprops（value ベースの既存 contract に追加）
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void; // 親コンポーネントへの通知
}
```

##### エラーハンドリング設計

```typescript
// weekly: 空曜日チェック
if (config.frequency === "weekly" && config.weekdays.length === 0) {
  // エラーメッセージ: "曜日を1つ以上選択してください"
}

// monthly: 日付範囲チェック
if (config.frequency === "monthly") {
  const day = config.dayOfMonth;
  if (day < 1 || day > 31) {
    // エラーメッセージ: "日付は1〜31の範囲で入力してください"
  }
}
```

##### 影響範囲

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` のみ（UIバリデーション追加）
- `cronConverter.ts` への変更なし（既存ガード処理はそのまま維持）
- 既存の正常ケース（weekdaysあり・有効日付）への動作変更なし

---

### Task 12-2: システム仕様書更新サマリー

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: 完了タスク記録

| 項目             | 内容                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| 完了タスクID     | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                              |
| 完了日           | 2026-04-13                                                                                           |
| 実装ファイル     | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                                 |
| テストファイル   | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`                |
| 関連ドキュメント | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001/`                                         |
| 変更契約         | `value` ベースの props に `onValidationChange?: (isValid: boolean) => void` を追加したことを記録する |

**LOGS.md 更新対象**:

- `.claude/skills/task-specification-creator/LOGS.md`（current facts 変更なしのため no-op）
- `.claude/skills/aiworkflow-requirements/LOGS.md`

#### Step 1-B: 実装状況テーブル更新

| タスクID                                | 変更前 | 変更後 |
| --------------------------------------- | ------ | ------ |
| TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 | 未実装 | 完了   |

#### Step 1-C: 参照 grep と current contract 確認

- `value`, `onChange`, `weeklyError`, `isAdvancedMode`, `directInput` の現行実装を確認する
- `monthlyError` と `onValidationChange` の追加有無を確認し、対象ファイルの current contract を固定する
- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` と `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` の 2 ファイルを同一 wave で扱う

#### Step 1-D: topic-map 再生成

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` を再生成する
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` との同値性を確認する

#### Step 1-E: 未タスクリンク検証

- `verify-unassigned-links.js` を実行し、未タスク配置先のリンク切れがないことを確認する
- `audit-unassigned-tasks.js --diff-from HEAD` の current / baseline を分離して記録する

#### Step 1-F: DevOps / lane 同期（該当時）

- lane を採用している workflow のみ対象とし、採用していない場合は N/A 理由を残す
- `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` を current facts に合わせる

#### Step 1-G: validator 実行

- `validate-phase-output.js`
- `validate-phase11-screenshot-coverage.js`
- `validate-phase12-implementation-guide.js`
- `quick_validate.js`
- `validate_all.js` / `diff -qr`

#### Step 2A: 計画記録

- `ui-ux-*` / `interfaces-*` の更新候補を列挙し、実際に更新するファイルと no-op 判定を分ける
- 既存の UI 契約変更に紐づく `ui-ux-components.md` / `ui-ux-forms.md` / `interfaces-converter.md` / `interfaces-system-prompt.md` などの対象を記録する

#### Step 2B: 実更新

- `.claude/skills/task-specification-creator/LOGS.md`（no-op）
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/SKILL.md`（no-op）
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- 必要に応じて `ui-ux-*` / `interfaces-*` の正本を更新する
- `phase12-task-spec-compliance-check.md` で更新済み / no-op / 保留を記録する

---

### Task 12-3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

| 更新日     | 対象ファイル                                                                          | 変更内容                                        |
| ---------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 2026-04-13 | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  | weekly空曜日・monthly無効日付バリデーション追加 |
| 2026-04-13 | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | UIバリデーションテスト追加                      |
| 2026-04-13 | タスク仕様書（本ディレクトリ）                                                        | Phase 1-13 仕様書の新規作成                     |

**同波同期の記録**:

- `artifacts.json` / `outputs/artifacts.json` の status と phase artifacts を同期する
- `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` の current facts を合わせる
- `aiworkflow-requirements` の `LOGS.md` / `SKILL.md` / `topic-map.md` の更新有無を記録し、`task-specification-creator` は no-op とする
- `current` と `baseline` を分離して書き、今回差分のみを completed 扱いにする
- future wording（計画・予定・TODO・will be など）を残さない

---

### Task 12-4: 未タスク検出レポート作成

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

**検出対象**: 本タスクのスコープ外だが関連する潜在的な問題

**Phase 12 未タスク候補（タスク概要で明示されているもの）**:

| 未タスクID（候補）                            | 内容                                                 | 優先度 |
| --------------------------------------------- | ---------------------------------------------------- | ------ |
| TASK-CRON-CUSTOM-VALIDATION-001（候補）       | カスタムcron式（直接入力モード）のバリデーション実装 | MEDIUM |
| TASK-CRON-ERROR-STYLE-UNIFICATION-001（候補） | weekly `text-xs` と monthly `text-sm` の見た目統一   | LOW    |

**注意**: 0件でも本ファイルは必ず出力すること。

---

### Task 12-5: スキルフィードバックレポート作成

**出力先**: `outputs/phase-12/skill-feedback-report.md`

| フィードバックID | 内容                                                                                                                                    | 種別     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FB-VAL-01        | UIバリデーションは純粋関数ガード（cronConverter側）と二重防御する設計が望ましいというパターンは再利用可能な知見                         | 知見     |
| FB-VAL-02        | VISUALタスクはElectronアプリ起動が必要なため、renderer側でnode-onlyパッケージを誤ってimportしないよう事前確認が重要                     | 知見     |
| FB-VAL-03        | `VisualCronPicker` のようなUIコンポーネントは、バリデーション状態を親コンポーネントへ通知するcallback propsを仕様書作成時点で設計すべき | 改善提案 |

**スキル改善提案**:

| スキル                     | 改善内容                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| task-specification-creator | no-op（current facts 変更なし）                                                                                |
| aiworkflow-requirements    | VisualCronPicker関連の仕様に `value` ベースの props 契約と `monthlyError` / `weeklyError` の責務分担を記録する |

**改善点なしの場合も本ファイルは必ず出力すること。**

---

### Task 12-6: Phase 12 準拠チェック

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

#### 最低限の確認項目

- Task 12-1〜12-5 の成果物がすべて実在すること
- Task 12-2 の Step 1-A〜1-G / Step 2A・2B の実施結果が一致していること
- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の値が一致していること
- `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` / `aiworkflow-requirements` の `LOGS.md` / `SKILL.md` / `topic-map.md` が同一 wave で更新されていること
- `outputs/phase-11/manual-test-checklist.md` / `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/screenshot-plan.json` / `outputs/phase-11/screenshot-coverage.md` / `outputs/phase-11/screenshots/phase11-capture-metadata.json` / `outputs/phase-11/screenshots/*.png` の整合が取れていること
- planned wording（計画・予定・TODO・will be など）が `outputs/phase-12/*.md` に残っていないこと
- `phase13` が未承認なら blocked のままであること

#### 判定ルール

- 1 項目でも未充足がある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする
- `PASS` は成果物の存在・validator 実測値・same-wave sync 証跡が揃った場合にのみ使用する

---

## 統合テスト連携

Phase 11 で取得したスクリーンショット（VISUAL証跡4枚）を参照しながら、
実装ガイド（Part 1・Part 2）の内容が実際のUIと整合していることを確認する。
Phase 13 では、今回のドキュメント更新成果物を根拠としてPRを作成する。

## 多角的チェック観点

| チェック観点             | 確認内容                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| 実装ガイドの正確性       | TypeScriptインターフェースが実装と一致しているか                  |
| 中学生レベル説明の適切さ | 日常の例え話が実際のUIの動作を正しく反映しているか                |
| 未タスク候補の網羅性     | Phase 12 未タスク候補（2件）が全て記録されているか                |
| スキルフィードバックの質 | 改善提案が具体的で再利用可能な知見として記録されているか          |
| LOGS.md 更新確認         | aiworkflow-requirements の LOGS.md に完了タスクが記録されているか |

## サブタスク管理

| サブタスクID | 内容                                    | 状態 |
| ------------ | --------------------------------------- | ---- |
| ST-12-01     | Task 12-1: 実装ガイド作成（Part 1/2）   | 完了 |
| ST-12-02     | Task 12-2: システム仕様書更新           | 完了 |
| ST-12-03     | Task 12-3: ドキュメント更新履歴作成     | 完了 |
| ST-12-04     | Task 12-4: 未タスク検出レポート作成     | 完了 |
| ST-12-05     | Task 12-5: スキルフィードバックレポート | 完了 |
| ST-12-06     | Task 12-6: Phase 12 準拠チェック        | 完了 |

## 成果物

| 成果物                       | パス                                                     | 説明                                         |
| ---------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生レベル）+ Part 2（技術者向け） |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2A・2B の記録           |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ドキュメント変更履歴                         |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補一覧（0件でも出力必須）          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案（改善点なしでも出力必須）     |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence / same-wave sync               |

また、未タスク候補がある場合は `docs/30-workflows/unassigned-task/` にも配置する。

## 完了条件

- [x] Task 12-1（実装ガイド）: Part 1・Part 2 ともに作成済み
- [x] Task 12-2（仕様更新）: Step 1-A〜1-G 完了、Step 2A・2B の要否/実更新判定済み
- [x] Task 12-3（更新履歴）: ドキュメント変更履歴が記録済み
- [x] Task 12-4（未タスク検出）: 0件でも出力済み（候補2件を記録）
- [x] Task 12-5（フィードバック）: 改善点が記録済み
- [x] Task 12-6（準拠チェック）: root evidence が作成済み
- [x] 全6成果物が `outputs/phase-12/` に存在する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001
```

## 次Phase

Phase 13: PR作成

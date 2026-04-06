# Phase 12: Skill Feedback Report

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-P0-01                                              |
| 作成日     | 2026-04-04                                              |
| 対象 skill | `aiworkflow-requirements`, `task-specification-creator` |

## aiworkflow-requirements

### 提案1: current contract と completed record を同じ wave で見せる

`RuntimeSkillCreatorVerifyCheck` は既存 public contract として扱うのが正しいが、`task-workflow.md` / `task-workflow-completed.md` / `interfaces-skill-verify-contract.md` の役割が分かれていると、初見では「どれが正本か」を見失いやすい。

改善案:

- `current contract` と `history record` を見出しレベルで分ける
- `TASK-P0-01` のような verify 系は、`SkillCreatorVerificationEngine` と `RuntimeSkillCreatorVerifyCheck` の対応表を 1 箇所に集約する
- `artifacts.json` と `outputs/artifacts.json` の parity 理由を、`current/baseline` と併記して残す

### 提案2: verify / improve の責務分離を task-workflow 側にも明示する

`verifySkill()` は check 配列の返却、`verifyAndImproveLoop()` は pass/fail ルーティングという責務分離が重要だった。

改善案:

- `task-workflow.md` に `verifySkill()` と `verifyAndImproveLoop()` の役割差を 1 行で明記する
- `task-workflow-completed.md` にも「check 配列を返すだけ」と「ワークフロー遷移を担う」の差を残す
- Phase 12 で code wave が入った task は、仕様書側の current facts と completed ledger を同じ wave で確認する

## task-specification-creator

### 提案1: `implementation-guide.md` の validator 最小骨格をテンプレート化する

今回、`validate-phase12-implementation-guide.js` は `使用例` の有無を見落としやすい構造だとわかった。

改善案:

- `## Part 2` 配下に `### 使用例` を必須見出しとしてテンプレートへ固定する
- `### API シグネチャ` と `### 使用例` を隣接配置し、レビュー時に取りこぼしにくくする
- 返却型の例だけでなく、`verifySkill()` と `verifyAndImproveLoop()` の呼び分け例もテンプレートへ入れる

### 提案2: `documentation-changelog.md` の必須メタ情報を強制する

`変更者`、`関連 Issue / PR`、`validator 実行結果`、`current / baseline`、`artifacts 同期結果` は、抜けると再監査時に読みにくい。

改善案:

- documentation-changelog のテンプレートに `更新者` と `関連 Issue / PR` を必須フィールドとして入れる
- `validate-phase-output` の warning 理由まで 1 行で残す
- `未完了表現の監査` を 0 件証跡として明示する

## skill-fixture-runner

### 提案1: Phase 12 用の fixture に root parity ケースを追加する

今回の `artifacts.json` / `outputs/artifacts.json` 同期は、最終的に warning を消して PASS にできた。ここは fixture で再現できると強い。

改善案:

- `spec_created` root と `phase_12_completed` outputs の parity を検証する fixture を追加する
- `validate-phase-output` と `verify-all-specs` の両方を同じ workflow root で再現できるようにする
- 未来語句の文字列監査も fixture に固定する

## Phase 仕様書フォーマット

### 提案1: Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を別枠で書く

仕様書本文と成果物本文が混ざると、どこまでが plan でどこからが current fact かが見えにくくなる。

改善案:

- `phase-12-documentation.md` に「実行タスク」と「検証ログ」を分ける
- `system-spec-update-summary.md` に `Step 1-A〜1-G` と `Step 2` の判定根拠を別テーブルで残す
- `phase12-task-spec-compliance-check.md` に root parity / artifacts 同期 / validator 結果を 1 つの表で集約する

### 提案2: 非 visual task の evidence ルールを一文で固定する

NON_VISUAL なのに screenshot 前提を残すと、後続の manual test が false green になりやすい。

改善案:

- Phase 11 の説明文に「表示層変更なしなら screenshot 不要」を明記する
- 代替証跡として `vitest` / `typecheck` / `lint` を primary evidence にする

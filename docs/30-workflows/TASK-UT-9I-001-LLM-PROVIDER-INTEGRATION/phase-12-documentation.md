# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 12                                          |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 11 完了                               |
| 後続Phase  | Phase 13                                    |
| 作成日     | 2026-04-17                                  |
| ステータス | blocked                                     |

## 目的

実装完了に伴い、Phase 11 の手動テスト結果を起点に、実装ガイド・システム仕様更新サマリー・更新履歴・未タスク検出・スキルフィードバック・コンプライアンスチェックを canonical 名で作成し、`task-workflow` と `artifacts.json` 系の同期まで閉じる。

## 現在の到達状況

- Phase 12 の文書群は作成済み
- ただし Phase 11 の実機 Anthropic API 検証は `BLOCKED` のため、workflow 全体は未完了扱い

## 必須タスク（6タスク - 全て完了必須）

| Task | 名称                               | 必須 |
| ---- | ---------------------------------- | ---- |
| 1    | 実装ガイド作成（2パート構成）      | ✅   |
| 2    | システム仕様更新サマリー作成       | ✅   |
| 3    | ドキュメント更新履歴作成           | ✅   |
| 4    | 未タスク検出レポート作成           | ✅   |
| 5    | スキルフィードバックレポート作成   | ✅   |
| 6    | phase12-task-spec-compliance-check | ✅   |

---

## 実行タスク

1. Task 1〜6 の成果物名を canonical 名で固定する
2. `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / `LOGS.md x2` / `artifacts.json` / `outputs/artifacts.json` の同期要否を判定する
3. `aiworkflow-requirements` の domain spec sync が必要か no-op かを明記する
4. `NON_VISUAL` close-out として screenshot 不要判断と `screenshots/.gitkeep` の扱いを記録する
5. compliance-check で blocked 要因が残る限り `PASS` にしない

## SubAgent チーム編成

| SubAgent | 主担当                                                           | 並列可否              |
| -------- | ---------------------------------------------------------------- | --------------------- |
| A        | Task 1 実装ガイド                                                | Task 2 と並列開始可   |
| B        | Task 2 システム仕様更新サマリー / Task 3 documentation-changelog | Task 1 と並列開始可   |
| C        | Task 4 未タスク検出 / Task 5 スキルフィードバック                | Task 2 完了後に並列可 |
| D        | Task 6 compliance-check / 統合監査                               | 全成果物完成後に実施  |

## 実行順序と並列可能性

1. Task 1 と Task 2 を並列開始する。
2. Task 3 は Task 1/2 の確定結果を受けて実施する。
3. Task 4 と Task 5 は Task 2 確定後に並列実行する。
4. Task 6 は全成果物と validator 結果が揃ってから実施する。

---

## Task 1: 実装ガイド作成（2パート構成）

**成果物**: `outputs/phase-12/implementation-guide.md`

### Part 1: 中学生レベル説明

**必須要件**:

- 見出しは `## Part 1` を使う
- `### なぜ必要か`
- `### 何をするか`
- `### 日常の例え`
- `### 今回作ったもの`
- 日常生活の例え話を必ず含める
- 専門用語なし（使う場合は即座に説明する）
- 「なぜ必要か」→「何をするか」の順序
- `たとえば` を最低 1 回含める
- 作成後に `validate-phase12-implementation-guide.js` で内容要件を確認する

### Part 2: 開発者向け技術詳細

**必須要件**:

- 見出しは `## Part 2` を使う
- `### 型定義`
- `### APIシグネチャ`
- `### 使用例`
- `### エラーハンドリング`
- `### エッジケース`
- `### 設定項目と定数一覧`
- TypeScript の型定義を含める
- API シグネチャと使用例を記載する
- エラーハンドリングとエッジケースを説明する
- 設定可能なパラメータと定数一覧を記載する

### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

### 参照

- Phase 11 の `outputs/phase-11/manual-test-result.md`
- `manual-test-result.md` では `NON_VISUAL` である理由と実行ログを明記する

---

## Task 2: システム仕様更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A: 完了記録

- `task-workflow.md` の完了タスク記録を更新する
- `task-workflow-completed.md` の completed ledger を更新する
- `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- `.claude/skills/task-specification-creator/LOGS.md` を更新する

### Step 1-B: 実装状況テーブル更新

- 仕様書内の実装状況を `completed` に更新する
- `spec_created` と `completed` を混在させない

### Step 1-C: 関連タスクテーブル更新

- 仕様書内の関連タスク / 未タスク候補の状態を更新する
- `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` の参照状態を正本へ同期する

### Step 1-D: topic-map / index 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- 更新対象がある場合は `keywords.json` / `topic-map.md` を再生成する

### Step 1-E: artifacts parity

- `artifacts.json` と `outputs/artifacts.json` の整合を確認する
- phase artifact 名と status を同値に保つ

### Step 1-F: mirror parity

- `.claude/skills/...` と `.agents/skills/...` の mirror parity を確認する
- 必要がある場合のみ mirror 側も同一 wave で更新する

### Step 1-G: final validation

- `verify-unassigned-links.js`
- `audit-unassigned-tasks.js --json --diff-from HEAD`
- 計画系文言が残っていないことを確認する

### Step 2: domain spec sync

更新対象の例:

- `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/security-principles.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `task-workflow.md` / `task-workflow-completed.md`

新しい interface / type / IPC contract が増えた場合のみ実施し、変更不要の場合は `system-spec-update-summary.md` に no-op の根拠を残す。

### NON_VISUAL close-out

- `implementation-guide.md` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記する
- `outputs/phase-11/screenshots/.gitkeep` は `NON_VISUAL` のため不要として扱い、残置する場合は no-op 根拠を残す
- mirror parity は `.claude` 正本側に変更がない場合でも `変更なし` と明示する

---

## Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

### 必須記録

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- `artifacts.json` / `outputs/artifacts.json` の同期結果
- `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` の同期結果
- `system-spec-update-summary.md` で判断した更新要否

### 作成ルール

- `generate-documentation-changelog.js` の実行後に作成する
- 全 Step 完了前に「完了」と記載しない
- 更新なしでも理由を明記する

---

## Task 4: 未タスク検出レポート作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### 検出観点

- Phase 10 / Phase 11 の MINOR / blocker / follow-up
- `TODO` / `FIXME` / `HACK` / `XXX`
- `describe.skip` や旧参照の残存
- 仕様書間の不一致

### ルール

- 0 件でも必ず出力する
- 検出した follow-up は `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` に formalize する
- `task-workflow.md` と `task-workflow-completed.md` の両方へ同一 wave で反映する

---

## Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### 記録内容

- `task-specification-creator` への改善提案
- `aiworkflow-requirements` への改善提案
- 必要な場合のみ `skill-creator` への波及提案

### ルール

- 改善点がなくても「なし」と理由を書く
- 実際に反映した変更は LOGS.md へ追記する

---

## Task 6: phase12-task-spec-compliance-check

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 最低限必要な内容

- 6 成果物の存在確認
- Task 1〜5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の current fact / no-op / domain sync 確認
- validator 実測値
- `validate-phase12-implementation-guide.js` の結果
- artifacts parity
- 計画系文言 0 件
- Phase 11 の `manual-test-result.md` 参照整合

### 判定ルール

- 1 つでも未充足があれば `PASS` にしない
- `PASS` は成果物の実体と same-wave sync が揃った後のみ

---

## 参照資料

| 資料名                  | パス                                                                                               | 用途                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 11 手動テスト結果 | `docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION/outputs/phase-11/manual-test-result.md` | Phase 11 の正本                      |
| Phase 12 ガイド         | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`             | Task 1〜6 の詳細                     |
| Phase 12 タスクガイド   | `.claude/skills/task-specification-creator/references/phase-12-tasks-guide.md`                     | 実行順序と検証                       |
| システム仕様更新        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                     | Step 1 / Step 2 の基準               |
| Phase 11 テンプレート   | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`                   | NON_VISUAL / manual-test-result 正本 |
| Phase 13 詳細           | `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md`            | PR 作成前の参照                      |
| タスク実行ルール        | `.claude/rules/05-task-execution.md`                                                               | Phase 12 必須チェックリスト          |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                                               | 失敗パターン対策                     |

## 成果物

| 成果物                       | パス                                                     | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| コンプライアンスチェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

## 完了条件

- [ ] Task 1: 実装ガイドが完成している
- [ ] Task 2: システム仕様更新サマリーが完成している
- [ ] Task 3: ドキュメント更新履歴が完成している
- [ ] Task 4: 未タスク検出レポートが完成している
- [ ] Task 5: スキルフィードバックレポートが完成している
- [ ] Task 6: コンプライアンスチェックが完成している
- [ ] `task-workflow.md` と `task-workflow-completed.md` が同一 wave で同期されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity が確認されている
- [ ] `manual-test-result.md` が Phase 11 の正本として参照されている

## タスク100%実行確認【必須】

- [ ] 6 成果物がすべて存在する
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 の記録がある
- [ ] `documentation-changelog.md` に current / baseline と validator 結果がある
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `skill-feedback-report.md` が改善なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が最終ゲートとして完了している
- [ ] `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] 計画系文言が `outputs/phase-12/*.md` に残っていない

## 次Phase

Phase 13（PR作成）へ進む。ユーザーの明示的な承認後のみ実施する。

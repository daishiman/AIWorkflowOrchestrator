# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 12                                                  |
| 機能名       | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タスク名     | qualityInsights 現行定義を2 skillへ整合反映         |
| タスク種別   | docs-only（コード変更なし）                         |
| 前提Phase    | Phase 11 完了                                       |
| 後続Phase    | Phase 13                                            |
| 作成日       | 2026-04-21                                          |
| ステータス   | completed                                           |
| GitHub Issue | #2327（CLOSED）                                     |

---

## 目的

Phase 11 の手動テスト結果を起点に、タスク完了に伴うドキュメント更新・LOGS.md / changelog 更新・implementation-guide 作成・SKILL-changelog 反映・未タスク仕様書の整理を行い、本タスクの close-out を完了させる。

docs-only タスクのため、実装ガイドは「仕様書追記の手順・判断基準」の観点で記述する。

---

## 必須タスク（全て完了必須）

| Task | 名称                                    | 必須 |
| ---- | --------------------------------------- | ---- |
| 1    | 実装ガイド作成（outputs/phase-12/）     | 必須 |
| 2    | システム仕様更新サマリー作成            | 必須 |
| 3    | LOGS.md・changelog 更新                 | 必須 |
| 4    | 未タスク検出レポート作成                | 必須 |
| 5    | スキルフィードバックレポート作成        | 必須 |
| 6    | phase12-task-spec-compliance-check 作成 | 必須 |

---

## 実行タスク

1. Task 1〜6 の成果物名を canonical 名で固定する
2. `task-workflow-completed.md` / `LOGS.md`（両 skill）/ `SKILL.md`（両 skill）の同期要否を判定する
3. SKILL-changelog.md への反映確認を実施する
4. `NON_VISUAL` close-out として screenshot 不要判断と理由を記録する
5. 未タスク仕様書の整理（Phase 11 で発見された HIGH 問題が存在する場合は `unassigned-task/` へ formalize）
6. compliance-check で blocked 要因が残る限り `PASS` にしない

---

## Task 1: 実装ガイド作成

**成果物**: `outputs/phase-12/implementation-guide.md`

### Part 1: 中学生レベル説明

**必須要件**:

- 見出しは `## Part 1` を使う
- 以下の 4 サブ見出しを順番通りに含める:
  - `### なぜ必要か`
  - `### 何をするか`
  - `### 日常の例え`
  - `### 今回行ったこと`
- 専門用語禁止（やむを得ず使う場合は即座に 1 行で説明）
- `たとえば` を最低 1 回含める
- **日常の例え（必須）**: 「辞書に新しい言葉を追加する係」モチーフを使う。辞書編集者（このタスクの担当者）が、`qualityInsights` という章の 10 実フィールドと、確認用の 11 検証ポイントについて、「何のための言葉か（役割）」「誰が書き込むか（writer）」「誰が管理するか（運用責任）」を丁寧に書き加えた、という構図で説明する

### Part 2: 開発者向け技術詳細

**必須要件**:

- 見出しは `## Part 2` を使う
- 以下のサブ見出しを順番通りに含める:
  - `### 追記対象フィールド一覧`（qualityInsights の 10 実フィールド名・役割の概要表）
  - `### 追記方針`（正本仕様書への追記ルール・フォーマット）
  - `### writer と運用責任の定義`（各フィールドの書き込み主体と管理責任者）
  - `### 確認コマンド`（grep / diff -q / ls による確認手順）
  - `### エッジケース`（フィールド名の揺れ・既存記述との重複・500 行制約への対応）

### 視覚証跡（Task 1 配下）

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`implementation-guide.md` 末尾に「UI/UX 変更なしのため Phase 11 スクリーンショット不要」を明記する。

---

## Task 2: システム仕様更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A: 完了記録の同一 wave 同期

以下を **同一 wave で** 更新する:

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`（current facts に qualityInsights 関連完了記録を追加）
- `.claude/skills/aiworkflow-requirements/LOGS.md`（sync 記録）
- `.claude/skills/aiworkflow-requirements/SKILL.md`（変更履歴に本タスクのバージョン追記）
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`（行番号インデックス再生成）
- `.claude/skills/task-specification-creator/LOGS.md`（current facts 記録）
- `.claude/skills/task-specification-creator/SKILL.md`（変更履歴に本タスクのバージョン追記）

### Step 1-B: 実装状況テーブル更新

- 仕様書内・両 skill 内の本タスク実装状況を `spec_created` に更新する
- docs-only workflow では `spec_created` を使い、`completed` と混在させない
- qualityInsights 10 実フィールドの追記内容・役割・writer・運用責任を記載する

### Step 1-C: 関連タスクテーブル更新

- 仕様書内の関連タスク / 未タスク候補の状態を更新する
- GitHub Issue #2327 が CLOSED のままであることを確認し、再オープンしない

### Step 1-D: SKILL-changelog.md への反映確認

```bash
# SKILL-changelog.md への反映確認
grep -n "qualityInsights\|UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS" \
  .claude/skills/task-specification-creator/SKILL.md \
  .claude/skills/aiworkflow-requirements/SKILL.md
```

- 反映されていない場合は、本タスクの完了記録を SKILL.md の変更履歴に追記する

### Step 1-E: mirror parity 確認

- `.claude/skills/...` と `.agents/skills/...` の mirror parity を確認する

```bash
diff -qr .claude/skills/ .agents/skills/
# 期待: 出力 0 行
```

- 必要がある場合のみ mirror 側も同一 wave で更新する

### Step 2: 条件付きシステム仕様更新の判定

- 新規 interface / type / API 追加がある場合のみ追加の正本仕様更新を行う
- docs-only close-out で追加インターフェース変更がない場合も、`Step 2 = N/A` と根拠を記録する

### Step 1-F: final validation

```bash
# 未タスクリンク確認（存在する場合）
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>/dev/null || echo "skip: スクリプト非対象"

# 計画系文言が outputs/phase-12/*.md に残っていないことを確認
grep -rn "予定\|TBD\|計画中\|次のフェーズで\|後で対応" outputs/phase-12/ || echo "計画系文言なし: OK"
```

---

## Task 3: LOGS.md・changelog 更新

**成果物**: `outputs/phase-12/documentation-changelog.md`

### 必須記録

- 変更したファイル一覧（追記対象仕様書・両 skill の LOGS / SKILL / `.agents/` ミラーを網羅）
- 確認コマンド実行結果（`grep` / `diff -q` の出力）
- current / baseline の区別
- `task-workflow-completed.md` の同期結果
- mirror parity 確認結果

### SKILL-changelog.md への反映確認

本タスク（UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001）の完了を以下のファイルに反映する:

- `.claude/skills/task-specification-creator/SKILL.md`（変更履歴セクション）
- `.claude/skills/aiworkflow-requirements/SKILL.md`（変更履歴セクション）
- 両 skill の `LOGS.md`（sync 記録）

反映確認後、`documentation-changelog.md` に実施結果を記録する。

---

## Task 4: 未タスク検出レポート作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### 検出観点

- Phase 9 / Phase 10 / Phase 11 の MINOR / blocker / follow-up
- qualityInsights フィールドのうち追記が不完全なものが残っていないか
- 仕様書間の不一致（Phase 2 設計との齟齬）
- `TODO` / `FIXME` / `TBD` の残存

### 未タスク仕様書の整理

- 検出した未タスクは `docs/30-workflows/unassigned-task/` に formalize する
- 0 件でも必ず出力する（0 件の場合は「検出なし」と理由を記載）
- `task-workflow-completed.md` へ同一 wave で反映する

---

## Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### 記録内容

- `task-specification-creator` への改善提案（docs-only タスクの Phase 8/9/11 読み替えパターンの template 化余地）
- `aiworkflow-requirements` への改善提案（qualityInsights フィールド定義の検索性向上余地）
- 改善点がなくても「なし」と理由を書く
- 実際に反映した変更は両 skill の `LOGS.md` へ追記する

---

## Task 6: phase12-task-spec-compliance-check 作成

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 最低限必要な内容（自己申告ではなく実測で記録）

- 6 成果物の存在確認（`ls -la outputs/phase-12/` の出力を貼り付け）
- Task 1〜5 の実質監査（各成果物の必須見出し / 必須要件の充足を実測）
- Step 1-A〜1-F の実更新確認（`git diff --stat` 等で実変更を観測）
- mirror parity 実測値（`diff -qr .claude/ .agents/` の出力）
- qualityInsights 11 フィールド全追記確認（`grep` 実行結果のコピー）
- 計画系文言 0 件の確認
- Phase 11 の `manual-test-result.md` 参照整合

### 判定ルール

- 1 つでも未充足があれば `PASS` にしない
- `PASS` は 6 成果物の実体と same-wave sync が揃った後のみ
- 自己申告（テキスト主張のみ）は不可。必ず CLI 実行結果のコピーを貼り付ける

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`outputs/phase-11/screenshots/` ディレクトリは作成せず、Phase 12 の成果物群にも同一文言を明記する。

---

## 参照資料

### 実装・ドキュメント

| 資料名                      | パス                                                                                   | 用途                               |
| --------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                                               | Phase 11 正本・NON_VISUAL 判定根拠 |
| Phase 11 チェックリスト     | `outputs/phase-11/manual-test-checklist.md`                                            | AC トレース                        |
| Phase 10 最終レビュー結果   | `outputs/phase-10/final-review-result.md`                                              | Phase 10 成果物                    |
| Phase 9 品質保証レポート    | `outputs/phase-9/quality-assurance-report.md`                                          | Phase 9 成果物                     |
| 追記対象（正本）            | `references/` 配下の qualityInsights 関連仕様書                                        | 完了確認の対象                     |
| Phase 12 完了チェックリスト | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 1〜6 の詳細手順               |
| タスク実行ルール            | `.claude/rules/05-task-execution.md`                                                   | Phase 12 必須チェックリスト        |

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                           | 用途                               |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | Step 1-A 同期対象（current facts） |
| topic-map               | `.claude/skills/aiworkflow-requirements/references/topic-map.md`               | qualityInsights キーワード反映先   |
| LOGS.md                 | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | Step 1-A 同期対象                  |
| SKILL.md                | `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴追記                       |

---

## 成果物

| 成果物                       | パス                                                     | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| コンプライアンスチェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] Task 1: 実装ガイドが完成している（Part 1 に「辞書に新しい言葉を追加する係」モチーフあり・`たとえば` 1 回以上、Part 2 に追記対象フィールド一覧 / 追記方針 / writer と運用責任の定義 / 確認コマンド / エッジケースが揃う）
- [ ] Task 2: システム仕様更新サマリーが完成している（Step 1-A〜1-F の判断記録あり）
- [ ] Task 3: LOGS.md・changelog が更新されている（SKILL-changelog.md への反映確認あり）
- [ ] Task 4: 未タスク検出レポートが完成している（0 件でも出力）
- [ ] Task 5: スキルフィードバックレポートが完成している（改善なしでも出力）
- [ ] Task 6: コンプライアンスチェックが完成している（CLI 実測値で記録）
- [ ] `task-workflow-completed.md` / 両 skill `LOGS.md` / 両 skill `SKILL.md` が同一 wave で同期されている
- [ ] mirror parity が確認されている（`diff -qr` 0 行）
- [ ] `manual-test-result.md` が Phase 11 の正本として参照されている
- [ ] `## 視覚証跡` セクションに「UI/UX 変更なしのため Phase 11 スクリーンショット不要」が明記されている

---

## タスク100%実行確認【必須】

- [ ] 6 成果物がすべて存在する
- [ ] `implementation-guide.md` Part 1 に「辞書に新しい言葉を追加する係」日常の例えと `たとえば` が含まれる
- [ ] `implementation-guide.md` Part 2 に追記対象フィールド一覧 / 追記方針 / writer と運用責任の定義 / 確認コマンド / エッジケースが揃う
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-F の記録がある
- [ ] `documentation-changelog.md` に変更ファイル一覧・確認コマンド実行結果・SKILL-changelog 反映確認がある
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `skill-feedback-report.md` が改善なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が最終ゲートとして完了している
- [ ] 両 skill `SKILL.md` 変更履歴に本タスクのバージョンが追記されている
- [ ] 両 skill `LOGS.md` に sync 記録が追記されている
- [ ] `.agents/skills/` ミラーが正本と一致する（`diff -qr` 0 行）
- [ ] 計画系文言が `outputs/phase-12/*.md` に残っていない

---

## 多角的チェック観点

| 観点            | チェック内容                                                          |
| --------------- | --------------------------------------------------------------------- |
| 完全性          | 6 成果物が全て存在し、必須見出し・必須要件が揃っているか              |
| SKILL-changelog | 両 skill の SKILL.md / LOGS.md に本タスクの完了記録が追記されているか |
| mirror parity   | `.claude/` と `.agents/` の diff が 0 件であるか                      |
| docs-only       | 成果物にコード変更への言及が含まれていないか                          |
| 計画系文言      | `outputs/phase-12/*.md` に「予定」「TBD」「計画中」等が残っていないか |

---

## サブタスク管理

1. Task 1 と Task 2 を並列開始する
2. Task 3 は Task 1 / Task 2 の確定結果を受けて実施する
3. Task 4 と Task 5 は Task 2 確定後に並列実行する
4. Task 6 は全成果物が揃ってから実施する

---

## 次Phase

Phase 13（PR 作成）へ進む。**ユーザーの明示的な承認後のみ実施する。**

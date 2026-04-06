# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 12                                                                 |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 11                                                           |
| 後続Phase  | Phase 13                                                           |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

本タスクの実装内容を記録し、将来の参照・保守に役立てる。`implementation-guide.md`、`system-spec-update-summary.md`、`documentation-changelog.md`、`unassigned-task-detection.md`、`skill-feedback-report.md`、`phase12-task-spec-compliance-check.md` を同一 wave で作成する。

## 実行タスク

### タスク1: 実装ガイド作成

**目的**: 修正内容を後続の開発者が理解できるように記録する

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を作成する
2. 以下の内容を含める:
   - 修正の背景と目的
   - Part-aware extraction を選択した理由
   - `part2_usage_example` チェックの修正内容
   - changelog テンプレートへの 5 フィールド追加内容
   - テスト追加内容（TC-01〜TC-07）
   - 使用例（validator の実行方法）
   - エラーハンドリング（validator がエラーを検出した場合の対処）
   - 設定項目と定数一覧
   - テスト構成

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様更新サマリー作成

**目的**: Step 1-A〜1-C と Step 2 の実施結果を、正本仕様書の更新有無と合わせて記録する

**実行手順**:

1. `outputs/phase-12/system-spec-update-summary.md` を作成する
2. Step 1-A の完了タスク記録、関連ドキュメントリンク、変更履歴、LOGS.md 2ファイル、SKILL.md 2ファイル、topic-map.md の更新結果を記録する
3. Step 1-B の実装状況テーブル更新結果を記録する
4. Step 1-C の関連タスクテーブル確認結果を記録する
5. Step 1-D の topic-map.md 再生成、Step 1-E の未タスク監査、Step 1-F の適用要否、Step 1-G の quick_validate / mirror parity を記録する
6. Step 2 の更新要否判定、current / baseline、artifacts 同期結果を記録する

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成

**目的**: 変更履歴と validator 実行結果を、後続の監査が辿れる形で記録する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` の修正後テンプレートを使用する
3. 変更者・関連 Issue / PR・validator 実行結果・current / baseline・artifacts 同期結果を記録する
4. 変更したファイル一覧と、更新不要だったファイルの理由を記録する
5. `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` / `topic-map.md` の同期結果を記録する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 0件でも必須の未タスク検出結果を残し、必要なら formalize まで完了させる

**実行手順**:

1. `outputs/phase-12/unassigned-task-detection.md` を作成する
2. 0件の場合でも baseline/current を分けて summary を残す
3. 1件以上の場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` と関連仕様書へのリンクを記録する
4. 既存未タスクとの重複がある場合は、今回差分か baseline かを分離して記録する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: skill-feedback-report 作成

**目的**: 本タスク実行を通じた知見を次のタスクへ引き継ぐ

**実行手順**:

1. `outputs/phase-12/skill-feedback-report.md` を作成する
2. 苦戦箇所・改善提案・再利用できるパターンを記録する
3. 改善点がない場合でも、その理由と再発防止の観点を記録する

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

### タスク6: phase12-task-spec-compliance-check 作成

**目的**: Task 1〜5 と Step 1-A〜1-G / Step 2 の準拠状況を 1 ファイルに集約する

**実行手順**:

1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する
2. `phase12-task-spec-compliance-template.md` を使用して、成果物の存在だけでなく内容要件も確認する
3. `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の 5 成果物を突合する
4. validator、未タスク監査、artifacts parity、mirror parity、保留表現ゼロ化を記録する

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料                    | パス                                                                                        | 用途                          |
| --------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| 手動テスト結果              | `outputs/phase-11/manual-test-report.md`                                                    | 実装内容の確認                |
| Phase 12 ドキュメントガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 実装ガイド・完了条件の基準    |
| 完了条件チェックリスト      | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`     | 成果物・同期要件の確認        |
| 仕様更新ワークフロー        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1-A〜1-G / Step 2 の確認 |
| compliance テンプレート     | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | root evidence 作成基準        |
| changelog テンプレート      | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`      | changelog 作成テンプレート    |

## 成果物

| 成果物                 | パス                                                     | 内容                        |
| ---------------------- | -------------------------------------------------------- | --------------------------- |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`               | 実装内容の詳細記録          |
| 仕様更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 記録 |
| changelog              | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                    |
| 未タスク検出レポート   | `outputs/phase-12/unassigned-task-detection.md`          | 未タスクの有無と対応        |
| フィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 知見と改善提案              |
| 準拠チェック           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence               |

## 完了条件

- [x] 実装ガイドに `### 使用例` セクションが含まれている
- [x] `system-spec-update-summary.md` が作成され、Step 1-A〜1-G / Step 2 の結果が記録されている
- [x] changelog に 5 つの必須フィールドが記録されている
- [x] `unassigned-task-detection.md` が作成されている
- [x] skill-feedback-report が作成されている
- [x] `phase12-task-spec-compliance-check.md` が作成されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 13: PR 作成

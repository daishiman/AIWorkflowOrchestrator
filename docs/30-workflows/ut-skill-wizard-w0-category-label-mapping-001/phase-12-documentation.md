# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 11                                      |
| 後続Phase  | Phase 13（blocked / 承認待ち）                |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

`SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` の追加内容を、system spec、workflow 台帳、変更履歴、未タスク、フィードバック、準拠チェックへ 1 wave で同期する。

## 事前チェック【必須】

- P1 / P25: `LOGS.md` 2 ファイルの更新漏れがないか確認する
- P2 / P27: `topic-map.md` と workflow index の再生成忘れがないか確認する
- P3: 未タスク管理の 3 ステップが崩れていないか確認する
- P4: 早期の「完了」記載をしない
- P28: `skill-feedback-report.md` を省略しない
- P29: `SKILL.md` の変更履歴更新漏れがないか確認する
- root `artifacts.json` と `outputs/artifacts.json` の parity を初手で確認する
- `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` を残さない

## 実行タスク

| Task      | 内容                          | 主成果物                                                 |
| --------- | ----------------------------- | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成          | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新      | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成      | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                  | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 コンプライアンス確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成（Part 1 + Part 2）
- Task 12-2: システムドキュメント更新（Step 1 + Step 2）
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバックレポート作成
- Task 12-6: Phase 12 コンプライアンス確認

## 並列実行方針

- Task 12-2 の Step 1 を固定した後、Task 12-1 / 12-3 / 12-4 / 12-5 は並列実行できる
- Task 12-2 の Step 2 は Step 1 完了後に実施する
- Task 12-6 は全成果物が揃うまで実行しない

## Task 12-1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者       | 内容                                         |
| ------ | -------------- | -------------------------------------------- |
| Part 1 | 初学者・中学生 | 概念的説明（日常の例え話、専門用語なし）     |
| Part 2 | 開発者・技術者 | 技術的詳細（型、シグネチャ、使用例、エラー） |

**Part 1 の要件**

- 日常生活での例え話を必ず含め、`たとえば` を最低 1 回明示する
- 専門用語は使わない。使う場合は即座に日常語で説明する
- 「なぜ必要か」→「何をするか」の順序を守る
- 図表より文章を優先する

**Part 2 の要件**

- TypeScript の `interface` / `type` 定義を含める
- API シグネチャと使用例を記載する
- エラーハンドリングとエッジケースを説明する
- 設定可能なパラメータと定数を一覧化する
- `current contract` と `target delta` を混ぜない

**確認**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001
```

## Task 12-2: システムドキュメント更新【必須】

> 詳細は `references/spec-update-workflow.md` を参照する。

### Step 1: タスク完了記録【必須】

| Step | 要件                                                                                                           | 備考                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1-A  | 完了タスク section を追加し、実装ガイドリンク・変更履歴・`LOGS.md` 2 ファイル・`SKILL.md` 2 ファイルを更新する | `completed`                                                                                               |
| 1-B  | 実装状況テーブルを `completed` に更新する                                                                      | `spec_created` ではない                                                                                   |
| 1-C  | 関連タスク table を更新する                                                                                    | `task-workflow.md` を含む                                                                                 |
| 1-D  | `generate-index.js` を aiworkflow-requirements と task-specification-creator の両方で実行する                  | workflow index も再生成する                                                                               |
| 1-E  | 未タスクが出た場合は 3 ステップで formalize する                                                               | 0 件でも検出レポートを出力する                                                                            |
| 1-F  | DevOps / CI 向け更新はこの task では N/A を明記する                                                            | 必要時のみ別 wave                                                                                         |
| 1-G  | 検証コマンドを実行して結果を記録する                                                                           | `quick_validate.js` / `validate_all.js` / `verify-all-specs.js` / `validate-phase-output.js` / `diff -qr` |

### Step 2: システム仕様更新【条件付き】

| 条件                           | 更新対象                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| 新規 interface / type / export | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` |
| UI 表示や語彙参照も変わる      | 対応する `ui-ux-*` または `interfaces-*` の正本                                             |
| contract 変更なし              | `documentation-changelog.md` に N/A 理由を記録する                                          |

- `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` は `@repo/shared/types/skillCreator` のまま閉じる
- root `@repo/shared` へ export を広げない

## Task 12-3: ドキュメント更新履歴【必須】

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:システム仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/phase12-task-spec-compliance-check.md:Phase 12 準拠チェック"
```

記録内容:

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- root `artifacts.json` と `outputs/artifacts.json` の同期結果
- `implementation-guide.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の canonical path
- planned wording の残存有無

## Task 12-4: 未タスク検出【必須】

| Source               | 確認内容                          |
| -------------------- | --------------------------------- |
| Phase 3 review       | MINOR / MAJOR の残課題            |
| Phase 10 review      | 最終レビューで残った blocker      |
| Phase 11 manual test | scope-out / non-visual findings   |
| codebase             | `TODO` / `FIXME` / `HACK` / `XXX` |

- 0 件でも summary を残す
- 1 件以上なら formalize path を記録する
- raw メモで終わらせず、3 ステップ（指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンク）まで完了する
- UI でのラベル適用が後続タスクなら、その旨を scope-out として記録する

## Task 12-5: スキルフィードバックレポート【必須】

- ワークフロー改善点
- 技術的教訓
- スキル改善提案
- 新規 Pitfall 候補
- 改善点がなくても `改善点なし` と理由を書く

## Task 12-6: Phase 12 コンプライアンス確認【必須】

- Task 12-1〜12-5 の成果物が存在することを確認する
- Step 1-A〜1-G と Step 2 の実施結果を 1 ファイルへ束ねる
- root `artifacts.json` と `outputs/artifacts.json` の同値性を確認する
- `phase-12-documentation.md` に planned wording が残っていないことを確認する
- validator 実測値、root parity、same-wave sync の根拠を残す
- 未充足が 1 つでもある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする

## 参照資料

| 参照資料                  | パス                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| 実装ガイド定義            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`          |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`         |
| システム仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  |
| 検証マトリクス            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`         |
| Phase 12 詳細テンプレート | `.claude/skills/task-specification-creator/references/phase12-task-spec-compliance-template.md` |

## 成果物

| 成果物                       | パス                                                     | 説明                    |
| ---------------------------- | -------------------------------------------------------- | ----------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2         |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも必須） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点（なしでも必須）  |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終根拠                |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] Task 12-1〜12-6 がすべて定義されている
- [ ] Step 1-A〜1-G と Step 2 の実施方針が明記されている
- [ ] root / outputs の artifacts parity が確認される
- [ ] planned wording が残っていない
- [ ] 本 Phase 内の全タスクを 100% 実行完了する

## サブタスク管理

1. 事前チェック
2. Task 12-1
3. Task 12-2
4. Task 12-3
5. Task 12-4
6. Task 12-5
7. Task 12-6

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載の 6 ファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次のPhase

Phase 13: PR作成（blocked / 承認待ち）

# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 12                                                     |
| Phase名    | ドキュメント更新                                       |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001                        |
| 前提Phase  | Phase 11: 手動テスト（VISUAL）                         |
| 次Phase    | Phase 13: PR作成・CI確認（blocked / ユーザー承認待ち） |
| ステータス | pending                                                |
| 作成日     | 2026-04-14                                             |

## 目的

direct input モードへの月次バリデーション追加について、技術ドキュメント・システム仕様更新・変更履歴・未タスク検出・フィードバックレポート・準拠チェックを 1 wave で同期する。中学生にもわかるcron式バリデーションの概念説明を含む。

## 事前チェック【必須】

- [ ] `LOGS.md` 2 ファイルの更新漏れがないか確認する
- [ ] `topic-map.md` と workflow index の再生成忘れがないか確認する
- [ ] 未タスク管理の 3 ステップが崩れていないか確認する
- [ ] 早期の「完了」記載をしない
- [ ] `skill-feedback-report.md` を省略しない
- [ ] `SKILL.md` の変更履歴更新漏れがないか確認する
- [ ] root `artifacts.json` と `outputs/artifacts.json` の parity を初手で確認する
- [ ] `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` を残さない

## 実行タスク

| Task      | 内容                                   | 主成果物                                                 |
| --------- | -------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（中学生向け含む） | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新               | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                           | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート           | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 タスク spec 準拠チェック      | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 並列実行方針

- Task 12-2 の Step 1 を固定した後、Task 12-1 / 12-3 / 12-4 / 12-5 は並列実行できる
- Task 12-2 の Step 2 は Step 1 完了後に実施する
- Task 12-6 は全成果物が揃うまで実行しない

## Task 12-1: 技術ドキュメント作成【必須・2パート構成】

| パート | 対象読者       | 内容                                         |
| ------ | -------------- | -------------------------------------------- |
| Part 1 | 初学者・中学生 | 概念的説明（日常の例え話、専門用語なし）     |
| Part 2 | 開発者・技術者 | 技術的詳細（型、シグネチャ、使用例、エラー） |

### Part 1 の要件（中学生向け概念説明）

- **cron式バリデーション**をわかりやすく説明する
- 日常生活での例え話を必ず含め、`たとえば` を最低 1 回明示する
  - 例: 「目覚まし時計の設定で、"毎月0日に起こして"と言っても0日は存在しないよね。cron式バリデーションはこういう"ありえない設定"を見つけてお知らせする仕組みだよ」
- 専門用語は使わない。使う場合は即座に日常語で説明する
- 「なぜ必要か」→「何をするか」の順序を守る
- 図表より文章を優先する
- direct input（直接入力）とvisual（見た目で選ぶ）の違いを説明する

### Part 2 の要件

- `validateCronSyntax` / `validateCronDayOfMonth` の API シグネチャと使用例を記載する
- `directInputError` 状態管理のフローを説明する
- `onValidationChange` コールバックの呼び出し条件を一覧化する
- エラーメッセージの表示条件と `role="alert"` の意味を説明する
- visual モードとの共存（後方互換性）を説明する

### 実装コードへのコメント追加

`VisualCronPicker.tsx` の `directInputError` ロジックに説明コメントを追加する:

```bash
# directInputError 関連のコードを確認
grep -n "directInputError" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

**確認**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/TASK-CRON-CUSTOM-VALIDATION-001
```

## Task 12-2: システムドキュメント更新【必須】

### Step 1: タスク完了記録【必須】

| Step | 要件                                                                                                           | 備考                     |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1-A  | 完了タスク section を追加し、実装ガイドリンク・変更履歴・`LOGS.md` 2 ファイル・`SKILL.md` 2 ファイルを更新する | `completed`              |
| 1-B  | 実装状況テーブルを `completed` に更新する                                                                      | `spec_created` ではない  |
| 1-C  | 関連タスク table を更新する                                                                                    | `task-workflow.md` 含む  |
| 1-D  | `generate-index.js` を aiworkflow-requirements と task-specification-creator の両方で実行する                  | workflow index も再生成  |
| 1-E  | 未タスクが出た場合は 3 ステップで formalize する                                                               | 0 件でも検出レポート     |
| 1-F  | DevOps / CI 向け更新はこの task では N/A を明記する                                                            | 必要時のみ別 wave        |
| 1-G  | 検証コマンドを実行して結果を記録する                                                                           | 各種 validate スクリプト |

### Step 2: システム仕様更新【条件付き】

| 条件                           | 更新対象                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| 新規 interface / type / export | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` |
| UI 表示や語彙参照も変わる      | 対応する `ui-ux-*` または `interfaces-*` の正本                                             |
| contract 変更なし              | `documentation-changelog.md` に N/A 理由を記録する                                          |

- 本タスクは `VisualCronPicker.tsx` 内部のバリデーションロジック追加であり、外部 interface / type の変更なし
- `directInputError` は内部状態のため contract 変更に該当しない見込み

## Task 12-3: ドキュメント更新履歴【必須】

記録内容:

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- root `artifacts.json` と `outputs/artifacts.json` の同期結果
- 各成果物の canonical path
- planned wording の残存有無

## Task 12-4: 未タスク検出【必須】

| Source               | 確認内容                          |
| -------------------- | --------------------------------- |
| Phase 3 review       | MINOR / MAJOR の残課題            |
| Phase 10 review      | 最終レビューで残った blocker      |
| Phase 11 manual test | scope-out / VISUAL findings       |
| codebase             | `TODO` / `FIXME` / `HACK` / `XXX` |

- 0 件でも summary を残す
- 1 件以上なら formalize path を記録する
- raw メモで終わらせず、3 ステップ（指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンク）まで完了する

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

| 成果物                       | パス                                                     | 説明                                        |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生向け） / Part 2（技術者向け） |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果                      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                                    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも必須）                     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点（なしでも必須）                      |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終根拠                                    |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] Task 12-1 の Part 1 に中学生向けcron式バリデーション概念説明が含まれている
- [ ] Task 12-1 の Part 1 に `たとえば` を含む日常の例え話がある
- [ ] `VisualCronPicker.tsx` の directInputError ロジックに説明コメントが追加されている
- [ ] Task 12-1〜12-6 がすべて実施されている
- [ ] Step 1-A〜1-G と Step 2 の実施方針が明記されている
- [ ] root / outputs の artifacts parity が確認されている
- [ ] planned wording が残っていない
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前チェック
2. Task 12-1（Part 1: 中学生向け概念説明 + Part 2: 技術詳細）
3. Task 12-2（Step 1: タスク完了記録 + Step 2: システム仕様更新）
4. Task 12-3
5. Task 12-4
6. Task 12-5
7. Task 12-6

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載の 6 ファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 13: PR作成・CI確認](./phase-13-pr-creation.md)（blocked / ユーザー承認待ち）

# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                                      |
| -------- | ------------------------------------------------------- |
| Phase    | 12                                                      |
| タスクID | TASK-SW-CANCEL-004                                      |
| 前Phase  | [phase-11-manual-test.md](phase-11-manual-test.md)      |
| 次Phase  | [phase-13-pr-creation.md](phase-13-pr-creation.md)      |
| 目的     | mandatory 5 tasks を完了し、close-out evidence を揃える |

## 目的

mandatory 5 tasks を完了し、close-out evidence を揃える。

## 事前チェック【必須】

- `manual-test-result.md` が存在する
- `final-review-result.md` の blocker が 0 件
- `artifacts.json` と `outputs/artifacts.json` の parity が確認済み

## 実行タスク

- Task 12-1: 実装ガイドを作成する。
- Task 12-2: system spec update summary を作成する。
- Task 12-3: documentation changelog を作成する。
- Task 12-4: unassigned task detection を作成する。
- Task 12-5: skill feedback report と compliance check を作成する。

| Task      | 内容                               | 主成果物                                                                                              |
| --------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成                     | `outputs/phase-12/implementation-guide.md`                                                            |
| Task 12-2 | system spec update summary         | `outputs/phase-12/system-spec-update-summary.md`                                                      |
| Task 12-3 | documentation changelog            | `outputs/phase-12/documentation-changelog.md`                                                         |
| Task 12-4 | unassigned task detection          | `outputs/phase-12/unassigned-task-detection.md`                                                       |
| Task 12-5 | skill feedback と compliance check | `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## Task 12-1: 実装ガイド【必須】

| パート | 対象読者             | 必須内容                                                                                                      |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | なぜ必要か → 何をするか。「たとえば」を含む日常例え話（キャンセルボタンが実際に処理を止める仕組みのたとえ話） |
| Part 2 | 開発者・技術者       | IPC 3層モデルの説明、確認コマンド、テストケース一覧、CANCEL chain 完結の証跡、不足修正があった場合はその内容  |

### Part 1 の例え話のヒント

「電話を切るボタン（キャンセルボタン）を押したとき、画面（Renderer）→ 電話交換機（Preload）→ 相手側（Main プロセス）まで切断信号が確実に届いているかを確認する作業」

### NON_VISUAL 視覚証跡【必須】

`implementation-guide.md` に `## 視覚証跡` セクションを設け、次を明記する：

```markdown
## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡は以下：

- outputs/phase-10/final-review-result.md
- outputs/phase-11/manual-test-result.md
```

## Task 12-2: system spec update summary【必須】

### Step 1-A: タスク完了記録

- CANCEL-001〜004 チェーン完結の記録対象を列挙する
- `LOGS.md` × 2 の更新要否を記録する
- 関連ドキュメントリンクと変更履歴を記録する
- `topic-map.md` 更新要否を記録する

### Step 1-B: 実装状況テーブル

- skill-creator キャンセル機能の実装状況テーブル更新要否を記録する

### Step 1-C: 関連タスク同期

- CANCEL-001〜003 との関連同期要否を記録する

### Step 1-D〜1-G: close-out 網羅確認

- Step 1-D: `artifacts.json` / `outputs/artifacts.json` parity を記録する
- Step 1-E: validator / verify 結果を記録する
- Step 1-F: 実施しなかった同期とその理由を記録する
- Step 1-G: task 固有 path で evidence が閉じていることを記録する

### Step 2: interface / API / IPC 契約変更確認

- 本タスクが IPC チャンネル定義や API interface を変更したか確認する
- 変更がなければ「更新不要」と理由を記録する

## Task 12-3: documentation changelog【必須】

記載すべき主な変更：

- CANCEL-004 タスク仕様書の新規作成（`docs/30-workflows/TASK-SW-CANCEL-004/`）
- E2E 統合テストの追加（ある場合）
- Phase 1 確認で判明した不足項目の修正内容（あった場合）
- CANCEL-001〜004 チェーン完結の達成

## Task 12-4: unassigned task detection【必須】

- Phase 12 実施時点で残存する未タスクを検出する
- 0 件でも `unassigned-task-detection.md` を出力する
- 将来課題があれば `docs/30-workflows/unassigned-task/` へ formalize する

## Task 12-5: skill feedback【必須】

- 改善点がなくても「改善点なし」を記録する
- `phase12-task-spec-compliance-check.md` にて task-specification-creator skill への準拠を確認する

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/phase-11-manual-test.md`
- `.agents/skills/task-specification-creator/references/phase-template-phase12.md`
- `.agents/skills/task-specification-creator/references/phase-12-guide.md`
- `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-creator-cancel-chain.md`

## 成果物

| 成果物                     | パス                                                     |
| -------------------------- | -------------------------------------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] mandatory 5 tasks（Task 12-1〜12-5）が全て完了している
- [ ] `implementation-guide.md` に Part 1 / Part 2 と視覚証跡セクションがある
- [ ] Step 1-A〜1-C と Step 2 の記録がある
- [ ] `unassigned-task-detection.md` が出力されている（0 件でも）
- [ ] skill feedback と compliance check が成果物に含まれている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity が確認されている

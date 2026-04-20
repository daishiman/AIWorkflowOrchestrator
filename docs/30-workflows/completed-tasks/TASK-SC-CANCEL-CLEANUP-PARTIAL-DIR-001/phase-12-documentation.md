# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 12                                                 |
| タスク種別 | NON_VISUAL code task                               |
| 前Phase    | [phase-11-manual-test.md](phase-11-manual-test.md) |
| 次Phase    | [phase-13-pr-creation.md](phase-13-pr-creation.md) |

## 目的

mandatory 5 tasks を完了し、system spec sync と close-out evidence を揃える。

## 事前チェック【必須】

- `manual-test-result.md` がある
- `final-review-result.md` の blocker が 0 件
- `artifacts.json` と `outputs/artifacts.json` の parity がある

## 実行タスク

| Task      | 内容                               | 主成果物                                                                                              |
| --------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成                     | `outputs/phase-12/implementation-guide.md`                                                            |
| Task 12-2 | system spec update summary         | `outputs/phase-12/system-spec-update-summary.md`                                                      |
| Task 12-3 | documentation changelog            | `outputs/phase-12/documentation-changelog.md`                                                         |
| Task 12-4 | unassigned task detection          | `outputs/phase-12/unassigned-task-detection.md`                                                       |
| Task 12-5 | skill feedback と compliance check | `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイドを 2 パート構成で作成する
- Task 12-2: Step 1-A〜1-C と Step 2 の要否判断を記録する
- Task 12-3: documentation changelog を作成する
- Task 12-4: 未タスクを検出し 0 件でもレポートを出す
- Task 12-5: skill feedback と compliance check を記録する

## Task 12-1: 実装ガイド【必須】

| パート | 対象読者             | 必須内容                                                                                       |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | なぜ必要か → 何をするか。`たとえば` を含む日常例え話を入れる                                   |
| Part 2 | 開発者・技術者       | TypeScript の型/シグネチャ、使用例、差分確認コマンド、エラーハンドリング、エッジケース、設定値 |

### NON_VISUAL 視覚証跡【必須】

`implementation-guide.md` に `## 視覚証跡` を設け、次を明記する。

- UI/UX変更なしのため Phase 11 スクリーンショット不要
- 代替証跡は `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

## Task 12-2: system spec update summary【必須】

### Step 1-A

- task 完了記録対象を列挙する
- `LOGS.md` x 2 の更新要否を記録する

### Step 1-B

- 実装状況テーブル更新要否を記録する

### Step 1-C

- 関連 task / unassigned task の同期要否を記録する

### Step 2

- 本 task は内部実装差分確認であり、interface / API / IPC 契約変更がなければ「更新不要」と理由を記録する

### same-wave sync

- `artifacts.json`
- `outputs/artifacts.json`
- Phase 12 成果物名

## Task 12-3: documentation changelog【必須】

- phase spec 再構成内容
- artifact 名統一
- `NON_VISUAL code task` への再分類

## Task 12-4: unassigned task detection【必須】

- 0 件でも出力する
- 将来課題があれば `docs/30-workflows/unassigned-task/` へ formalize する

## Task 12-5: skill feedback【必須】

- 改善点がなくても `改善点なし` を記録する
- あわせて `phase12-task-spec-compliance-check.md` を作る

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

- [ ] 実行タスクを表と箇条書きの両方で記載している
- [ ] Part 1 / Part 2 の要件が明記されている
- [ ] Step 1-A〜1-C と Step 2 の要否判断が定義されている
- [ ] NON_VISUAL 代替証跡が明記されている
- [ ] skill feedback と compliance check が成果物に含まれている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を確認対象に含めている

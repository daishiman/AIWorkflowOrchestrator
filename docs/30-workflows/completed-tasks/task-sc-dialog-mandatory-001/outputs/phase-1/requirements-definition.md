# 要件定義書

## メタ情報

| 項目          | 値                                                  |
| ------------- | --------------------------------------------------- |
| タスクID      | TASK-SC-DIALOG-MANDATORY-001                        |
| タスク種別    | skill-update（docs-only）                           |
| 変更対象      | `.claude/skills/skill-creator/` 配下の3ファイルのみ |
| コード変更    | なし                                                |
| テストコード  | なし（Phase 4 はウォークスルー形式のテスト仕様）    |
| Phase 11 種別 | NON_VISUAL（手動ウォークスルー）                    |
| Phase 12 種別 | docs-heavy（system spec 更新 + 未タスク検出）       |
| 作成日        | 2026-04-01                                          |

## 問題の背景

`skill-creator` スキルがユーザーと対話せずに一方通行でスキルを生成してしまう問題がある。

**根本原因**: `SKILL.md` が「ドキュメント（説明書）」として書かれており、Claude への「実行コントロール命令」として機能していない。宣言型の記述（「推奨する」）は LLM が有用性バイアスで飛ばしてしまうため、命令型（「してはならない」「必ず〜する」）への変更が必要。

## 変更対象ファイル（ベースライン確認済み）

| ファイル                                                  | 確認済み変更前状態                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `.claude/skills/skill-creator/SKILL.md`                   | `# Skill Creator` 直後に「最初のステップ」を定義する記述が存在しなかった                 |
| `.claude/skills/skill-creator/agents/discover-problem.md` | 「このファイルを読んだら〇〇を実行せよ」という命令形記述が存在しなかった                 |
| `.claude/skills/skill-creator/agents/interview-user.md`   | セクション 5.1 の `problem-definition.json` 欠損時処理が「Phase 0-0 未完了エラー」だった |

## 受入基準（AC-001〜AC-006）

| ID     | 基準                                                                                                             | 検証方法           |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| AC-001 | `/skill-creator` を呼び出したとき、ユーザーへの質問なしにスキル生成が開始されない                                | 手動ウォークスルー |
| AC-002 | `/skill-creator` 呼び出し後、最初のレスポンスに `AskUserQuestion`（インタビュー深度選択）が含まれる              | 手動ウォークスルー |
| AC-003 | ユーザーが詳細な要件を書いた場合でも、少なくとも1回の確認質問がある                                              | 手動ウォークスルー |
| AC-004 | `discover-problem.md` を読み込んだ Claude が、問題発見フェーズの質問を最初のアクションとして実行する             | 手動ウォークスルー |
| AC-005 | `problem-definition.json` が存在しない初回呼び出しで、Claude がエラー停止せずに AskUserQuestion で収集を開始する | 手動ウォークスルー |
| AC-006 | 変更後も既存の `collaborative` フロー（Phase 0-0 〜 0-8）の動作仕様に変更がない                                  | コードレビュー     |

## スコープ確定

### 含む

- `.claude/skills/skill-creator/SKILL.md` の修正
  - `# Skill Creator` 見出し直後に `## 必須：最初の実行ステップ` ブロックを追加
- `.claude/skills/skill-creator/agents/discover-problem.md` の修正
  - ファイル冒頭に実行ゲート（AskUserQuestion 強制）の命令文を追加
- `.claude/skills/skill-creator/agents/interview-user.md` の修正
  - セクション 5.1 の `problem-definition.json` 欠損時処理を「エラー」から「AskUserQuestion で収集」に変更

### 含まない

- 他の agents/ ファイルの変更
- references/ ファイルの変更
- scripts/ の変更
- アプリケーションコード・テストコードの変更
- commit / PR 作成 / push（Phase 13 でユーザー承認があるまで実行しない）

## artifact 命名 canonical 一覧

| artifact ID    | ファイル名                            | 配置先            |
| -------------- | ------------------------------------- | ----------------- |
| requirements   | requirements-definition.md            | outputs/phase-1/  |
| design         | design-summary.md                     | outputs/phase-2/  |
| design-review  | design-review-result.md               | outputs/phase-3/  |
| test-plan      | test-plan.md                          | outputs/phase-4/  |
| impl-record    | implementation-record.md              | outputs/phase-5/  |
| test-expansion | test-expansion-record.md              | outputs/phase-6/  |
| coverage       | coverage-check.md                     | outputs/phase-7/  |
| refactoring    | refactoring-summary.md                | outputs/phase-8/  |
| qa-report      | quality-report.md                     | outputs/phase-9/  |
| final-review   | final-review-result.md                | outputs/phase-10/ |
| manual-test    | manual-test-result.md                 | outputs/phase-11/ |
| impl-guide     | implementation-guide.md               | outputs/phase-12/ |
| spec-update    | system-spec-update-summary.md         | outputs/phase-12/ |
| doc-changelog  | documentation-changelog.md            | outputs/phase-12/ |
| unassigned     | unassigned-task-detection.md          | outputs/phase-12/ |
| feedback       | skill-feedback-report.md              | outputs/phase-12/ |
| compliance     | phase12-task-spec-compliance-check.md | outputs/phase-12/ |

## 多角的チェック観点

| 観点         | 適用判断               | 確認内容                                                 |
| ------------ | ---------------------- | -------------------------------------------------------- |
| セキュリティ | 非該当（文書変更のみ） | —                                                        |
| UI/UX        | 非該当                 | —                                                        |
| IPC          | 非該当                 | —                                                        |
| LLM指示設計  | **必須**               | 「推奨」ではなく「命令形（MUST）」で記述されているか確認 |
| 後方互換性   | **必須**               | 既存の collaborative フローが破壊されていないことを確認  |

## 完了チェックリスト

- [x] 変更対象3ファイルの現状を確認し、ベースラインを記録した
- [x] 受入基準 AC-001〜AC-006 が検証可能な形で定義されている
- [x] タスク分類（skill-update/docs-only/NON_VISUAL）が確定している
- [x] artifact 命名 canonical 一覧が確定している
- [x] `outputs/phase-1/requirements-definition.md` が作成されている

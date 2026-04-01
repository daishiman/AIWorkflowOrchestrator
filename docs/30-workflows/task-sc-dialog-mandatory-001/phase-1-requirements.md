# Phase 1: 要件定義

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| 機能名 | task-sc-dialog-mandatory-001 |
| 作成日 | 2026-04-01                   |

## 目的

変更対象3ファイルの現状を確認し、受入基準・スコープ・命名規則を確定する。
docs-only タスクとして分類し、Phase 11 を NON_VISUAL（手動ウォークスルー）と明示する。

## 実行タスク

- 変更対象ファイルの現状確認と命名規則分析
- 受入基準（AC-001〜AC-006）の詳細化
- スコープ境界の確定（含む / 含まない）
- artifacts.json の artifact 命名 canonical 一覧を確定する

## 参照資料

| 資料名                     | パス                                                      | 説明                          |
| -------------------------- | --------------------------------------------------------- | ----------------------------- |
| skill-creator SKILL.md     | `.claude/skills/skill-creator/SKILL.md`                   | 修正対象（現状確認）          |
| discover-problem.md        | `.claude/skills/skill-creator/agents/discover-problem.md` | 修正対象（現状確認）          |
| interview-user.md          | `.claude/skills/skill-creator/agents/interview-user.md`   | 修正対象（現状確認）          |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`      | Phase 1-13 フォーマットの正本 |

## 実行手順

### ステップ1: タスク分類の確定

本タスクの分類を以下のとおり確定する。

| 項目          | 値                                                  |
| ------------- | --------------------------------------------------- |
| タスク種別    | skill-update（docs-only）                           |
| 変更対象      | `.claude/skills/skill-creator/` 配下の3ファイルのみ |
| コード変更    | なし                                                |
| テストコード  | なし（Phase 4 はウォークスルー形式のテスト仕様）    |
| Phase 11 種別 | NON_VISUAL（手動ウォークスルー）                    |
| Phase 12 種別 | docs-heavy（system spec 更新 + 未タスク検出）       |

### ステップ2: 現状ファイルの確認

以下を確認し、変更前のベースラインを記録する。

**SKILL.md 確認ポイント**:

- `# Skill Creator` 見出しの位置（行番号）
- `## クイックスタート` テーブルの記述内容
- `collaborative` モードの説明がどこにあるか
- 現在「最初のステップ」を定義する記述が存在しないことを確認

**discover-problem.md 確認ポイント**:

- ファイル冒頭の読み込み条件の記述
- `AskUserQuestion` を使うステップの位置
- 「このファイルを読んだら〇〇を実行せよ」という命令形記述がないことを確認

**interview-user.md 確認ポイント**:

- セクション 5.1 の入力定義における `problem-definition.json` の欠損時処理
- 現在「Phase 0-0 未完了エラー」と記述されていることを確認

### ステップ3: 受入基準の詳細化

| ID     | 基準                                                                                                             | 検証方法           |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| AC-001 | `/skill-creator` を呼び出したとき、ユーザーへの質問なしにスキル生成が開始されない                                | 手動ウォークスルー |
| AC-002 | `/skill-creator` 呼び出し後、最初のレスポンスに `AskUserQuestion`（インタビュー深度選択）が含まれる              | 手動ウォークスルー |
| AC-003 | ユーザーが詳細な要件を書いた場合でも、少なくとも1回の確認質問がある                                              | 手動ウォークスルー |
| AC-004 | `discover-problem.md` を読み込んだ Claude が、問題発見フェーズの質問を最初のアクションとして実行する             | 手動ウォークスルー |
| AC-005 | `problem-definition.json` が存在しない初回呼び出しで、Claude がエラー停止せずに AskUserQuestion で収集を開始する | 手動ウォークスルー |
| AC-006 | 変更後も既存の `collaborative` フロー（Phase 0-0 〜 0-8）の動作仕様に変更がない                                  | コードレビュー     |

### ステップ4: artifact 命名 canonical 一覧の確定

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

## 統合テスト連携

本タスクはコードの変更がないため、統合テスト（Vitest / Playwright）は対象外。
検証はすべて手動ウォークスルー（Phase 11）で実施する。

## 多角的チェック観点

| 観点         | 適用判断               | 確認内容                                                 |
| ------------ | ---------------------- | -------------------------------------------------------- |
| セキュリティ | 非該当（文書変更のみ） | —                                                        |
| UI/UX        | 非該当                 | —                                                        |
| IPC          | 非該当                 | —                                                        |
| LLM指示設計  | **必須**               | 「推奨」ではなく「命令形（MUST）」で記述されているか確認 |
| 後方互換性   | **必須**               | 既存の collaborative フローが破壊されていないことを確認  |

## 完了条件

- [ ] 変更対象3ファイルの現状を確認し、ベースラインを記録した
- [ ] 受入基準 AC-001〜AC-006 が検証可能な形で定義されている
- [ ] タスク分類（skill-update/docs-only/NON_VISUAL）が確定している
- [ ] artifact 命名 canonical 一覧が artifacts.json に反映されている
- [ ] `outputs/phase-1/requirements-definition.md` が作成されている

## 成果物

| 成果物                     | 配置先           |
| -------------------------- | ---------------- |
| requirements-definition.md | outputs/phase-1/ |

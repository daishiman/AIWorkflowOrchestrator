# task-sc-dialog-mandatory-001

## 概要

`skill-creator` スキルがユーザーと対話せずに一方通行でスキルを生成してしまう問題を修正する。

`SKILL.md` に「必須：最初の実行ステップ」ブロックを命令形で追加し、`discover-problem.md` に実行ゲートを設け、`interview-user.md` の前提ファイル依存をフォールバック対応に変更する。これにより、どんな入力であっても `AskUserQuestion` が最初のアクションとして強制される。

- current canonical task directory: `docs/30-workflows/task-sc-dialog-mandatory-001`

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-SC-DIALOG-MANDATORY-001 |
| タスク種別 | skill-update（docs-only）    |
| 優先度     | high                         |
| 複雑度     | small                        |
| ステータス | spec_created                 |
| 依存タスク | なし                         |
| 後続タスク | なし                         |
| 作成日     | 2026-04-01                   |
| 更新日     | 2026-04-01                   |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | SKILL.md が「ドキュメント（説明書）」として書かれており、Claude への「実行コントロール命令」として機能していない                                             |
| 依存関係・責務境界   | 変更は `.claude/skills/skill-creator/` 内の3ファイルのみに完結する。IPC・型・テストコードの変更なし                                                          |
| 価値とコストの不均衡 | SKILL.md 冒頭に命令形ブロックを追加するだけで対話強制が実現できる。変更量は極小、効果は最大                                                                  |
| 改善優先順位         | 1. SKILL.md 冒頭に必須実行ブロック追加（即時効果）2. discover-problem.md に実行ゲート追加（前提依存解消）3. interview-user.md フォールバック追加（構造修正） |
| 4条件評価            | 価値性: 高 / 実現性: 高（3ファイルのテキスト変更のみ）/ 整合性: 高 / 運用性: 高                                                                              |

## 受入基準

| ID     | 基準                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| AC-001 | `/skill-creator` を呼び出したとき、ユーザーへの質問なしにスキル生成が開始されない                                |
| AC-002 | `/skill-creator` 呼び出し後、最初のレスポンスに `AskUserQuestion`（インタビュー深度選択）が含まれる              |
| AC-003 | ユーザーが詳細な要件を書いた場合でも、少なくとも1回の確認質問がある                                              |
| AC-004 | `discover-problem.md` を読み込んだ Claude が、問題発見フェーズの質問を最初のアクションとして実行する             |
| AC-005 | `problem-definition.json` が存在しない初回呼び出しで、Claude がエラー停止せずに AskUserQuestion で収集を開始する |
| AC-006 | 変更後も既存の `collaborative` フロー（Phase 0-0 〜 0-8）の動作仕様に変更がない                                  |

## スコープ

**含む**:

- `.claude/skills/skill-creator/SKILL.md` の修正
  - `# Skill Creator` 見出し直後に `## 必須：最初の実行ステップ` ブロックを追加
- `.claude/skills/skill-creator/agents/discover-problem.md` の修正
  - ファイル冒頭に実行ゲート（AskUserQuestion 強制）の命令文を追加
- `.claude/skills/skill-creator/agents/interview-user.md` の修正
  - セクション 5.1 の `problem-definition.json` 欠損時処理を「エラー」から「AskUserQuestion で収集」に変更

**含まない**:

- 他の agents/ ファイルの変更
- references/ ファイルの変更
- scripts/ の変更
- アプリケーションコード・テストコードの変更
- commit / PR 作成 / push（Phase 13 でユーザー承認があるまで実行しない）

## 依存関係

| 種別      | 参照先                                                    | 役割                          |
| --------- | --------------------------------------------------------- | ----------------------------- |
| canonical | `.claude/skills/skill-creator/SKILL.md`                   | 修正対象の正本                |
| canonical | `.claude/skills/skill-creator/agents/discover-problem.md` | 修正対象の正本                |
| canonical | `.claude/skills/skill-creator/agents/interview-user.md`   | 修正対象の正本                |
| canonical | `.claude/skills/task-specification-creator/SKILL.md`      | Phase 1-13 テンプレートの正本 |
| reference | 30種の思考法分析結果（本タスク起票時の分析）              | 設計根拠                      |

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)

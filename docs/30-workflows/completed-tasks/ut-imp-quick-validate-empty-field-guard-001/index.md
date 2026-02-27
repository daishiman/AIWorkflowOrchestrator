# UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001

## メタ情報

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001                                      |
| タスク名     | quick_validate.js name/description 空フィールドガード追加                        |
| 分類         | バグ修正（小規模）                                                               |
| 優先度       | 高（ランタイム例外の防止）                                                       |
| 見積もり規模 | S（1ファイル修正 + テスト追加）                                                  |
| Issue        | #913                                                                             |
| ブランチ     | feature/ut-imp-quick-validate-empty-field-guard-001-specs                        |
| 作成日       | 2026-02-27                                                                       |
| 対象ファイル | `.claude/skills/skill-creator/scripts/quick_validate.js`                         |
| テスト       | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`          |
| 成果物       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/` |

## 概要

`quick_validate.js` の `validateSkill()` 関数において、`frontmatter.name` / `frontmatter.description` が空文字・未定義・非文字列型の場合に `.toLowerCase()` / `.includes()` / `.length` の呼び出しでランタイム例外が発生するバグを修正する。

P42（`.trim()` バリデーション漏れ）準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を導入し、例外ではなく検証エラーとして明示的に返す。

## 対象箇所

| 行範囲   | 現在の処理                                   | 問題                                                     |
| -------- | -------------------------------------------- | -------------------------------------------------------- |
| L140-155 | `!frontmatter.name` で falsy チェック        | 非文字列型（数値、boolean、オブジェクト）が通過する      |
| L158-193 | `!frontmatter.description` で falsy チェック | 非文字列型で `.includes()` / `.toLowerCase()` が例外発生 |

## Phase 一覧

| Phase | 名称             | ファイルパス                   | ステータス |
| ----- | ---------------- | ------------------------------ | ---------- |
| 1     | 要件定義         | `phase-1-requirements.md`      | completed  |
| 2     | 設計             | `phase-2-design.md`            | completed  |
| 3     | 設計レビュー     | `phase-3-design-review.md`     | completed  |
| 4     | テスト作成       | `phase-4-test-creation.md`     | completed  |
| 5     | 実装             | `phase-5-implementation.md`    | completed  |
| 6     | テスト拡充       | `phase-6-test-expansion.md`    | completed  |
| 7     | カバレッジ確認   | `phase-7-coverage-check.md`    | completed  |
| 8     | リファクタリング | `phase-8-refactoring.md`       | completed  |
| 9     | 品質検証         | `phase-9-quality-assurance.md` | completed  |
| 10    | 最終レビュー     | `phase-10-final-review.md`     | completed  |
| 11    | 手動テスト       | `phase-11-manual-test.md`      | completed  |
| 12    | ドキュメント     | `phase-12-documentation.md`    | completed  |
| 13    | 完了             | `phase-13-pr-creation.md`      | pending    |

## 成果物一覧

| 成果物                       | パス                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| 修正済みスクリプト           | `.claude/skills/skill-creator/scripts/quick_validate.js`                         |
| テストファイル               | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`          |
| テストフィクスチャ（追加分） | `.claude/skills/skill-creator/scripts/__tests__/fixtures/`（必要に応じて）       |
| ワークフロー仕様書           | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/` |

## 依存タスク

| 関係 | タスクID                                   | 内容                       |
| ---- | ------------------------------------------ | -------------------------- |
| 前提 | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 | quick_validate.js 初期実装 |
| 後続 | なし                                       | -                          |

## 参照資料

| 資料                                    | パス / URL                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| P42: .trim() バリデーション漏れ         | `.claude/rules/06-known-pitfalls.md#P42`                                                    |
| claude-code-skills-structure.md         | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md`         |
| claude-code-skills-process.md           | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`           |
| task-workflow.md                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        |
| task-workflow-rules.md                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  |
| quality-requirements.md                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |
| development-guidelines.md               | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               |
| architecture-implementation-patterns.md | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| error-handling.md                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| security-input-validation.md            | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            |
| phase-templates.md                      | `.claude/skills/task-specification-creator/references/phase-templates.md`                   |
| GitHub Issue                            | #913                                                                                        |

## aiworkflow-requirements 抽出仕様

| 仕様ソース                                | 本タスクへの反映内容                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `claude-code-skills-structure.md`         | `name` のハイフンケース/64文字制限、`description` の1024文字制限、必須フィールド検証     |
| `claude-code-skills-process.md`           | `quick_validate.js` を使った更新時の検証フロー、失敗時は Validation Error として扱う運用 |
| `task-workflow.md`                        | Phase 12 の未タスク3ステップ（指示書作成→残課題登録→関連仕様リンク）と成果物同期手順     |
| `task-workflow-rules.md`                  | Phaseゲートの判定基準、検証コマンドの実行順、PR前チェック条件                            |
| `quality-requirements.md`                 | テスト観点（正常/異常/回帰）と品質ゲート判定の閾値を Phase 7/10/11 に反映                |
| `development-guidelines.md`               | 入力検証・セキュリティ確認の必須チェック項目を Phase 2/10/12 に反映                      |
| `architecture-implementation-patterns.md` | P42準拠3段バリデーションを `typeof` → 空文字列 → `trim()` の順で適用                     |
| `error-handling.md`                       | ランタイム例外を Internal Error にせず Validation Error として返す方針                   |
| `security-input-validation.md`            | 型強制（`typeof`）→ 空文字判定 → `trim()` 判定の入力検証原則                             |

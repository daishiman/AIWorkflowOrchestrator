# UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001: skill-creator検証ゲート整合化

## メタ情報

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                    |
| タスク名     | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）  |
| 分類         | 改善                                                                          |
| 対象機能     | task-specification-creator / aiworkflow-requirements / skill-creator 連携運用 |
| 優先度       | 中                                                                            |
| 見積もり規模 | 中規模                                                                        |
| ステータス   | 仕様書作成済み                                                                |
| 発見元       | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 Phase 12 再監査                     |
| 発見日       | 2026-02-25                                                                    |
| 作成日       | 2026-02-26                                                                    |
| GitHub Issue | #910                                                                          |

## 目的

`quick_validate` 実行経路と判定基準を統一し、Phase 12 で「同じ入力なら同じ判定」が出る運用を確立する。

## 背景

Phase 12 再監査で `skill-creator` の検証コマンドを実行したところ、同じ「スキル検証」でも `quick_validate.py`（.codex配下）と `quick_validate.js`（repo配下）で実行経路・判定粒度が異なり、手順の判断コストが高かった。加えて `aiworkflow-requirements` は `quick_validate.js` で大量の参照リンク警告が継続発生し、実際の異常（Error）と運用ノイズ（Warning）が混在して読みづらい状態になっている。

## スコープ

### 含むもの

- 検証実行経路の統一ルール策定（`.js` / `.py` の優先順位・使い分け）
- warning運用ルールの整備（Error優先、warning分類、対応閾値）
- Phase 12 ガイドと spec-update-workflow への反映
- 必要に応じた `quick_validate.js` 仕様改善案の定義（大規模 reference スキル向け）

### 含まないもの

- 全 warning の即時ゼロ化（大量の既存資産を含むため段階対応）
- `aiworkflow-requirements/references/*.md` の全面再編
- 無関係なスキルの構造変更

## Phase構成

| Phase | 名称               | 仕様書                         | 概要                                       |
| ----- | ------------------ | ------------------------------ | ------------------------------------------ |
| 1     | 要件定義           | `phase-1-requirements.md`      | 要件抽出・受入基準定義                     |
| 2     | 設計               | `phase-2-design.md`            | 統一方針設計・アーキテクチャ設計           |
| 3     | 設計レビューゲート | `phase-3-design-review.md`     | 要件・設計の妥当性検証                     |
| 4     | テスト作成         | `phase-4-test-creation.md`     | 検証スクリプトのテストケース設計           |
| 5     | 実装               | `phase-5-implementation.md`    | 検証経路統一・warning運用ルール実装        |
| 6     | テスト拡充         | `phase-6-test-expansion.md`    | カバレッジ不足箇所のテスト追加             |
| 7     | カバレッジ確認     | `phase-7-coverage-check.md`    | カバレッジ基準の充足確認                   |
| 8     | リファクタリング   | `phase-8-refactoring.md`       | 仕様書・スクリプト品質改善                 |
| 9     | 品質保証           | `phase-9-quality-assurance.md` | Lint・型チェック・全テスト実行             |
| 10    | 最終レビューゲート | `phase-10-final-review.md`     | 多角的品質・整合性検証                     |
| 11    | 手動テスト検証     | `phase-11-manual-test.md`      | 検証コマンド手動実行・結果確認             |
| 12    | ドキュメント更新   | `phase-12-documentation.md`    | 実装ガイド・システム仕様更新・未タスク検出 |
| 13    | PR作成             | `phase-13-pr-creation.md`      | 成果物最終確認・PR準備                     |

## 依存関係マップ

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                                                                  ↓
Phase 13 ← Phase 12 ← Phase 11 ← Phase 10 ← Phase 9 ← Phase 8 ←┘
```

## 依存タスク

| タスクID                                  | 状態 | 依存種別                   |
| ----------------------------------------- | ---- | -------------------------- |
| UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 | 完了 | 親タスク（苦戦箇所の源泉） |

## 参照資料

| ドキュメント                                                                         | 用途                           |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク指示書フォーマット基準 |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Phase 12 検証コマンド運用      |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Step 1-G / 1-G-4 連携          |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 残課題台帳の登録先             |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 親タスクの苦戦箇所参照         |
| `.claude/skills/skill-creator/scripts/quick_validate.js`                             | 検証コマンド正本               |
| `docs/30-workflows/completed-tasks/task-imp-skill-validation-gate-alignment-001.md`  | 元の未タスク指示書             |

## aiworkflow-requirements 抽出結果

`indexes/resource-map.md` の「Claude Code スキル作成」「テスト実装」「ガイドライン」カテゴリから、今回タスクに必要な仕様を抽出する。

| 仕様書                                               | 抽出理由                                     | 主な利用Phase      |
| ---------------------------------------------------- | -------------------------------------------- | ------------------ |
| `references/claude-code-skills-overview.md`          | スキル作成の前提原則と責務境界の確認         | Phase 1-3          |
| `references/claude-code-skills-structure.md`         | SKILL構造制約（frontmatter/構成要素）の確認  | Phase 1-5          |
| `references/claude-code-skills-process.md`           | `quick_validate.js` を含む正規運用手順       | Phase 2, 9, 12, 13 |
| `references/quality-requirements.md`                 | テスト・品質ゲート基準                       | Phase 4, 7-10      |
| `references/task-workflow.md`                        | 未タスク台帳、完了反映、Phase 12同期先の確認 | Phase 1, 3, 12, 13 |
| `references/task-workflow-phases.md`                 | フェーズ進行条件・成果物単位の整合確認       | Phase 1-13         |
| `references/task-workflow-rules.md`                  | タスク分解規則、ゲート条件、禁止事項の確認   | Phase 1-3, 10, 13  |
| `references/architecture-implementation-patterns.md` | Phase 12 準拠確認チェーンと再発防止パターン  | Phase 2, 8, 10, 12 |
| `references/lessons-learned.md`                      | 既知の苦戦箇所と再発防止手順の再利用         | 全Phase横断        |
| `references/patterns.md`                             | 成功/失敗パターンの再利用と逸脱検知          | Phase 3, 10, 12    |

## 抽出完全性チェック（漏れ防止）

| 観点         | 必要情報                                | 抽出元                                                                         |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------ |
| スキル構造   | SKILL構成・命名・frontmatter制約        | `claude-code-skills-overview.md`, `claude-code-skills-structure.md`            |
| 運用手順     | 検証コマンド優先順位、index再生成運用   | `claude-code-skills-process.md`                                                |
| 品質ゲート   | テスト/品質閾値、レビューゲートの判定軸 | `quality-requirements.md`, `task-workflow-rules.md`                            |
| フェーズ整合 | Phase 1-13 の入出力と遷移条件           | `task-workflow-phases.md`                                                      |
| 未タスク管理 | 残課題登録、完了同期、参照整合          | `task-workflow.md`                                                             |
| 再発防止     | 苦戦箇所、対策パターン、失敗パターン    | `lessons-learned.md`, `architecture-implementation-patterns.md`, `patterns.md` |

上記6観点で必要情報がすべて抽出済みであることを確認し、欠落はなしと判定する。

## 仕様書別SubAgent分担

関心ごとの分離を維持するため、仕様書単位で担当を分離して並列監査する。

| SubAgent | 担当仕様書                    | 主責務                                      |
| -------- | ----------------------------- | ------------------------------------------- |
| A        | `phase-1`〜`phase-3`          | 要件/設計整合、タスク形式、トレーサビリティ |
| B        | `phase-4`〜`phase-7`          | テスト計画、拡充、カバレッジ依存整合        |
| C        | `phase-8`〜`phase-10`         | 品質基準、曖昧表現排除、レビューゲート判定  |
| D        | `phase-11`〜`phase-13`        | 手動検証、Phase 12 更新手順、PRガード       |
| E        | `index.md` + `artifacts.json` | 依存関係・ファイル命名・全体整合の最終監査  |

## 成果物一覧

| 成果物           | パス                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| インデックス     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/index.md`                 |
| 成果物レジストリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/artifacts.json`           |
| 準拠監査レポート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/spec-compliance-audit.md` |
| Phase 1-13仕様書 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-{N}-*.md`           |
| Phase別成果物    | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-{N}/*.md`   |

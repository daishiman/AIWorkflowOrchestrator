# Phase 12: ドキュメント更新 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 12                             |
| Phase名    | ドキュメント更新               |
| 前提Phase  | Phase 11                       |
| 後続Phase  | Phase 13                       |
| ステータス | completed（2026-03-04 再監査） |
| 作成日     | 2026-03-04                     |
| 機能名     | task-ui-00-molecules           |

## 目的

実装結果を再利用可能なドキュメントへ同期し、仕様正本と履歴を一貫状態へ更新する。

## 背景

Phase 12 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 12-1: 実装ガイドを作成する（Part 1 / Part 2）
- Task 12-2: システム仕様更新タスクを実施する
- Task 12-3: documentation-changelog を生成する
- Task 12-4: unassigned-task-detection を作成する
- Task 12-5: skill-feedback-report を作成する

### Task 12-1: 実装ガイド

| パート | 対象読者 | 要件                           |
| ------ | -------- | ------------------------------ |
| Part 1 | 初学者   | 日常例で概念説明               |
| Part 2 | 開発者   | props型、API、エッジケース説明 |

### Task 12-2: システム仕様更新

| Step     | 内容                                       |
| -------- | ------------------------------------------ |
| Step 1-A | 完了記録、変更履歴、LOGS更新               |
| Step 1-B | 実装状況テーブル更新                       |
| Step 1-C | 関連タスクテーブル更新                     |
| Step 2   | 新規インターフェース変更時のみ仕様正本更新 |

## 実行手順

1. 前提Phaseの成果物を確認する。
2. 本Phaseの実行タスクを上から順に実施する。
3. 成果物を指定パスへ配置し、完了条件をチェックする。

## システム仕様（aiworkflow-requirements）

| 参照仕様             | パス                                                                                        | 確認観点                                  |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| UI責務               | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Molecules責務とAtomic Design境界          |
| UI原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA / キーボード操作  |
| UIデザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | テーマ変数・トークン・4テーマ運用         |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | role/aria、構造分離、Atomic層連携         |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | P31対策（Props駆動、Store直接参照禁止）   |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | props最小化・happy-dom/fireEvent運用      |
| Atoms→Molecules連携  | `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`                 | Props駆動継承、Molecules再利用指針        |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | happy-dom前提の単体/統合テスト手法        |
| テストfixture        | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                     | Builder/fixture再利用、テストデータ標準化 |
| a11yテスト           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | WCAG 2.1 AA、フォーカストラップ・ARIA検証 |
| 品質                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジと品質ゲート                    |

## 参照資料

| 参照資料                 | パス                                                                           | 内容           |
| ------------------------ | ------------------------------------------------------------------------------ | -------------- |
| Phase 1                  | `phase-1-requirements.md`                                                      | 要件           |
| Phase 2                  | `phase-2-design.md`                                                            | 設計           |
| Phase 5                  | `phase-5-implementation.md`                                                    | 実装           |
| Phase 6                  | `phase-6-test-expansion.md`                                                    | テスト拡張     |
| Phase 7                  | `phase-7-coverage-check.md`                                                    | カバレッジ     |
| Phase 8                  | `phase-8-refactoring.md`                                                       | リファクタ記録 |
| Phase 9                  | `phase-9-quality-assurance.md`                                                 | 品質結果       |
| Phase 10                 | `phase-10-final-review.md`                                                     | 最終判定       |
| Phase 11                 | `phase-11-manual-test.md`                                                      | 手動証跡       |
| spec-update-workflow     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順       |
| aiworkflow task-workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 台帳同期       |

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物                             | パス                                                     | 内容                      |
| ---------------------------------- | -------------------------------------------------------- | ------------------------- |
| implementation-guide               | `outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2           |
| spec-update-summary                | `outputs/phase-12/spec-update-summary.md`                | 仕様更新要約              |
| documentation-changelog            | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                  |
| unassigned-task-detection          | `outputs/phase-12/unassigned-task-detection.md`          | 残課題検出                |
| skill-feedback-report              | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案            |
| phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 仕様準拠チェック |

## 完了条件

- [x] 実装ガイド Part 1 / Part 2 を作成した
- [x] 仕様更新 Step 1-A / 1-B / 1-C を実施した
- [x] documentation-changelog を作成した
- [x] unassigned-task-detection を作成した
- [x] skill-feedback-report を作成した
- [x] 本Phase内の全タスクを100%実行完了した

## サブタスク管理

Phase開始時に以下サブタスクを定義し、完了ごとに即時 `completed` 化する。

1. 参照資料確認（task-053 / aiworkflow 11仕様）
2. 実行タスク実施（Task N-\* を個別トラック）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物生成・配置（`outputs/phase-N` または実装パス）
5. 完了条件と依存引き渡しの検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認する。

- [x] 本Phase内の全タスクを100%実行完了した
- [x] 各タスクの成果物が生成されている
- [x] `artifacts.json` / `outputs/artifacts.json` の整合要件を確認した
- [x] Phase末尾で完了記録と次Phaseへの依存引き渡しを明記した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-00-molecules --phase <N>
```

## 次のPhase

Phase 13 へ進む。

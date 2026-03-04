# Phase 13: PR作成 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 13                   |
| Phase名    | PR作成               |
| 前提Phase  | Phase 12             |
| 後続Phase  | なし                 |
| ステータス | pending              |
| 作成日     | 2026-03-04           |
| 機能名     | task-ui-00-molecules |

## 目的

変更内容をレビュー可能な単位でまとめ、PR本文に検証証跡を添付できる状態へ整える。

## 背景

Phase 13 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 13-1: 変更サマリーを作成する
- Task 13-2: テスト結果を整理する
- Task 13-3: ドキュメント更新結果を整理する
- Task 13-4: PR本文テンプレートを作成する

### PR本文必須項目

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| 目的     | Molecules 5コンポーネント整備の背景                                 |
| 変更点   | SearchBar / CodeViewer / TabSwitcher / SlideInPanel / ConfirmDialog |
| テスト   | 自動テストと手動テストの結果                                        |
| 証跡     | `outputs/phase-11/screenshots/` と `outputs/phase-12/*`             |
| 影響範囲 | TASK-UI-00-ORGANISMS と後続画面                                     |

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

| 参照資料    | パス                               | 内容         |
| ----------- | ---------------------------------- | ------------ |
| Phase 1     | `phase-1-requirements.md`          | 要件         |
| Phase 2     | `phase-2-design.md`                | 設計         |
| Phase 5     | `phase-5-implementation.md`        | 実装         |
| Phase 6     | `phase-6-test-expansion.md`        | 拡張テスト   |
| Phase 7     | `phase-7-coverage-check.md`        | カバレッジ   |
| Phase 8     | `phase-8-refactoring.md`           | リファクタ   |
| Phase 9     | `phase-9-quality-assurance.md`     | 品質保証     |
| Phase 10    | `phase-10-final-review.md`         | 最終レビュー |
| Phase 11    | `phase-11-manual-test.md`          | 手動証跡     |
| Phase 12    | `phase-12-documentation.md`        | 文書更新     |
| PR template | `.github/pull_request_template.md` | PR本文構造   |

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物   | パス                                       | 内容               |
| -------- | ------------------------------------------ | ------------------ |
| PR草案   | `outputs/phase-13/pr-draft.md`             | PR本文草案         |
| 変更一覧 | `outputs/phase-13/change-summary.md`       | 変更ファイルと要点 |
| 検証一覧 | `outputs/phase-13/verification-summary.md` | テスト・証跡要約   |

## 完了条件

- [ ] PR本文草案を作成した
- [ ] 変更点と検証結果を整理した
- [ ] スクリーンショットとドキュメント証跡の参照を整理した
- [ ] レビュー観点（a11y、P31、品質基準）を本文に記載した
- [ ] 本Phase内の全タスクを100%実行完了した

## サブタスク管理

Phase開始時に以下サブタスクを定義し、完了ごとに即時 `completed` 化する。

1. 参照資料確認（task-053 / aiworkflow 11仕様）
2. 実行タスク実施（Task N-\* を個別トラック）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物生成・配置（`outputs/phase-N` または実装パス）
5. 完了条件と依存引き渡しの検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認する。

- [ ] 本Phase内の全タスクを100%実行完了した
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` / `outputs/artifacts.json` の整合要件を確認した
- [ ] Phase末尾で完了記録と次Phaseへの依存引き渡しを明記した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-00-molecules --phase <N>
```

## 次のPhase

完了（Phase 13 終了） へ進む。

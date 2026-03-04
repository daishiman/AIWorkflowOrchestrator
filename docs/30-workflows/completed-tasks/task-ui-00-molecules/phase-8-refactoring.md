# Phase 8: リファクタリング - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| Phase名    | リファクタリング        |
| 前提Phase  | Phase 7                 |
| 後続Phase  | Phase 9                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

外部仕様を維持したまま実装重複を削減し、可読性と保守性を上げる。

## 背景

Phase 8 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 8-1: 重複ロジックを抽出する
- Task 8-2: フォーカス制御処理を共通化する
- Task 8-3: 型定義と命名を整理する
- Task 8-4: リファクタ後の回帰テストを実行する

### リファクタ候補

| 領域                       | 候補                              |
| -------------------------- | --------------------------------- |
| SearchBar                  | debounce制御の共通化              |
| SlideInPanel/ConfirmDialog | focus trap / restore 処理の共通化 |
| TabSwitcher                | key handling ロジックの整理       |
| CodeViewer                 | copy feedback 状態遷移の整理      |

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

| 参照資料              | パス                                                                         | 内容               |
| --------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 1               | `phase-1-requirements.md`                                                    | 仕様固定           |
| Phase 2               | `phase-2-design.md`                                                          | 設計基準           |
| Phase 5               | `phase-5-implementation.md`                                                  | 実装実体           |
| Phase 6               | `phase-6-test-expansion.md`                                                  | テスト網羅         |
| Phase 7               | `phase-7-coverage-check.md`                                                  | カバレッジ不足箇所 |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31再確認          |

## 統合テスト連携

- リファクタ後に統合前提契約が不変であることを確認する
- Props名やイベント名の変更を禁止する
- Phase 9 へ回帰結果を渡す

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物         | パス                                        | 内容       |
| -------------- | ------------------------------------------- | ---------- |
| リファクタ計画 | `outputs/phase-8/refactor-plan.md`          | 対象一覧   |
| 変更記録       | `outputs/phase-8/refactor-log.md`           | 実施内容   |
| 回帰結果       | `outputs/phase-8/regression-test-result.md` | テスト結果 |

## 完了条件

- [x] 重複ロジックの削減を実施した
- [x] 外部インターフェース不変を確認した
- [x] 回帰テストで動作維持を確認した
- [x] Phase 9 へ品質確認資料を引き渡した
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

Phase 9 へ進む。

# Phase 3: 設計レビューゲート - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 3                       |
| Phase名    | 設計レビューゲート      |
| 前提Phase  | Phase 2                 |
| 後続Phase  | Phase 4                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

要件と設計の整合、a11y設計、テスト戦略、並列実装境界を審査し、実装着手可否を判定する。

## 背景

Phase 3 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 3-1: 要件トレーサビリティをレビューする
- Task 3-2: UI設計とa11y設計をレビューする
- Task 3-3: テスト戦略をレビューする
- Task 3-4: SubAgent境界と依存関係をレビューする
- Task 3-5: ゲート判定を記録する

### Task 3-1: トレーサビリティレビュー

| 観点     | 確認項目                                           |
| -------- | -------------------------------------------------- |
| REQ対応  | Phase 1 REQ-ID が Phase 2 設計へ対応付けされている |
| 依存整合 | TOKENS/ATOMS 依存が明記されている                  |
| 後続整合 | ORGANISMS 連携点が明記されている                   |

### Task 3-2: UI/a11yレビュー

| 観点       | 判定基準                                  |
| ---------- | ----------------------------------------- |
| ARIA属性   | role/aria属性がコンポーネント別に定義済み |
| キーボード | 主要操作キーが仕様化されている            |
| フォーカス | trap / restore / initial focus が定義済み |
| WCAG       | コントラストと操作可能性の確認観点がある  |

### Task 3-3: テスト戦略レビュー

| 観点                | 判定基準                                  |
| ------------------- | ----------------------------------------- |
| 単体テスト          | props・イベント・状態遷移を網羅           |
| a11yテスト          | ARIA・フォーカス挙動を網羅                |
| テーマ/レスポンシブ | 3テーマ + breakpoint検証を定義            |
| 実行環境            | happy-dom 前提と fireEvent 利用が定義済み |

### Task 3-4: 並列境界レビュー

| 観点         | 判定基準                             |
| ------------ | ------------------------------------ |
| レーン独立性 | Lane-A〜D が独立実装可能             |
| 結合点管理   | Lane-E が横断検証を担当              |
| 競合防止     | 同一ファイル同時編集が発生しない設計 |

### Task 3-5: ゲート判定

| 判定     | 条件                 | アクション           |
| -------- | -------------------- | -------------------- |
| PASS     | 指摘なし             | Phase 4 へ進行       |
| MINOR    | 軽微な修正で解消可能 | 修正反映後に Phase 4 |
| MAJOR    | 再設計が必要         | Phase 2 へ戻る       |
| CRITICAL | 要件再定義が必要     | Phase 1 へ戻る       |

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

| 参照資料                   | パス                                                                                         | 内容         |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| Phase 1                    | `phase-1-requirements.md`                                                                    | 要件         |
| Phase 2                    | `phase-2-design.md`                                                                          | 設計         |
| task-053正本               | `../skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md` | 仕様原典     |
| ui-ux-design-principles    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`               | レビュー基準 |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`            | テスト妥当性 |

## 統合テスト連携

- 画面統合シナリオで利用する Molecules をレビュー時点で確定する
- 統合テスト用データ条件を Phase 4 に引き渡す
- 失敗時の戻り先を Phase 4 設計に反映する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物       | パス                                      | 内容                           |
| ------------ | ----------------------------------------- | ------------------------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR/CRITICAL 判定 |
| 指摘管理表   | `outputs/phase-3/review-findings.md`      | 指摘と是正策                   |
| 判定記録     | `outputs/phase-3/gate-decision.md`        | 次Phase進行可否                |

## 完了条件

- [x] 要件と設計の対応表をレビューした
- [x] a11y観点レビューを完了した
- [x] テスト戦略レビューを完了した
- [x] SubAgent境界レビューを完了した
- [x] ゲート判定を文書化した
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

Phase 4 へ進む。

# Phase 10: 最終レビューゲート - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 10                      |
| Phase名    | 最終レビューゲート      |
| 前提Phase  | Phase 9                 |
| 後続Phase  | Phase 11                |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

要件、設計、実装、品質結果を横断レビューし、リリース候補品質であるかを最終判定する。

## 背景

Phase 10 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 10-1: 要件実装トレースを確認する
- Task 10-2: 品質証跡を確認する
- Task 10-3: a11y証跡を確認する
- Task 10-4: ゲート判定を記録する

### 判定基準

| 判定     | 条件                     | 戻り先            |
| -------- | ------------------------ | ----------------- |
| PASS     | 重大課題なし             | Phase 11          |
| MINOR    | 軽微課題のみ             | 是正後に Phase 11 |
| MAJOR    | 実装・設計の見直しが必要 | Phase 8           |
| CRITICAL | 要件見直しが必要         | Phase 1           |

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

| 参照資料     | パス                                                                                         | 内容     |
| ------------ | -------------------------------------------------------------------------------------------- | -------- |
| Phase 1      | `phase-1-requirements.md`                                                                    | 要件     |
| Phase 2      | `phase-2-design.md`                                                                          | 設計     |
| Phase 5      | `phase-5-implementation.md`                                                                  | 実装     |
| Phase 9      | `phase-9-quality-assurance.md`                                                               | 品質結果 |
| task-053正本 | `../skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md` | 仕様原典 |

## 統合テスト連携

- 手動テストで確認する画面シナリオを固定する
- 判定結果を Phase 11 テストケースへ反映する
- MAJOR/CRITICAL 時の戻り先を明記する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物           | パス                                        | 内容     |
| ---------------- | ------------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | 判定結果 |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md` | 課題一覧 |
| Go/No-Go判定     | `outputs/phase-10/go-no-go.md`              | 進行可否 |

## 完了条件

- [x] 要件-実装-品質の対応を確認した
- [x] ゲート判定を PASS/MINOR/MAJOR/CRITICAL で確定した
- [x] 次Phaseへの条件を文書化した
- [x] 戻り先条件を文書化した
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

Phase 11 へ進む。

# Phase 5: 実装 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| 前提Phase  | Phase 4                 |
| 後続Phase  | Phase 6                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

Phase 4 テストを満たす Molecules 実装を行い、5コンポーネントを再利用可能な品質で提供する。

## 背景

Phase 5 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 5-1: SearchBarを実装する
- Task 5-2: CodeViewerを実装する
- Task 5-3: TabSwitcherを実装する
- Task 5-4: SlideInPanelを実装する
- Task 5-5: ConfirmDialogを実装する
- Task 5-6: molecules/index.ts を更新する
- Task 5-7: 並列レーン実装結果を統合する

### 並列実装レーン

| レーン | 担当                         | 出力                                                                    |
| ------ | ---------------------------- | ----------------------------------------------------------------------- |
| Lane-A | SearchBar                    | `molecules/SearchBar/index.tsx`                                         |
| Lane-B | CodeViewer                   | `molecules/CodeViewer/index.tsx`                                        |
| Lane-C | TabSwitcher                  | `molecules/TabSwitcher/index.tsx`                                       |
| Lane-D | SlideInPanel + ConfirmDialog | `molecules/SlideInPanel/index.tsx`, `molecules/ConfirmDialog/index.tsx` |
| Lane-E | 統合管理                     | `molecules/index.ts` と競合解消                                         |

### 実装規約

- Props駆動を厳守し、Molecules 内で Zustand Store を参照しない
- フォーカス制御は共通ユーティリティ化を優先する
- aria属性は Phase 2 定義から逸脱しない
- style は tokens.css の変数を使用する

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

| 参照資料              | パス                                                                         | 内容          |
| --------------------- | ---------------------------------------------------------------------------- | ------------- |
| Phase 4               | `phase-4-test-creation.md`                                                   | テスト仕様    |
| Phase 1               | `phase-1-requirements.md`                                                    | 受入基準      |
| ui-ux-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Molecules責務 |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31対策       |
| arch-ui-components    | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | UI構造指針    |

## 統合テスト連携

- 実装ごとに対応テストを即時実行して回帰を確認する
- Lane統合時に全コンポーネントの import/export を検証する
- 画面統合前提の props contract を確認する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物        | パス                                                                     | 内容                 |
| ------------- | ------------------------------------------------------------------------ | -------------------- |
| SearchBar     | `apps/desktop/src/renderer/components/molecules/SearchBar/index.tsx`     | 入力・デバウンス機能 |
| CodeViewer    | `apps/desktop/src/renderer/components/molecules/CodeViewer/index.tsx`    | 表示・コピー機能     |
| TabSwitcher   | `apps/desktop/src/renderer/components/molecules/TabSwitcher/index.tsx`   | タブ制御機能         |
| SlideInPanel  | `apps/desktop/src/renderer/components/molecules/SlideInPanel/index.tsx`  | サイドパネル機能     |
| ConfirmDialog | `apps/desktop/src/renderer/components/molecules/ConfirmDialog/index.tsx` | 確認ダイアログ機能   |
| Barrel export | `apps/desktop/src/renderer/components/molecules/index.ts`                | 一括公開             |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md`                              | 変更概要             |

## 完了条件

- [x] 5コンポーネントを実装した
- [x] すべての実装が Props駆動を満たした
- [x] aria属性とキーボード仕様を実装へ反映した
- [x] Lane統合後に import/export を確認した
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

Phase 6 へ進む。

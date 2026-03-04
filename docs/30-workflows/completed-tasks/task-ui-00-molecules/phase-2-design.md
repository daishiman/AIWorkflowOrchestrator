# Phase 2: 設計 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1                 |
| 後続Phase  | Phase 3                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

Phase 1 要件を実装可能なUI設計、テスト設計、責務分離設計へ落とし込み、Phase 3 レビュー入力を確定する。

## 背景

Phase 2 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 2-1: ディレクトリ設計を確定する
- Task 2-2: コンポーネント別インターフェース設計を確定する
- Task 2-3: a11y とキーボード設計を確定する
- Task 2-4: SubAgent分割と並列実装境界を確定する
- Task 2-5: テスト設計を確定する

### Task 2-1: ディレクトリ設計

| 対象          | パス                                                            | 設計方針                                     |
| ------------- | --------------------------------------------------------------- | -------------------------------------------- |
| SearchBar     | `apps/desktop/src/renderer/components/molecules/SearchBar/`     | `index.tsx` + `__tests__/SearchBar.test.tsx` |
| CodeViewer    | `apps/desktop/src/renderer/components/molecules/CodeViewer/`    | 同上                                         |
| TabSwitcher   | `apps/desktop/src/renderer/components/molecules/TabSwitcher/`   | 同上                                         |
| SlideInPanel  | `apps/desktop/src/renderer/components/molecules/SlideInPanel/`  | 同上                                         |
| ConfirmDialog | `apps/desktop/src/renderer/components/molecules/ConfirmDialog/` | 同上                                         |
| Barrel export | `apps/desktop/src/renderer/components/molecules/index.ts`       | 5件を一括エクスポート                        |

### Task 2-2: インターフェース設計

- SearchBar: `value`, `onChange`, `onDebouncedChange`, `debounceMs`, `shortcutHint`, `autoFocus`
- CodeViewer: `code`, `language`, `showLineNumbers`, `maxHeight`, `filePath`, `showCopyButton`
- TabSwitcher: `tabs`, `activeTab`, `onTabChange`, `variant`
- SlideInPanel: `isOpen`, `onClose`, `side`, `width`, `title`, `showOverlay`
- ConfirmDialog: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `isDestructive`, `isLoading`

### Task 2-3: a11y / キーボード設計

| コンポーネント | ARIA設計                                                    | キーボード設計         |
| -------------- | ----------------------------------------------------------- | ---------------------- |
| SearchBar      | `role="searchbox"`                                          | Escapeでクリア         |
| CodeViewer     | コピー操作に `aria-label`                                   | Enter/Spaceでコピー    |
| TabSwitcher    | `role="tablist"`, `role="tab"`, `aria-selected`             | Arrow/Home/End/Enter   |
| SlideInPanel   | `role="dialog"`, `aria-modal="true"`                        | Escape, Tab循環        |
| ConfirmDialog  | `role="alertdialog"`, `aria-labelledby`, `aria-describedby` | Escape, Enter, Tab循環 |

### Task 2-4: SubAgent分割設計

| レーン | 担当                         | 依存                 |
| ------ | ---------------------------- | -------------------- |
| Lane-A | SearchBar                    | Atoms / tokens       |
| Lane-B | CodeViewer                   | tokens               |
| Lane-C | TabSwitcher                  | tokens               |
| Lane-D | SlideInPanel + ConfirmDialog | a11y基盤設計         |
| Lane-E | テスト基盤 + QA              | Lane-A〜D の実装結果 |

### Task 2-5: テスト設計

| 種別         | 設計内容                                        |
| ------------ | ----------------------------------------------- |
| 単体テスト   | props入力、イベント、ARIA属性                   |
| a11yテスト   | role、aria、フォーカストラップ                  |
| テーマテスト | 3テーマ描画確認                                 |
| レスポンシブ | breakpoint別DOM検証                             |
| 統合テスト   | SkillCenter / Workspace / Settings への適用検証 |

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

| 参照資料              | パス                                                                         | 内容              |
| --------------------- | ---------------------------------------------------------------------------- | ----------------- |
| Phase 1要件           | `phase-1-requirements.md`                                                    | 要件定義          |
| ui-ux-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design責務 |
| arch-ui-components    | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | role/ariaパターン |
| testing-accessibility | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | フォーカス検証    |
| quality-requirements  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | カバレッジ基準    |

## 統合テスト連携

- Phase 4 で作成する統合シナリオの前提データ構造を固定する
- 画面側の受け渡し型（tab id, dialog state, panel state）を設計書に明記する
- MoleculesとOrganismsの結合点を `props contract` として定義する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物               | パス                                     | 内容                |
| -------------------- | ---------------------------------------- | ------------------- |
| 設計書               | `outputs/phase-2/component-design.md`    | 5コンポーネント設計 |
| インターフェース仕様 | `outputs/phase-2/interface-contracts.md` | props契約           |
| テスト設計書         | `outputs/phase-2/test-design.md`         | 単体/統合/a11y設計  |

## 完了条件

- [x] 5コンポーネント全件の構造設計を確定した
- [x] a11y とキーボード仕様を明文化した
- [x] SubAgent並列レーンの責務分離を確定した
- [x] Phase 3 レビュー用の判定項目を準備した
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

Phase 3 へ進む。

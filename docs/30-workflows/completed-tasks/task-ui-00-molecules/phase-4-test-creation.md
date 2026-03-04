# Phase 4: テスト作成 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成              |
| 前提Phase  | Phase 3                 |
| 後続Phase  | Phase 5                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

TDD Red の入力として、Molecules 5コンポーネントの失敗テスト仕様を先に定義し、実装判定軸を固定する。

## 背景

Phase 4 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 4-1: SearchBarテストケースを作成する
- Task 4-2: CodeViewerテストケースを作成する
- Task 4-3: TabSwitcherテストケースを作成する
- Task 4-4: SlideInPanelテストケースを作成する
- Task 4-5: ConfirmDialogテストケースを作成する
- Task 4-6: 横断テスト（a11y/テーマ/レスポンシブ）を作成する

### テストケース基準

| コンポーネント | 最低ケース数 | 主な観点                                       |
| -------------- | ------------ | ---------------------------------------------- |
| SearchBar      | 12           | 入力、デバウンス、ショートカット、ARIA         |
| CodeViewer     | 10           | 行番号、コピー、ヘッダー、ARIA                 |
| TabSwitcher    | 11           | タブ切替、キーボード、disabled、variant        |
| SlideInPanel   | 12           | 開閉、方向、オーバーレイ、フォーカス制御       |
| ConfirmDialog  | 14           | destructive、loading、キー操作、フォーカス制御 |

### テストファイル配置

| ファイル               | パス                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| SearchBar.test.tsx     | `apps/desktop/src/renderer/components/molecules/SearchBar/__tests__/SearchBar.test.tsx`         |
| CodeViewer.test.tsx    | `apps/desktop/src/renderer/components/molecules/CodeViewer/__tests__/CodeViewer.test.tsx`       |
| TabSwitcher.test.tsx   | `apps/desktop/src/renderer/components/molecules/TabSwitcher/__tests__/TabSwitcher.test.tsx`     |
| SlideInPanel.test.tsx  | `apps/desktop/src/renderer/components/molecules/SlideInPanel/__tests__/SlideInPanel.test.tsx`   |
| ConfirmDialog.test.tsx | `apps/desktop/src/renderer/components/molecules/ConfirmDialog/__tests__/ConfirmDialog.test.tsx` |

### テスト運用ルール

- イベント発火は `fireEvent` を使う
- タイマー制御は `vi.useFakeTimers` + `vi.advanceTimersByTime` を使う
- `navigator.clipboard` はテストで明示モックする
- テーマ検証は `data-theme` の切替で確認する

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

| 参照資料                   | パス                                                                              | 内容           |
| -------------------------- | --------------------------------------------------------------------------------- | -------------- |
| Phase 1                    | `phase-1-requirements.md`                                                         | 要件           |
| Phase 2                    | `phase-2-design.md`                                                               | 設計           |
| Phase 3                    | `phase-3-design-review.md`                                                        | レビュー判定   |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 実装テスト手法 |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11yテスト観点 |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準       |

## 統合テスト連携

- Molecules を利用する統合対象画面を固定する
- SearchBar + TabSwitcher の複合操作シナリオを定義する
- SlideInPanel + ConfirmDialog のフォーカス連続遷移を定義する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物         | パス                                      | 内容               |
| -------------- | ----------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`   | ケース一覧         |
| テストケース表 | `outputs/phase-4/test-case-matrix.md`     | REQ-ID 対応        |
| 実行手順書     | `outputs/phase-4/test-execution-guide.md` | 実行コマンドと前提 |

## 完了条件

- [x] 5コンポーネントのテストケースを作成した
- [x] REQ-ID とテストケースの対応表を作成した
- [x] a11y/テーマ/レスポンシブの横断ケースを作成した
- [x] Red開始条件を満たす失敗テスト仕様を確定した
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

Phase 5 へ進む。

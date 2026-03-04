# Phase 11: 手動テスト検証 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト検証                 |
| 前提Phase  | Phase 10                       |
| 後続Phase  | Phase 12                       |
| ステータス | completed（2026-03-04 再監査） |
| 作成日     | 2026-03-04                     |
| 機能名     | task-ui-00-molecules           |

## 目的

実利用操作で Molecules の UX、a11y、レスポンシブ挙動を検証し、ドキュメント更新に必要な証跡を確定する。

## 背景

Phase 11 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 11-1: SearchBar手動シナリオを検証する
- Task 11-2: CodeViewer手動シナリオを検証する
- Task 11-3: TabSwitcher手動シナリオを検証する
- Task 11-4: SlideInPanel/ConfirmDialog手動シナリオを検証する
- Task 11-5: 3テーマ・3ブレークポイント検証を実施する
- Task 11-6: スクリーンショット証跡を取得する

### 手動テスト観点

| 観点         | 検証項目                             |
| ------------ | ------------------------------------ |
| 操作性       | クリック、キーボード、ショートカット |
| a11y         | ARIA、フォーカス移動、フォーカス復元 |
| 表示         | 3テーマで視認性を確認                |
| レスポンシブ | desktop/tablet/mobile を確認         |

## テストケース

| テストケース | 観点         | 内容                                              |
| ------------ | ------------ | ------------------------------------------------- |
| TC-01        | 初期表示     | darkテーマで SkillCenterView の初期表示を確認する |
| TC-02        | 検索         | 検索入力時に一覧が絞り込まれることを確認する      |
| TC-03        | テーマ       | lightテーマで配色崩れがないことを確認する         |
| TC-04        | レスポンシブ | mobile幅でレイアウト崩れがないことを確認する      |

## 画面カバレッジマトリクス

| テストケース | 画面状態                                | 証跡                                                     |
| ------------ | --------------------------------------- | -------------------------------------------------------- |
| TC-01        | SkillCenterView / dark / default        | `screenshots/TC-01-skill-center-default-dark.png`        |
| TC-02        | SkillCenterView / dark / search         | `screenshots/TC-02-skill-center-search-dark.png`         |
| TC-03        | SkillCenterView / light / default       | `screenshots/TC-03-skill-center-default-light.png`       |
| TC-04        | SkillCenterView / dark / mobile default | `screenshots/TC-04-skill-center-default-mobile-dark.png` |

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

| 参照資料                | パス                                                                                        | 内容           |
| ----------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1                 | `phase-1-requirements.md`                                                                   | 受入基準       |
| Phase 2                 | `phase-2-design.md`                                                                         | 設計           |
| Phase 5                 | `phase-5-implementation.md`                                                                 | 実装           |
| Phase 6                 | `phase-6-test-expansion.md`                                                                 | 拡張テスト     |
| Phase 7                 | `phase-7-coverage-check.md`                                                                 | カバレッジ状況 |
| Phase 8                 | `phase-8-refactoring.md`                                                                    | 変更点         |
| Phase 9                 | `phase-9-quality-assurance.md`                                                              | 品質結果       |
| Phase 10                | `phase-10-final-review.md`                                                                  | 判定条件       |
| screenshot-verification | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | 証跡取得手順   |

## 統合テスト連携

- 手動結果を統合シナリオの最終証跡として扱う
- 画面証跡とテストケースIDを対応付ける
- Phase 12 へ結果を渡す

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物         | パス                                     | 内容               |
| -------------- | ---------------------------------------- | ------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | ケース別結果       |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 課題一覧           |
| 画面証跡       | `outputs/phase-11/screenshots/`          | スクリーンショット |

## 完了条件

- [x] 5コンポーネントの手動シナリオを実施した
- [x] 3テーマ検証を実施した
- [x] 3ブレークポイント検証を実施した
- [x] 証跡を outputs/phase-11 に保存した
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

Phase 12 へ進む。

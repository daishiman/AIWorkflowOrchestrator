# Phase 6: テスト拡充 - TASK-UI-00-MOLECULES

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 前提Phase  | Phase 5                 |
| 後続Phase  | Phase 7                 |
| ステータス | completed（2026-03-04） |
| 作成日     | 2026-03-04              |
| 機能名     | task-ui-00-molecules    |

## 目的

Phase 5 実装に対して、境界値・異常系・アクセシビリティ観点を追加し、回帰耐性を上げる。

## 背景

Phase 6 は前段Phaseの成果物を引き継ぎ、TASK-UI-00-MOLECULES の要件・設計・品質基準を次段へ確実に接続するために実行する。

## 実行タスク

- Task 6-1: SearchBarの境界値テストを追加する
- Task 6-2: CodeViewerのクリップボード異常系テストを追加する
- Task 6-3: TabSwitcherのキーボード境界テストを追加する
- Task 6-4: SlideInPanel/ConfirmDialogのフォーカス制御テストを追加する
- Task 6-5: 3テーマとレスポンシブ横断テストを追加する

### 拡充対象

| 対象          | 追加観点                                   |
| ------------- | ------------------------------------------ |
| SearchBar     | 連続入力、debounceキャンセル、autoFocus    |
| CodeViewer    | コピー失敗時処理、行番号表示切替           |
| TabSwitcher   | disabledスキップ、Home/End遷移             |
| SlideInPanel  | Tab循環、復元フォーカス、overlay click     |
| ConfirmDialog | destructive + loading 同時状態、Escape抑止 |

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
| Phase 5                    | `phase-5-implementation.md`                                                       | 実装結果       |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 拡張テスト手法 |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11y観点       |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質要件       |

## 統合テスト連携

- Phase 7 で使うカバレッジ集計対象を固定する
- 画面統合時に起こるイベント連鎖を単体テストで再現する
- フォーカス制御の回帰を固定テストで監視する

## 多角的チェック観点

| 観点             | 確認内容                                |
| ---------------- | --------------------------------------- |
| UI/UX            | Apple HIG準拠、操作一貫性、視認性       |
| アクセシビリティ | WCAG 2.1 AA、キーボード完結、ARIA整合   |
| 状態管理         | P31回避、Props駆動、不要なStore依存排除 |
| テスト容易性     | 単体テスト可能な責務境界、モック容易性  |
| 保守性           | 命名一貫性、責務分離、再利用性          |

## 成果物

| 成果物         | パス                                       | 内容       |
| -------------- | ------------------------------------------ | ---------- |
| テスト拡張計画 | `outputs/phase-6/test-expansion-plan.md`   | 追加観点   |
| 拡張ケース一覧 | `outputs/phase-6/expanded-test-cases.md`   | ケース詳細 |
| 実行ログ       | `outputs/phase-6/test-expansion-result.md` | 追加結果   |

## 完了条件

- [x] 5コンポーネントの境界値・異常系テストを追加した
- [x] フォーカストラップとフォーカス復元の検証を追加した
- [x] テーマ横断テストを追加した
- [x] Phase 7 へ渡すテスト母集団を確定した
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

Phase 7 へ進む。

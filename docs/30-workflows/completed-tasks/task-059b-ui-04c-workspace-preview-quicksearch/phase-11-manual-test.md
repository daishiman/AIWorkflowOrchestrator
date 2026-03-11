# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 11                                             |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-A / SubAgent-C                        |

## 目的

実画面で PreviewPanel と QuickFileSearch を検証し、自動テストで拾いにくい表示品質、キーボード操作、レスポンシブ挙動を確認する。

## 実行タスク

- 手動テスト実施: テストケースに沿って操作確認を実施する
- スクリーンショット取得: 各ケースの証跡を保存する
- 既知課題記録: 再現条件と優先度を記録する
- current build 固定: screenshot は current workflow build を使って取得する

## 参照資料

| 参照資料       | パス                                                                                                      | 説明                       |
| -------------- | --------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 成果物 | `outputs/phase-2/component-design.md`                                                                     | 手動検証の表示期待値       |
| Phase 5 成果物 | `outputs/phase-5/implementation-summary.md`                                                               | 実装結果確認               |
| Phase 6 成果物 | `outputs/phase-6/regression-matrix.md`                                                                    | 回帰観点確認               |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                                                                      | ケース網羅度確認           |
| Phase 8 成果物 | `outputs/phase-8/refactoring-log.md`                                                                      | 境界整理後の確認           |
| Phase 9 成果物 | `outputs/phase-9/quality-report.md`                                                                       | 品質ゲート確認             |
| Phase 10 入力  | `outputs/phase-10/manual-test-input.md`                                                                   | 手動テスト対象             |
| 04A 手動テスト | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-11-manual-test.md` | 連携観点                   |
| 未タスクガード | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                      | current build pinning 規約 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 本Phaseで使う理由                  |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| UI機能仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Workspace 契約整合の確認           |
| UI語彙仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Task 5D 用語の目視確認             |
| UIデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | モーダルの幅/角丸/影の視覚基準確認 |
| ナビ仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | workspace mode / responsive 観点   |
| a11yガイド         | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | keyboard / focus 観点              |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P31/P39/P40 の回帰観点確認         |
| lessons            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | screenshot 運用の再発防止          |

## 実行手順

### ステップ1: 手動テストケース定義

| ケースID | 観点                 | 操作                         | 期待結果                       |
| -------- | -------------------- | ---------------------------- | ------------------------------ |
| TC-11-01 | Source/Preview       | `.md` を選択してモード切替   | Source と Preview が切り替わる |
| TC-11-02 | HTML preview         | `.html` を選択               | script が実行されない          |
| TC-11-03 | 非対応拡張子         | `.ts` で Preview タブ確認    | Preview タブが disabled        |
| TC-11-04 | QuickSearch open     | Cmd+P                        | モーダルが開く                 |
| TC-11-05 | QuickSearch keyboard | ArrowDown→Enter              | 該当ファイルが選択される       |
| TC-11-06 | QuickSearch close    | Escape                       | モーダルが閉じる               |
| TC-11-07 | read error           | 読込失敗を発生               | alert と再試行導線が表示される |
| TC-11-08 | responsive           | mobile/tablet/desktop で確認 | レイアウトが崩れない           |
| TC-11-09 | UX語彙               | toolbar/モーダル文言確認     | Task 5D 用語に一致する         |
| TC-11-10 | モーダル視覚仕様     | Cmd+P で開く                 | 幅/角丸/影の仕様を満たす       |
| TC-11-11 | カバレッジ整合       | テスト結果と画像を突合       | TC-ID と png が1対1で対応する  |

### ステップ2: 画面カバレッジマトリクス作成

- `outputs/phase-11/screenshot-plan.json` を作成し、TC-ID と撮影状態を紐付ける
- 該当しない状態は N/A 理由を明記する
- current workflow build source を基準に撮影対象を固定する

## 画面カバレッジマトリクス

| テストケース | 状態               | 証跡                                           | 備考                           |
| ------------ | ------------------ | ---------------------------------------------- | ------------------------------ |
| TC-11-01     | Source view        | `screenshots/TC-11-01-source-view.png`         | read-only source / line number |
| TC-11-02     | Markdown preview   | `screenshots/TC-11-02-markdown-preview.png`    | Preview tab                    |
| TC-11-03     | HTML preview       | `screenshots/TC-11-03-html-preview.png`        | sandbox + CSP                  |
| TC-11-04     | QuickSearch open   | `screenshots/TC-11-04-quick-search-dialog.png` | dialog visual                  |
| TC-11-05     | QuickSearch select | `screenshots/TC-11-05-quick-search-select.png` | keyboard select                |
| TC-11-06     | QuickSearch close  | `screenshots/TC-11-06-quick-search-close.png`  | Escape close                   |
| TC-11-07     | read error         | `screenshots/TC-11-07-read-error.png`          | retry surface                  |
| TC-11-08     | responsive mobile  | `screenshots/TC-11-08-mobile-overlay.png`      | overlay layout                 |
| TC-11-09     | UX terminology     | `screenshots/TC-11-09-ux-terminology.png`      | Task 5D vocabulary             |
| TC-11-10     | modal visual spec  | `screenshots/TC-11-10-modal-visual-spec.png`   | width / radius / shadow        |
| TC-11-11     | coverage alignment | `screenshots/TC-11-11-coverage-alignment.png`  | evidence board                 |

### ステップ3: screenshot 収集

- `outputs/phase-11/screenshots/` にケース単位で保存する
- ファイル名は `TC-11-XX-<short-name>.png` とする
- current build source を記録する

### ステップ4: screenshot カバレッジ検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch
```

- `outputs/phase-11/screenshot-coverage.md` に結果を記録する
- TC-ID と png の不足がある場合は撮影計画へ戻る

### ステップ5: issue 記録

- 発見した課題を `discovered-issues.md` に記録する
- 重大度と再現手順を併記する

## 統合テスト連携

| 観点         | Phase 12 へ引き継ぐ内容         |
| ------------ | ------------------------------- |
| 証跡         | screenshot 一覧                 |
| カバレッジ   | screenshot-plan / coverage 結果 |
| 課題         | discovered issues               |
| 未タスク候補 | unresolved items                |

## 成果物

| 成果物              | パス                                       | 説明             |
| ------------------- | ------------------------------------------ | ---------------- |
| 手動テスト結果      | `outputs/phase-11/manual-test-result.md`   | ケース結果       |
| 撮影計画            | `outputs/phase-11/screenshot-plan.json`    | TC-ID と撮影状態 |
| スクリーンショット  | `outputs/phase-11/screenshots/`            | 画面証跡         |
| カバレッジレポート  | `outputs/phase-11/screenshot-coverage.md`  | 証跡網羅率       |
| 発見課題            | `outputs/phase-11/discovered-issues.md`    | 課題一覧         |
| source pinning 記録 | `outputs/phase-11/current-build-source.md` | build 情報       |

## 完了条件

- [ ] TC-11-01 から TC-11-11 を実施する計画を定義している
- [ ] screenshot 命名規則を定義している
- [ ] screenshot-plan と coverage 検証手順を定義している
- [ ] current build source pinning を定義している
- [ ] 発見課題の記録形式を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 手動テストケース実施
2. screenshot 取得
3. discovered issues 記録
4. current build source 記録
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-11/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 12: ドキュメント更新](./phase-12-documentation.md)

# Phase 11: 手動テスト検証

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 11                                |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

画面導線と実運用シナリオを手動で確認し、Apple UI/UX観点で視覚品質を検証する。

## 実行タスク

- 手動テスト計画: 主要シナリオのテストケースを定義する。
- スクリーンショット取得: 変更画面と状態遷移を撮影する。
- 視覚レビュー: Apple HIG観点でレイアウト、可読性、操作導線を検証する。
- 発見事項整理: バグ、改善提案、未タスク候補を記録する。

## テストケース

| テストケース | シナリオ                                      | 期待結果                                       |
| ------------ | --------------------------------------------- | ---------------------------------------------- |
| TC-056-11-01 | Dashboard初期表示（Desktop）                  | レイアウト崩れなく表示される                   |
| TC-056-11-02 | AppDockから `workspace` へ遷移                | Workspace画面へ遷移し、見出しが表示される      |
| TC-056-11-03 | AppDockから `skillCenter` へ遷移              | SkillCenter画面へ遷移し、主要要素が表示される  |
| TC-056-11-04 | AppDockから `historySearch` へ遷移（Desktop） | History Search画面へ遷移し、見出しが表示される |
| TC-056-11-05 | `historySearch` のモバイル表示                | 390x844で主要要素が欠落せず表示される          |

## 画面カバレッジマトリクス

| テストケース | 対象画面/状態           | 証跡                                                  |
| ------------ | ----------------------- | ----------------------------------------------------- |
| TC-056-11-01 | Dashboard / Desktop     | `screenshots/TC-056-11-01-dashboard-desktop.png`      |
| TC-056-11-02 | Workspace / Desktop     | `screenshots/TC-056-11-02-workspace-desktop.png`      |
| TC-056-11-03 | SkillCenter / Desktop   | `screenshots/TC-056-11-03-skill-center-desktop.png`   |
| TC-056-11-04 | HistorySearch / Desktop | `screenshots/TC-056-11-04-history-search-desktop.png` |
| TC-056-11-05 | HistorySearch / Mobile  | `screenshots/TC-056-11-05-history-search-mobile.png`  |

## 参照資料

| 資料名               | パス                                                                                        | 説明                   |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1仕様          | `phase-1-requirements.md`                                                                   | 要件観点               |
| Phase 2仕様          | `phase-2-design.md`                                                                         | 設計観点               |
| Phase 5仕様          | `phase-5-implementation.md`                                                                 | 実装観点               |
| Phase 6仕様          | `phase-6-test-expansion.md`                                                                 | 異常系観点             |
| Phase 7仕様          | `phase-7-coverage-check.md`                                                                 | テスト網羅観点         |
| Phase 8仕様          | `phase-8-refactoring.md`                                                                    | 退行観点               |
| Phase 9仕様          | `phase-9-quality-assurance.md`                                                              | QA観点                 |
| Phase 10仕様         | `phase-10-final-review.md`                                                                  | 最終Gate観点           |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG/WCAG         |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI実装基準             |
| Phase 11手順         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 画面証跡手順           |
| 撮影手順             | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | スクリーンショット検証 |

## 統合テスト連携

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| テストケース | Notification履歴表示、既読更新、History検索、View遷移 |
| 画面証跡     | `outputs/phase-11/screenshots/`                       |
| 成功判定     | 手動テストケース全件PASS、主要画面の証跡を取得        |

## 成果物

| 成果物                       | パス                                      | 説明           |
| ---------------------------- | ----------------------------------------- | -------------- |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`  | テスト結果表   |
| 発見課題一覧                 | `outputs/phase-11/discovered-issues.md`   | 課題と対処方針 |
| スクリーンショットカバレッジ | `outputs/phase-11/screenshot-coverage.md` | 画面網羅記録   |
| スクリーンショット           | `outputs/phase-11/screenshots/`           | 画面証跡       |

## 完了条件

- [x] 手動テストケースを実行した
- [x] スクリーンショットを取得した
- [x] Apple HIG観点の視覚レビューを記録した
- [x] 発見課題を分類して記録した
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12: ドキュメント更新

## 実行手順

### ステップ1: 参照資料確認

本Phaseの参照資料を確認し、前提条件を固定する。

### ステップ2: 実行タスク実施

`実行タスク` に記載した項目を順番に実行し、結果を成果物に記録する。

### ステップ3: 成果物検証

成果物の配置と内容を確認し、完了条件をチェックする。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                                                   |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| セキュリティ       | IPC/入力検証を含むため適用                   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| UI/UX              | ViewType/AppDock/App遷移を含むため適用       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      |
| アーキテクチャ     | Store/IPC/Preload層変更を含むため適用        | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| API設計            | IPC契約変更を含むため適用                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| エラーハンドリング | Handlerエラー応答を含むため適用              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| テスト品質         | テスト追加/拡充/カバレッジ確認を含むため適用 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新（Phase 1〜11）
4. 成果物の出力
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

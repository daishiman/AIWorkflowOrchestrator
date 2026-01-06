# 検索・置換機能 UI実装 ワークフロー

## 概要

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| タスクID   | task-imp-search-ui-001                  |
| 機能名     | 検索・置換機能 UI実装                   |
| 作成日     | 2026-01-05                              |
| ステータス | in_progress                             |
| 優先度     | HIGH                                    |
| 関連タスク | TASK-SEARCH-REPLACE-001（バックエンド） |

## 進捗状況

| Phase         | 名称             | ステータス     | 完了日時          | 備考                            |
| ------------- | ---------------- | -------------- | ----------------- | ------------------------------- |
| 0             | 準備             | ✅ completed   | 2026-01-05T14:30Z |                                 |
| 2             | アーキテクチャ   | ✅ completed   | 2026-01-05T14:35Z |                                 |
| 3             | 詳細設計         | ✅ completed   | 2026-01-05T14:40Z |                                 |
| 4             | テスト作成       | ✅ completed   | 2026-01-05T14:45Z |                                 |
| 5             | 実装             | ✅ completed   | 2026-01-05T17:10Z |                                 |
| 5-integration | EditorView統合   | ✅ completed   | 2026-01-05T23:20Z |                                 |
| 6             | リファクタリング | ✅ completed   | 2026-01-05T17:25Z |                                 |
| 7             | 品質保証         | ✅ completed   | 2026-01-05T17:30Z |                                 |
| 8             | 最終レビュー     | ✅ completed   | 2026-01-05T17:40Z |                                 |
| 9             | 手動テスト       | 🔄 in_progress | -                 | バグ修正2件完了                 |
| 10            | ドキュメント     | ✅ completed   | 2026-01-05T18:50Z | 2026-01-06更新、3件未タスク検出 |
| 11            | PR作成           | ⏳ not_started | -                 |                                 |

## 背景

バックエンド実装（packages/shared）が完了しており、テストカバレッジ83.92%を達成している。
本タスクではフロントエンドUI（Electron/React）を実装し、検索・置換機能をユーザーが利用できるようにする。

## 目標

1. ファイル内検索パネル（SearchPanel）の実装
2. ワークスペース検索パネル（WorkspaceSearchPanel）の実装
3. Zustandによる状態管理（useSearchStore）
4. キーボードショートカット実装（Cmd+F, Cmd+Shift+F）
5. E2Eテストの追加

## Phase一覧

| Phase | 名称             | 説明                             | 使用スキル                                              |
| ----- | ---------------- | -------------------------------- | ------------------------------------------------------- |
| 0     | 準備             | テスト除外設定の削除（TDD準備）  | -                                                       |
| 2     | アーキテクチャ   | コンポーネント構成・データフロー | architectural-patterns, state-lifting                   |
| 3     | 詳細設計         | Props・振る舞い・A11y設計        | electron-ui-patterns, accessibility-wcag                |
| 4     | テスト作成       | TDD Red - 失敗テストの作成       | frontend-testing, playwright-testing                    |
| 5     | 実装             | TDD Green - テストを通す実装     | electron-ui-patterns, accessibility-wcag, state-lifting |
| 6     | リファクタリング | TDD Refactor - コード品質改善    | refactoring-patterns, clean-code-practices              |
| 7     | 品質保証         | 品質基準の検証                   | accessibility-wcag                                      |
| 8     | 最終レビュー     | 要件充足・整合性確認             | -                                                       |
| 9     | 手動テスト       | ユーザー体験・UI/UX検証          | playwright-testing                                      |
| 10    | ドキュメント     | 実装ガイド・未タスク検出         | -                                                       |
| 11    | PR作成           | コミット・PR作成・CI確認         | -                                                       |

## ディレクトリ構成

```
docs/30-workflows/search-replace-ui-implementation/
├── index.md                    # 本ファイル
├── artifacts.json              # 成果物管理
├── phase-0-preparation.md      # Phase 0: 準備
├── phase-4-testing.md          # Phase 4: テスト作成
├── phase-5-implementation.md   # Phase 5: 実装
├── phase-6-refactoring.md      # Phase 6: リファクタリング
├── phase-7-quality-assurance.md # Phase 7: 品質保証
├── phase-8-final-review.md     # Phase 8: 最終レビュー
├── phase-9-manual-testing.md   # Phase 9: 手動テスト
├── phase-10-documentation.md   # Phase 10: ドキュメント
├── phase-11-pr-creation.md     # Phase 11: PR作成
└── outputs/                    # Phase成果物
    ├── phase-0/
    ├── phase-4/
    ├── phase-5/
    ├── phase-6/
    ├── phase-7/
    ├── phase-8/
    ├── phase-9/
    ├── phase-10/
    └── phase-11/
```

## 品質基準

- テストカバレッジ: 80%以上
- ESLint警告: 0件
- TypeScript型エラー: 0件
- WCAG 2.1 AA準拠
- 検索応答時間: 200ms以内

## 参照資料

| 資料名                   | パス                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- |
| 元タスク指示書           | `docs/30-workflows/unassigned-task/task-search-replace-ui-implementation.md` |
| バックエンド実装         | `packages/shared/src/services/search/`                                       |
| 既存テスト               | `apps/desktop/src/features/search/__tests__/`                                |
| UI/UX設計                | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`          |
| キーボードショートカット | `.claude/skills/aiworkflow-requirements/references/ui-keyboard-shortcuts.md` |

## 実行方法

```bash
# Phase 0から順に実行
# 各Phaseの仕様書に従って作業を進める

# 例: Phase 4のテスト作成
# 1. phase-4-testing.md を読む
# 2. 記載されたスキルを参照
# 3. 手順に従ってテストを作成
# 4. 成果物を outputs/phase-4/ に出力
# 5. artifacts.json を更新
```

## 注意事項

1. **TDDサイクル**: Phase 4→5→6 はRed→Green→Refactorサイクルに従う
2. **スキル参照**: 各Phaseで指定されたスキルを必ず参照する
3. **成果物管理**: 各Phase完了時にartifacts.jsonを更新する
4. **レビューゲート**: Phase 8で要件充足を確認してから次に進む
5. **未タスク検出**: Phase 10で必ず未タスク検出を実施する

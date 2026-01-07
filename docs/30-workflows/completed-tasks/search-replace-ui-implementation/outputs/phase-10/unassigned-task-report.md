# 未タスク検出レポート

## 検出日時

2026-01-06T16:50:00Z（更新）

## 概要

Phase 10-1の必須作業として、6つのソースから未対応タスクを検出しました。
2026-01-06のリファクタリング後に再検出を実施し、新たな未タスクを特定しました。

## 検出結果サマリー

| 指標           | 値  |
| -------------- | --- |
| 検出タスク総数 | 3   |
| 高優先度       | 0   |
| 中優先度       | 2   |
| 低優先度       | 1   |

## 検出一覧

| #   | ソース                      | 課題内容                                      | 優先度 | 未タスク指示書                            |
| --- | --------------------------- | --------------------------------------------- | ------ | ----------------------------------------- |
| 1   | EditorView/hooks カバレッジ | useEditorInstance.ts テストカバレッジ 28.22%  | 中     | task-editorview-hooks-coverage.md         |
| 2   | EditorView/hooks カバレッジ | useWorkspaceSearch.ts テストカバレッジ 11.76% | 中     | task-editorview-hooks-coverage.md（同上） |
| 3   | EditorView コードコメント   | ファイル名検索のPhase 5移行                   | 低     | task-filename-search-migration.md         |

## 検出ソース別結果

### 1. Phase 3レビュー結果（MINOR判定）

**検索場所**: `outputs/phase-3/`
**検索パターン**: `MINOR|軽微|指摘`
**結果**: 検出なし

### 2. Phase 8レビュー結果（MINOR判定）

**検索場所**: `outputs/phase-8/`
**検索パターン**: `MINOR|軽微|指摘`
**結果**: 検出なし

### 3. Phase 9手動テスト結果（スコープ外の発見事項）

**検索場所**: `outputs/phase-9/`
**検索パターン**: `スコープ外|将来|TODO|今後`
**結果**: 検出なし

### 4. 各Phase成果物（TODO/FIXMEコメント）

**検索場所**: `outputs/`
**検索パターン**: `TODO|FIXME|将来対応|later|TBD`
**結果**: 検出なし

### 5. コードベース（TODO/FIXMEコメント）

**検索場所**: `apps/desktop/src/`
**検索パターン**: `TODO|FIXME|HACK|XXX|将来|移行予定`
**結果**: 1件検出

```
apps/desktop/src/renderer/views/EditorView/index.tsx:431:
{/* Filename Search - 既存のUnifiedSearchPanelを使用（将来Phase 5に移行予定） */}
```

### 6. 新規実装のテストカバレッジ確認（追加検証）

**検索場所**: `apps/desktop/src/renderer/views/EditorView/hooks/`
**確認日**: 2026-01-06
**結果**: 2件検出

2026-01-06のリファクタリングで以下のフックを新規作成:

| ファイル                      | カバレッジ | 目標 | 状態   |
| ----------------------------- | ---------- | ---- | ------ |
| useEditorInstance.ts          | 28.22%     | 80%  | 要改善 |
| useSearchKeyboardShortcuts.ts | 82.27%     | 80%  | OK     |
| useWorkspaceSearch.ts         | 11.76%     | 80%  | 要改善 |

### 7. スキルLOGS.md（partial/failure記録）

**検索対象スキル**:

- architectural-patterns
- state-lifting
- electron-ui-patterns
- accessibility-wcag
- frontend-testing
- refactoring-patterns
- clean-code-practices
- **code-smell-detection**（2026-01-06追加使用）

**結果**: 検出なし

使用したスキルのLOGS.mdには、partial/failure記録はありませんでした。

## 未タスク詳細

### 未タスク #1-2: EditorView hooks テストカバレッジ改善

**課題**: リファクタリングで抽出したカスタムフックのテストカバレッジが目標80%を下回っている

**対象ファイル**:

- `apps/desktop/src/renderer/views/EditorView/hooks/useEditorInstance.ts` (28.22%)
- `apps/desktop/src/renderer/views/EditorView/hooks/useWorkspaceSearch.ts` (11.76%)

**原因**: EditorViewからロジックを抽出した際、新規フック用のユニットテストを作成しなかった

**推奨対応**:

1. `useEditorInstance.test.ts` を作成
2. `useWorkspaceSearch.test.ts` を作成
3. 既存の `EditorView.test.tsx` のテストの一部を移植

**優先度**: 中

- 全体カバレッジ83.9%は目標達成
- ただし新規コードの品質保証のため追加テスト推奨

### 未タスク #3: ファイル名検索のPhase 5移行

**課題**: ファイル名検索モードが既存のUnifiedSearchPanelを使用しており、Phase 5実装への移行が未完了

**対象ファイル**:

- `apps/desktop/src/renderer/views/EditorView/index.tsx:431`

**コメント内容**:

```typescript
{
  /* Filename Search - 既存のUnifiedSearchPanelを使用（将来Phase 5に移行予定） */
}
```

**現状**:

- `file` モード: Phase 5 `SearchPanel` を使用 ✅
- `workspace` モード: Phase 5 `WorkspaceSearchPanel` を使用 ✅
- `filename` モード: 既存 `UnifiedSearchPanel` を使用（未移行）

**推奨対応**:

1. `FilenameFuzzySearchPanel` コンポーネントを Phase 5 形式で新規作成
2. EditorView から UnifiedSearchPanel への依存を削除
3. 既存 UnifiedSearchPanel を削除または非推奨化

**優先度**: 低

- 現在の機能は正常に動作
- Phase 5との整合性向上のための改善項目

## 未タスク指示書

検出された未タスクについて、以下の指示書を作成:

### 作成済み指示書

| ファイル                          | 対象未タスク | 作成日     |
| --------------------------------- | ------------ | ---------- |
| task-editorview-hooks-coverage.md | #1, #2       | 2026-01-06 |
| task-filename-search-migration.md | #3           | 2026-01-06 |

## 参照

- Phase 8最終レビュー: `outputs/phase-8/final-review.md`
- Phase 9統合状況レビュー: `outputs/phase-9/integration-review.md`
- artifacts.json: Phase 0-10のステータスと成果物
- 2026-01-06リファクタリング: EditorViewからカスタムフックを抽出

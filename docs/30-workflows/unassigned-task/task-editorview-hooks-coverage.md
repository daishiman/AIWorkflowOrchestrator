# 未タスク指示書: EditorView hooks テストカバレッジ改善

## メタ情報

| 項目             | 値                               |
| ---------------- | -------------------------------- |
| タスクID         | TASK-UNASSIGNED-HOOKS-COV-001    |
| 作成日           | 2026-01-06                       |
| 発見元           | Phase 10 未タスク検出            |
| 優先度           | 中                               |
| 関連ワークフロー | search-replace-ui-implementation |

## 背景

2026-01-06のリファクタリングで、`EditorView/index.tsx` から以下のカスタムフックを抽出:

- `useEditorInstance.ts` - EditorInstanceアダプター
- `useWorkspaceSearch.ts` - ワークスペース検索プロバイダ
- `useSearchKeyboardShortcuts.ts` - キーボードショートカット管理

この抽出により、EditorViewのコード量は約30%削減（713行→495行）されたが、
新規フック用のユニットテストが未作成のため、テストカバレッジが低下。

## 課題

| ファイル                      | 現在カバレッジ | 目標 | ギャップ |
| ----------------------------- | -------------- | ---- | -------- |
| useEditorInstance.ts          | 28.22%         | 80%  | -51.78%  |
| useWorkspaceSearch.ts         | 11.76%         | 80%  | -68.24%  |
| useSearchKeyboardShortcuts.ts | 82.27%         | 80%  | ✅ 達成  |

## 対象ファイル

```
apps/desktop/src/renderer/views/EditorView/hooks/
├── index.ts
├── useEditorInstance.ts          # テスト作成必要
├── useSearchKeyboardShortcuts.ts # カバレッジ達成済み
└── useWorkspaceSearch.ts         # テスト作成必要
```

## 完了条件

- [ ] `useEditorInstance.test.ts` が作成されている
- [ ] `useWorkspaceSearch.test.ts` が作成されている
- [ ] useEditorInstance.ts のカバレッジが 80% 以上
- [ ] useWorkspaceSearch.ts のカバレッジが 80% 以上
- [ ] 全テストがパスする
- [ ] 型チェックがパスする

## 実装ヒント

### useEditorInstance.ts のテスト観点

```typescript
// テストすべき関数/メソッド
-calculateCharPosition(content, line, column) -
  calculateLineColumn(content, charPosition) -
  editorInstanceRef.current.getContent() -
  editorInstanceRef.current.scrollToLine(line, column) -
  editorInstanceRef.current.getCursorPosition() -
  editorInstanceRef.current.setCursorPosition(line, column) -
  editorInstanceRef.current.replaceText(line, column, length, replacement) -
  editorInstanceRef.current.replaceAllText(matches, replacement) -
  editorInstanceRef.current.focus();
```

### useWorkspaceSearch.ts のテスト観点

```typescript
// テストすべきケース
- electronAPI.search が利用できない場合
- 検索成功時のファイルグループ化
- 検索エラー時のハンドリング
- AsyncGeneratorの動作確認
```

### 既存テストからの移植候補

`EditorView.test.tsx` の以下のテストを参考に:

- `editorInstanceRefメソッドの動作確認` テストグループ
- `workspaceSearchProvider` テストグループ

## 参考資料

- リファクタリング前のEditorView: `git show HEAD~1:apps/desktop/src/renderer/views/EditorView/index.tsx`
- 既存テスト: `apps/desktop/src/renderer/views/EditorView/EditorView.test.tsx`
- features/search のテスト例: `apps/desktop/src/features/search/__tests__/`

## 見積もり

| 作業項目                        | 工数目安    |
| ------------------------------- | ----------- |
| useEditorInstance.test.ts 作成  | 1-2時間     |
| useWorkspaceSearch.test.ts 作成 | 1時間       |
| カバレッジ調整                  | 30分        |
| **合計**                        | 2.5-3.5時間 |

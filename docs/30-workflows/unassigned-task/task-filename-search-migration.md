# 未タスク指示書: ファイル名検索のPhase 5移行

## メタ情報

```yaml
issue_number: 431
```

## メタ情報

| 項目             | 値                               |
| ---------------- | -------------------------------- |
| タスクID         | TASK-UNASSIGNED-FILENAME-MIG-001 |
| 作成日           | 2026-01-06                       |
| 発見元           | Phase 10 未タスク検出            |
| 優先度           | 低                               |
| 関連ワークフロー | search-replace-ui-implementation |

## 背景

検索・置換機能 UI実装（Phase 5）で、以下の検索モードを実装:

| モード       | 使用コンポーネント             | 実装状況  |
| ------------ | ------------------------------ | --------- |
| file         | Phase 5 `SearchPanel`          | ✅ 完了   |
| workspace    | Phase 5 `WorkspaceSearchPanel` | ✅ 完了   |
| **filename** | 既存 `UnifiedSearchPanel`      | ⚠️ 未移行 |

`filename` モード（ファイル名検索）は既存の `UnifiedSearchPanel` を使用しており、
Phase 5 の設計パターンへの移行が未完了。

## 課題

### コードの該当箇所

```typescript
// apps/desktop/src/renderer/views/EditorView/index.tsx:431
{/* Filename Search - 既存のUnifiedSearchPanelを使用（将来Phase 5に移行予定） */}
{isSearchPanelOpen && searchMode === "filename" && (
  <div className="border-b border-white/10">
    <UnifiedSearchPanel
      ref={searchPanelRef}
      currentFilePath={selectedFilePath}
      workspacePath={workspacePath}
      allFilePaths={allFilePaths}
      onFileSearchNavigate={handleSearchNavigate}
      onWorkspaceResultClick={handleWorkspaceResultClick}
      onFileNameSelect={handleFileNameSelect}
      onClose={handleSearchClose}
      onContentUpdated={setEditorContent}
      initialMode="filename"
      showReplace={false}
      className="bg-[var(--bg-secondary)]"
    />
  </div>
)}
```

### 問題点

1. **設計の不整合**: `SearchPanel`/`WorkspaceSearchPanel` と異なるAPIパターン
2. **依存の複雑化**: 旧実装への依存が残存
3. **保守性**: 2つの異なる設計パターンを維持する必要

## 完了条件

- [ ] `FilenameFuzzySearchPanel.tsx` を Phase 5 形式で新規作成
- [ ] EditorView から `UnifiedSearchPanel` への依存を削除
- [ ] `filename` モードが新コンポーネントを使用
- [ ] 全テストがパスする
- [ ] ファイル名検索の既存機能が維持されている
- [ ] 旧 `UnifiedSearchPanel` を削除または非推奨化

## 実装方針

### Option A: Phase 5形式での新規実装（推奨）

```typescript
// apps/desktop/src/features/search/components/FilenameFuzzySearchPanel.tsx

export interface FilenameFuzzySearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allFilePaths: string[];
  onFileSelect: (filePath: string) => void;
}

export function FilenameFuzzySearchPanel({
  isOpen,
  onClose,
  allFilePaths,
  onFileSelect,
}: FilenameFuzzySearchPanelProps) {
  // Fuzzy検索ロジック
  // Cmd+P 形式のファイル選択UI
}
```

### Option B: UnifiedSearchPanelの段階的移行

既存の `UnifiedSearchPanel` から `filename` モード関連のコードを抽出し、
Phase 5 形式にリファクタリング。

## 参考資料

- Phase 5 コンポーネント: `apps/desktop/src/features/search/components/`
- 既存実装: `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx`
- 設計書: `docs/30-workflows/search-replace-ui-implementation/outputs/phase-3/detailed-design.md`

## 見積もり

| 作業項目                      | 工数目安 |
| ----------------------------- | -------- |
| FilenameFuzzySearchPanel 設計 | 1時間    |
| コンポーネント実装            | 2-3時間  |
| テスト作成                    | 1-2時間  |
| EditorView 統合               | 30分     |
| 旧実装の削除/非推奨化         | 30分     |
| **合計**                      | 5-7時間  |

## 注意事項

- **現在の機能は正常に動作しているため、急ぐ必要はない**
- Phase 5 の設計パターンとの整合性を優先
- ユーザー体験を損なわないよう、既存のキーボードショートカット（Cmd+P）を維持

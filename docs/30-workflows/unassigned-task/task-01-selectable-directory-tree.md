# フォルダ一括選択機能 - タスク指示書

## メタ情報

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| タスクID         | TASK-DT-001                                |
| タスク名         | フォルダ一括選択機能                       |
| 分類             | 機能拡張                                   |
| 対象機能         | WorkspaceFileSelector                      |
| 優先度           | 低                                         |
| 見積もり規模     | 小規模                                     |
| ステータス       | 未実施                                     |
| 発見元           | Phase 1: 設計（file-selector-integration） |
| 発見日           | 2025-12-16                                 |
| 更新日           | 2025-12-17                                 |
| 発見エージェント | @arch-police                               |
| 前提タスク       | file-selector-integration（完了済み）      |

---

## 実装状況（2025-12-17更新）

### 完了済み（WorkspaceFileSelector実装）

以下の機能はWorkspaceFileSelectorとして実装済み：

| 機能                      | 状態 | 実装場所                           |
| ------------------------- | ---- | ---------------------------------- |
| ディレクトリツリー表示    | 完了 | WorkspaceFileSelector.tsx          |
| ファイル個別選択          | 完了 | SelectableFileTreeItem.tsx         |
| 選択状態パネル            | 完了 | SelectedFilesPanel.tsx             |
| ファイル名検索            | 完了 | WorkspaceSearchInput.tsx           |
| useWorkspaceFileSelection | 完了 | hooks/useWorkspaceFileSelection.ts |
| useFileSearch             | 完了 | hooks/useFileSearch.ts             |
| FileSelectorModal統合     | 完了 | FileSelectorModal/index.tsx        |

### 未実装（本タスクのスコープ）

| 機能             | 詳細                                    |
| ---------------- | --------------------------------------- |
| フォルダ一括選択 | フォルダクリックで配下ファイルを全選択  |
| 部分選択状態表示 | indeterminate状態のチェックボックス表示 |

### 別タスクで管理

| 機能                  | タスクファイル                                   |
| --------------------- | ------------------------------------------------ |
| ドラッグ&ドロップ選択 | task-file-selector-drag-drop.md                  |
| アクセシビリティ改善  | task-file-selector-accessibility-improvements.md |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

WorkspaceFileSelectorの基本実装が完了し、ファイルの個別選択が可能になった。しかし、フォルダをクリックして配下の全ファイルを一括選択する機能が未実装のため、大量ファイルの選択時にユーザーの操作負担が大きい。

### 1.2 問題点・課題

| 課題                   | 詳細                                                 |
| ---------------------- | ---------------------------------------------------- |
| フォルダ一括選択の欠如 | フォルダ配下のファイルを一括で選択できない           |
| 部分選択状態の非表示   | 一部子ファイルが選択された状態を視覚的に表現できない |

### 1.3 放置した場合の影響

- 大量ファイル選択時の操作効率が低下
- RAGデータ変換時のワークフローが煩雑化

---

## 2. 何を達成するか（What）

### 2.1 目的

WorkspaceFileSelectorにフォルダ一括選択機能を追加し、ユーザーがフォルダをクリックするだけで配下の全ファイルを選択できるようにする。

### 2.2 最終ゴール

- フォルダクリックで配下の全ファイルが自動選択される
- 部分選択状態（indeterminate）がチェックボックスで視覚的に表現される
- 再クリックで配下ファイルの選択が全解除される

### 2.3 スコープ

#### 含むもの

- SelectableFileTreeItemへのフォルダ選択機能追加
- useWorkspaceFileSelectionへの一括選択ロジック追加
- indeterminate状態のUI実装
- ユニットテスト追加

#### 含まないもの

- ドラッグ&ドロップ（別タスク: task-file-selector-drag-drop.md）
- アクセシビリティ改善（別タスク: task-file-selector-accessibility-improvements.md）
- IPC API追加（既存のworkspaceストアを使用）

### 2.4 成果物

| 種別   | 成果物                       | 配置先                                           |
| ------ | ---------------------------- | ------------------------------------------------ |
| 修正   | SelectableFileTreeItem.tsx   | WorkspaceFileSelector/SelectableFileTreeItem.tsx |
| 修正   | useWorkspaceFileSelection.ts | WorkspaceFileSelector/hooks/                     |
| テスト | ユニットテスト追加           | WorkspaceFileSelector/\*.test.tsx                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- WorkspaceFileSelectorが実装済み（完了）
- useWorkspaceFileSelectionフックが動作している（完了）

### 3.2 依存タスク

| タスク                    | 状態 | 依存関係 |
| ------------------------- | ---- | -------- |
| file-selector-integration | 完了 | 先行     |
| WorkspaceFileSelector実装 | 完了 | 先行     |

### 3.3 必要な知識・スキル

- React（TypeScript）
- Zustand状態管理
- ツリーデータ構造の再帰処理
- TDD（テスト駆動開発）

### 3.4 推奨アプローチ

1. useWorkspaceFileSelectionに`toggleFolder`関数を追加
2. 配下ファイル取得のヘルパー関数を実装
3. SelectableFileTreeItemでフォルダクリック時の動作を変更
4. indeterminate状態の計算ロジックを追加
5. チェックボックスUIをindeterminate対応に更新

---

## 4. 実行手順

### Phase構成

```
Phase 3: テスト作成 (TDD: Red)
  └─ T-03-1: フォルダ一括選択テスト作成
Phase 4: 実装 (TDD: Green)
  ├─ T-04-1: toggleFolder関数実装
  ├─ T-04-2: indeterminate状態計算実装
  └─ T-04-3: UI更新
Phase 5: リファクタリング
  └─ T-05-1: コード品質改善
Phase 6: 品質保証
  └─ T-06-1: テスト実行・検証
```

---

### T-03-1: フォルダ一括選択テスト作成

#### 目的

フォルダ一括選択機能のテストを先に作成する（TDD Red）。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/
```

#### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: テスト設計の専門家

#### テストケース

```typescript
describe("useWorkspaceFileSelection - folder selection", () => {
  it("toggleFolder: フォルダクリックで配下の全ファイルが選択される", () => {});
  it("toggleFolder: 選択済みフォルダの再クリックで配下ファイルが全解除される", () => {});
  it('getSelectionState: 全ファイル選択時は"selected"を返す', () => {});
  it('getSelectionState: 一部ファイル選択時は"indeterminate"を返す', () => {});
  it('getSelectionState: 未選択時は"unselected"を返す', () => {});
});
```

#### 完了条件

- [ ] toggleFolderのテスト作成
- [ ] getSelectionStateのテスト作成
- [ ] テストがRed状態（失敗）で実行される

---

### T-04-1: toggleFolder関数実装

#### 目的

フォルダをクリックした際に配下ファイルを一括選択/解除する関数を実装。

#### 実装概要

```typescript
// useWorkspaceFileSelection.ts に追加

/** フォルダ配下の全ファイルを再帰的に取得 */
function getAllFilesInFolder(node: FileNode): FileNode[] {
  if (node.type === "file") return [node];
  return node.children?.flatMap(getAllFilesInFolder) ?? [];
}

/** フォルダ選択の切り替え */
const toggleFolder = useCallback(
  (folderPath: string, folder: FileNode, folderId: string) => {
    const files = getAllFilesInFolder(folder);
    const allSelected = files.every((f) => selectedPaths.has(f.path));

    if (allSelected) {
      // 全解除
      files.forEach((f) => removeFile(f.path));
    } else {
      // 全選択
      files.forEach((f) => {
        if (!selectedPaths.has(f.path)) {
          toggleFile(f.path, f, folderId);
        }
      });
    }
  },
  [selectedPaths, toggleFile, removeFile],
);
```

#### 完了条件

- [ ] toggleFolder関数実装
- [ ] getAllFilesInFolderヘルパー実装
- [ ] テストがGreen状態（成功）

---

### T-04-2: indeterminate状態計算実装

#### 目的

フォルダの選択状態（未選択/部分選択/全選択）を計算する関数を実装。

#### 実装概要

```typescript
type SelectionState = "unselected" | "indeterminate" | "selected";

const getSelectionState = useCallback(
  (folder: FileNode): SelectionState => {
    const files = getAllFilesInFolder(folder);
    if (files.length === 0) return "unselected";

    const selectedCount = files.filter((f) => selectedPaths.has(f.path)).length;

    if (selectedCount === 0) return "unselected";
    if (selectedCount === files.length) return "selected";
    return "indeterminate";
  },
  [selectedPaths],
);
```

#### 完了条件

- [ ] getSelectionState関数実装
- [ ] テストがGreen状態（成功）

---

### T-04-3: UI更新

#### 目的

SelectableFileTreeItemにindeterminateチェックボックスUIを実装。

#### 実装概要

```tsx
// SelectableFileTreeItem.tsx

// フォルダの場合
{
  node.type === "folder" && (
    <input
      type="checkbox"
      ref={(el) => {
        if (el) el.indeterminate = selectionState === "indeterminate";
      }}
      checked={selectionState === "selected"}
      onChange={() => onFolderToggle(node.path, node)}
    />
  );
}
```

#### 完了条件

- [ ] indeterminateチェックボックス実装
- [ ] フォルダクリック時にtoggleFolderが呼ばれる
- [ ] 視覚的に3状態が区別できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] フォルダクリックで配下ファイルが全選択される
- [ ] 選択済みフォルダ再クリックで配下ファイルが全解除される
- [ ] 部分選択状態（indeterminate）がチェックボックスで表示される
- [ ] 全選択状態がチェックボックスで表示される

### 品質要件

- [ ] ユニットテストカバレッジ80%以上維持
- [ ] Lintエラーなし
- [ ] 型エラーなし

---

## 6. 検証方法

### テストケース

| No  | カテゴリ | テスト項目     | 期待結果                          |
| --- | -------- | -------------- | --------------------------------- |
| 1   | 選択     | フォルダ選択   | 配下ファイルが全選択される        |
| 2   | 選択     | フォルダ再選択 | 配下ファイルが全解除される        |
| 3   | 表示     | 部分選択状態   | indeterminateチェックボックス表示 |
| 4   | 表示     | 全選択状態     | チェック済みチェックボックス表示  |
| 5   | 表示     | 未選択状態     | 空のチェックボックス表示          |

### 検証手順

1. `pnpm --filter @repo/desktop test:run` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` でアプリ起動
3. WorkspaceFileSelectorでフォルダをクリックして動作確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                   |
| ---------------------------------- | ------ | -------- | -------------------------------------- |
| 大量ファイルでの選択パフォーマンス | 中     | 低       | バッチ処理でsetState呼び出し回数を削減 |
| 深いネスト構造での再帰処理         | 低     | 低       | 既存ツリー構造を使用（問題なし）       |

---

## 8. 参照情報

### 関連ドキュメント

- [WorkspaceFileSelector実装](../../../apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/)
- [useWorkspaceFileSelection](../../../apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/hooks/useWorkspaceFileSelection.ts)

### 参考資料

- [MDN: indeterminate](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes)

---

## 9. 備考

### チェックボックス状態

| 状態                 | 表示              | 説明                               |
| -------------------- | ----------------- | ---------------------------------- |
| 未選択               | ☐                 | 配下ファイルが選択されていない     |
| 選択済み             | ☑                 | 配下ファイルが全選択されている     |
| 部分選択（フォルダ） | ☑ (indeterminate) | 一部の配下ファイルが選択されている |

### 補足事項

- 本タスクはWorkspaceFileSelector完了後に着手可能
- D&D機能は別タスク（task-file-selector-drag-drop.md）で管理

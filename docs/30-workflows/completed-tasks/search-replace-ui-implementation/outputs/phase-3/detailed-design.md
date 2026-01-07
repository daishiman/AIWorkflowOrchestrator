# Phase 3: 詳細設計

## 概要

検索・置換機能UIの詳細設計を行った。

## SearchPanel Props

```typescript
interface SearchPanelProps {
  content: string; // 検索対象のテキスト
  onClose: () => void; // パネルを閉じる
  onFindNext: (query: string, options: SearchOptions) => void;
  onFindPrevious: (query: string, options: SearchOptions) => void;
  onReplace: (
    query: string,
    replacement: string,
    options: SearchOptions,
  ) => void;
  onReplaceAll: (
    query: string,
    replacement: string,
    options: SearchOptions,
  ) => void;
  initialQuery?: string; // 初期検索クエリ
}
```

## WorkspaceSearchPanel Props

```typescript
interface WorkspaceSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workspacePath: string;
  onFileOpen: (filePath: string, line: number, column: number) => void;
  initialSearchText?: string;
  showReplace?: boolean;
  searchProvider?: SearchProvider;
}
```

## アクセシビリティ設計（WCAG 2.1 AA準拠）

### 必須ARIA属性

| コンポーネント       | role      | aria-label            | その他        |
| -------------------- | --------- | --------------------- | ------------- |
| SearchPanel          | search    | ファイル内検索        | aria-expanded |
| WorkspaceSearchPanel | region    | ワークスペース検索    | -             |
| 検索入力             | searchbox | 検索                  | -             |
| オプションボタン     | -         | 大文字小文字を区別 等 | aria-pressed  |
| 検索結果ツリー       | tree      | 検索結果              | -             |
| ファイルグループ     | treeitem  | -                     | aria-expanded |

### キーボードナビゲーション

- Escape: パネルを閉じる
- Enter: 検索実行
- Arrow Up/Down: 結果間移動

## 使用スキル

| スキル               | 結果    | 備考                             |
| -------------------- | ------- | -------------------------------- |
| electron-ui-patterns | success | Electronアプリ向けUIパターン適用 |
| accessibility-wcag   | success | WCAG 2.1 AA準拠設計              |

## 完了日時

2026-01-05T14:40:00Z

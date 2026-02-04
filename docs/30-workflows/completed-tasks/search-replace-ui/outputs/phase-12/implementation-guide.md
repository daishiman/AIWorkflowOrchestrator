# 検索・置換機能 実装ガイド

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 12                     |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

---

# Part 1: 概念的説明（中学生でもわかる版）

## 検索機能ってなに？

想像してください。あなたの部屋に1000冊の本があって、「猫」という言葉が出てくるページを全部探したいとします。
1冊ずつ全ページをめくっていたら、何日もかかりますよね？

**検索機能は、コンピューターがその作業を一瞬でやってくれる機能です。**

### なぜ必要？

プログラマーは毎日たくさんのコードファイルを扱います。
「このエラーメッセージが出る場所はどこだろう？」と思ったとき、
検索機能があれば、何千ものファイルから一瞬で見つけることができます。

### 2種類の検索

この機能には2つの検索方法があります：

1. **ファイル内検索** （本1冊の中を探す）
   - 今開いているファイルの中だけを探す
   - Cmd+F（Mac）やCtrl+F（Windows）で使える

2. **ワークスペース検索** （本棚全体を探す）
   - プロジェクト内のすべてのファイルを一度に探す
   - Cmd+Shift+F（Mac）やCtrl+Shift+F（Windows）で使える

### 置換機能とは？

「猫」を全部「犬」に変えたい！という時に使います。

例えば：

- ファイル内の「oldName」を全部「newName」に変える
- 変数名のスペルミスを一括で直す

**一つずつ確認しながら変える**方法と、**全部まとめて変える**方法が選べます。

### 便利な検索オプション

| オプション       | 説明                                   | 例                        |
| ---------------- | -------------------------------------- | ------------------------- |
| 大文字小文字区別 | 「Cat」と「cat」を別のものとして探す   | 「Cat」だけを見つけたい時 |
| 単語単位         | 「the」で検索したとき「there」は除外   | 単語だけを探したい時      |
| 正規表現         | パターンで検索（プログラマー向け機能） | 数字だけを探したい時      |

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │  EditorView     │  │         Search Feature           │  │
│  │  ┌───────────┐  │  │  ┌────────────┐ ┌─────────────┐ │  │
│  │  │SearchPanel│◄─┼──┼─►│useSearchStore│ │SearchPanel  │ │  │
│  │  └───────────┘  │  │  └────────────┘ └─────────────┘ │  │
│  │  ┌───────────┐  │  │  ┌────────────┐ ┌─────────────┐ │  │
│  │  │Workspace  │◄─┼──┼─►│Keyboard    │ │Workspace    │ │  │
│  │  │SearchPanel│  │  │  │Shortcuts   │ │SearchPanel  │ │  │
│  │  └───────────┘  │  │  └────────────┘ └─────────────┘ │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ IPC (search:workspace)
┌───────────────────────────▼──────────────────────────────────┐
│                      Main Process                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Search Service                       │   │
│  │  - executeWorkspaceSearch()                          │   │
│  │  - ファイルシステムアクセス                           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 型定義

### SearchOptions

```typescript
interface SearchOptions {
  caseSensitive: boolean; // 大文字小文字を区別
  wholeWord: boolean; // 単語単位で検索
  regex: boolean; // 正規表現を使用
}
```

### SearchMatch

```typescript
interface SearchMatch {
  index: number; // マッチのインデックス
  start: number; // 開始位置（文字数）
  end: number; // 終了位置（文字数）
  line: number; // 行番号
  column: number; // 列番号
}
```

### FileSearchResult

```typescript
interface FileSearchResult {
  filePath: string;
  matches: Array<{
    line: number;
    column: number;
    length: number;
    text: string;
    lineText: string;
  }>;
}
```

### SearchProviderOptions

```typescript
interface SearchProviderOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  includePattern?: string;
  excludePattern?: string;
}
```

## コンポーネント

### SearchPanel

ファイル内検索・置換を行うUIコンポーネント。

**Props**:

```typescript
interface SearchPanelProps {
  isOpen: boolean;
  initialShowReplace?: boolean;
  initialSearchText?: string;
  editorInstance: EditorInstance | null;
  onClose: () => void;
  onOpenWorkspaceSearch?: () => void;
}
```

**使用例**:

```tsx
<SearchPanel
  isOpen={isSearchPanelOpen}
  editorInstance={editorInstanceRef.current}
  onClose={() => setIsSearchPanelOpen(false)}
  onOpenWorkspaceSearch={() => {
    setSearchMode("workspace");
  }}
/>
```

### WorkspaceSearchPanel

ワークスペース全体を検索するUIコンポーネント。

**Props**:

```typescript
interface WorkspaceSearchPanelProps {
  isOpen: boolean;
  workspacePath?: string;
  workspaceSearchProvider: WorkspaceSearchProvider;
  onClose: () => void;
  onFileClick: (filePath: string, line?: number, column?: number) => void;
}
```

**使用例**:

```tsx
<WorkspaceSearchPanel
  isOpen={isSearchPanelOpen && searchMode === "workspace"}
  workspacePath={workspacePath}
  workspaceSearchProvider={workspaceSearchProvider}
  onClose={() => setIsSearchPanelOpen(false)}
  onFileClick={(filePath, line, column) => {
    // ファイルを開いて該当位置にジャンプ
  }}
/>
```

## フック

### useSearchKeyboardShortcuts

グローバルキーボードショートカットを管理。

```typescript
interface UseSearchKeyboardShortcutsOptions {
  isSearchPanelOpen: boolean;
  openFileSearch: () => void;
  openWorkspaceSearch: () => void;
  openReplaceMode: () => void;
  setIsSearchPanelOpen: (open: boolean) => void;
}

function useSearchKeyboardShortcuts(
  options: UseSearchKeyboardShortcutsOptions,
): void;
```

### useWorkspaceSearch

ワークスペース検索のIPCプロバイダを提供。

```typescript
type WorkspaceSearchProvider = (
  wsPath: string,
  query: string,
  options: SearchProviderOptions,
) => AsyncGenerator<FileSearchResult>;

function useWorkspaceSearch(): WorkspaceSearchProvider;
```

**実装例**:

```typescript
const workspaceSearchProvider = useWorkspaceSearch();

// 使用時
for await (const result of workspaceSearchProvider(
  "/path/to/workspace",
  "searchQuery",
  { caseSensitive: true },
)) {
  console.log(result.filePath, result.matches.length);
}
```

## IPC チャンネル

### search:workspace

ワークスペース検索を実行するIPCチャンネル。

**リクエスト**:

```typescript
interface WorkspaceSearchRequest {
  rootPath: string;
  query: string;
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    useRegex?: boolean;
  };
  includePattern?: string;
  excludePatterns?: string[];
}
```

**レスポンス**:

```typescript
interface WorkspaceSearchResponse {
  success: boolean;
  data?: {
    matches: Array<{
      filePath: string;
      line: number;
      column: number;
      length: number;
      text: string;
    }>;
  };
  error?: string;
}
```

## エラーコード

| コード          | 説明                   | 対処法                     |
| --------------- | ---------------------- | -------------------------- |
| INVALID_PATTERN | 無効な正規表現パターン | 正規表現の構文を確認       |
| TIMEOUT         | 検索タイムアウト       | 検索範囲を絞る             |
| FILE_READ_ERROR | ファイル読み取りエラー | ファイルの権限を確認       |
| CANCELLED       | 検索がキャンセルされた | 正常終了（エラーではない） |

## セキュリティ考慮事項

### ReDoS対策

正規表現パターンの検証を実装し、悪意のあるパターンをブロック。

```typescript
function validateRegexPattern(pattern: string): boolean {
  // 危険なパターンを検出
  const dangerousPatterns = [
    /\(\.\*\)\+/, // (.*)+
    /\(\.\+\)\+/, // (.+)+
    /\([^)]*\|[^)]*\)\+/, // (a|b)+
  ];

  return !dangerousPatterns.some((dp) => dp.test(pattern));
}
```

### パストラバーサル防止

ワークスペース外へのアクセスを防止。

```typescript
function isPathWithinWorkspace(
  filePath: string,
  workspacePath: string,
): boolean {
  const normalized = path.normalize(filePath);
  return normalized.startsWith(workspacePath);
}
```

## パフォーマンス設定

| 設定項目       | 値          | 説明                       |
| -------------- | ----------- | -------------------------- |
| 検索デバウンス | 150-300ms   | 入力後の検索開始までの遅延 |
| 検索応答目標   | 200ms (P50) | 50%タイルの応答時間        |
| 最大結果数     | 10000件     | パフォーマンス保護のため   |

## テストファイル

| ファイル                      | 内容                       |
| ----------------------------- | -------------------------- |
| SearchPanel.test.tsx          | SearchPanel ユニットテスト |
| WorkspaceSearchPanel.test.tsx | ワークスペース検索テスト   |
| useSearchStore.test.ts        | 状態管理テスト             |
| Accessibility.test.tsx        | アクセシビリティテスト     |
| EdgeCases.test.tsx            | エッジケーステスト         |
| Performance.test.tsx          | パフォーマンステスト       |
| e2e/search.spec.ts            | E2Eテスト                  |

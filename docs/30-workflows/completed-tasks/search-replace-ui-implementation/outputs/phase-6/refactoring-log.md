# Phase 6: リファクタリング記録

## 概要

TDD Refactorフェーズとして、コード品質の改善とTypeScriptエラーの解消を行った。

## リファクタリング内容

### 1. 型定義のローカル化

**問題**: `@repo/shared/src/search/types` からのimportが失敗していた

**解決策**: `apps/desktop/src/features/search/types.ts` に `FileSearchResult` と `SearchMatch` 型をローカルに定義

```typescript
// 追加した型定義
export interface SearchMatch {
  line: number;
  column: number;
  length: number;
  text: string;
  lineText: string;
  context?: {
    before: string[];
    after: string[];
  };
}

export interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}
```

### 2. Implicit any 型の修正

**対象ファイル**:

- `WorkspaceSearchPanel.tsx`
- `WorkspaceSearchPanel.test.tsx`

**修正箇所**:

- `file.matches.map((match, matchIdx)` → `(match: SearchMatch, matchIdx: number)`
- `context?.before?.map((line, i)` → `(line: string, i: number)`
- テストファイルのmockプロバイダ内の型アノテーション追加

### 3. Import文の整理

```typescript
// Before
import type { FileSearchResult } from "@repo/shared/src/search/types";

// After
import type {
  WorkspaceSearchPanelProps,
  FileSearchResult,
  SearchMatch,
} from "../types";
```

## 検証結果

### TypeScriptエラー

- **修正前**: 検索機能関連で5件のエラー
- **修正後**: 検索機能関連で0件のエラー

### テスト結果

- **全テスト**: 94件合格
- **SearchPanel.test.tsx**: 46件合格
- **WorkspaceSearchPanel.test.tsx**: 48件合格

### Lintエラー

- 検索機能関連: 0件

## 使用スキル

| スキル               | 結果    | 備考                |
| -------------------- | ------- | ------------------- |
| refactoring-patterns | success | 型定義のローカル化  |
| clean-code-practices | success | implicit any の解消 |

## ステータス

**completed** - TypeScriptエラー0件、テスト94件合格

## 完了日時

2026-01-05T17:25:00Z

---

# Phase 6: リファクタリング記録 (2回目)

## 概要

追加のリファクタリングとして、コードスメルの解消と共通コンポーネントの抽出を行った。

## 検出したコードスメル

| カテゴリ         | ファイル                           | 内容                                          |
| ---------------- | ---------------------------------- | --------------------------------------------- |
| 長すぎる関数     | SearchPanel.tsx                    | ~450行のコンポーネント                        |
| 長すぎる関数     | WorkspaceSearchPanel.tsx           | ~750行のコンポーネント                        |
| 重複コード       | 両Panel                            | 検索オプションボタン（Aa, [ab], .\*）が重複   |
| 重複コード       | SearchPanel.tsx                    | goToNext/goToPreviousのハイライト更新ロジック |
| マジックナンバー | SearchPanel.tsx                    | デバウンス150ms                               |
| マジックナンバー | WorkspaceSearchPanel.tsx           | デバウンス300ms                               |
| 型定義重複       | types.ts, useSearchStore.ts        | SearchMatch型が2箇所で定義                    |
| 型定義重複       | types.ts, WorkspaceSearchPanel.tsx | SearchProviderOptions型が2箇所で定義          |

## リファクタリング内容

### 1. 定数ファイル作成（マジックナンバー解消）

**ファイル**: `constants.ts`

```typescript
export const FILE_SEARCH_DEBOUNCE_MS = 150;
export const WORKSPACE_SEARCH_DEBOUNCE_MS = 300;
export const SCROLL_OFFSET_LINES = 3;
export const DEFAULT_FONT_SIZE_PX = 14;
export const LINE_HEIGHT_MULTIPLIER = 1.5;
```

### 2. ユーティリティ関数抽出

**ファイル**: `utils/highlightUtils.tsx`

```typescript
// 重複していた関数を共通化
export function highlightMatch(lineText, matchStart, matchLength): ReactNode;
export function createHighlights(matches, currentIndex): Array<Highlight>;
```

### 3. 共通コンポーネント抽出（重複排除）

**ファイル**: `components/SearchOptionButtons.tsx`

SearchPanel と WorkspaceSearchPanel で重複していた検索オプションボタン群を共通コンポーネントとして抽出。

```typescript
export function SearchOptionButtons({
  caseSensitive,
  onCaseSensitiveChange,
  wholeWord,
  onWholeWordChange,
  regex,
  onRegexChange,
}: SearchOptionButtonsProps);
```

### 4. 型定義の統合

**変更**:

- `useSearchStore.ts` から `SearchMatch`, `SearchOptions` を削除
- `types.ts` に統合し、再エクスポートで後方互換性維持
- `WorkspaceSearchPanel.tsx` から `SearchProviderOptions` を削除
- `types.ts` からimportに変更

### 5. エクスポート整理

**ファイル**: `index.ts`

新しいコンポーネント、ユーティリティ、定数をエクスポートに追加。

## 作成ファイル

| ファイル                             | 説明                             |
| ------------------------------------ | -------------------------------- |
| `constants.ts`                       | 定数定義                         |
| `utils/highlightUtils.tsx`           | ハイライトユーティリティ         |
| `utils/index.ts`                     | ユーティリティバレルエクスポート |
| `components/SearchOptionButtons.tsx` | 共通検索オプションボタン         |

## 変更ファイル

| ファイル                   | 変更内容                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `SearchPanel.tsx`          | 定数・共通コンポーネント・ユーティリティ使用                 |
| `WorkspaceSearchPanel.tsx` | 定数・共通コンポーネント・ユーティリティ使用、重複型定義削除 |
| `useSearchStore.ts`        | 型定義をtypes.tsからimport                                   |
| `TextAreaEditorAdapter.ts` | 定数使用                                                     |
| `index.ts`                 | 新エクスポート追加                                           |
| `types.ts`                 | SearchOptions型追加                                          |

## 検証結果

### テスト結果

- **全テスト**: 94件合格
- **SearchPanel.test.tsx**: 46件合格
- **WorkspaceSearchPanel.test.tsx**: 48件合格

### TypeScriptエラー

- 検索機能関連: 0件

## 使用スキル

| スキル               | 結果    | 備考                                                                    |
| -------------------- | ------- | ----------------------------------------------------------------------- |
| refactoring-patterns | success | Extract Component, Extract Function, Replace Magic Number with Constant |
| clean-code-practices | success | DRY原則適用、型定義統合                                                 |

## ステータス

**completed** - テスト94件合格、TypeScriptエラー0件

## 完了日時

2026-01-06T07:45:00Z

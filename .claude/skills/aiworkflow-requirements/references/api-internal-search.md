# Search Service API

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**実装**: `packages/shared/src/search/`

## 概要

テキスト検索・置換機能を提供する内部サービスAPI。ファイル内検索とワークスペース全体検索の両方をサポート。

## 主要クラス

| クラス                  | 責務                                       |
| ----------------------- | ------------------------------------------ |
| `SearchService`         | 検索・置換機能のファサード（統一API）      |
| `PatternMatcher`        | パターンマッチング（リテラル/正規表現）    |
| `FileSearchEngine`      | 単一ファイル内の検索                       |
| `ReplaceEngine`         | テキスト置換処理                           |
| `WorkspaceSearchEngine` | 複数ファイル横断検索（AsyncGenerator）     |

## SearchService メソッド

### searchInFile()

```typescript
searchInFile(
  content: string,
  pattern: string,
  options: SearchOptions
): SearchMatch[]
```

**機能**:

- 単一ファイル（テキスト）内を検索
- 行番号・列番号を含むマッチ情報を返却
- コンテキスト行（前後の行）を取得可能

**パラメータ**:

| パラメータ              | 型      | 説明                   |
| ----------------------- | ------- | ---------------------- |
| `content`               | string  | 検索対象のテキスト     |
| `pattern`               | string  | 検索パターン           |
| `options.caseSensitive` | boolean | 大文字小文字を区別     |
| `options.wholeWord`     | boolean | 単語単位でマッチ       |
| `options.regex`         | boolean | 正規表現を使用         |

**戻り値**:

| フィールド          | 型       | 説明                  |
| ------------------- | -------- | --------------------- |
| `[].line`           | number   | 行番号（1-indexed）   |
| `[].column`         | number   | 列番号（1-indexed）   |
| `[].length`         | number   | マッチした文字列長    |
| `[].text`           | string   | マッチしたテキスト    |
| `[].lineText`       | string   | 行全体のテキスト      |
| `[].context.before` | string[] | 前の行（コンテキスト）|
| `[].context.after`  | string[] | 後の行（コンテキスト）|

### searchInWorkspace()

```typescript
async *searchInWorkspace(
  pattern: string,
  options: WorkspaceSearchOptions & { workspacePath?: string }
): AsyncGenerator<FileSearchResult>
```

**機能**:

- ワークスペース内の複数ファイルを検索
- AsyncGeneratorによるストリーミング結果返却
- glob パターンによるファイル絞り込み
- キャンセル可能

**パラメータ**:

| パラメータ             | 型       | 説明                            |
| ---------------------- | -------- | ------------------------------- |
| `pattern`              | string   | 検索パターン                    |
| `options.workspacePath`| string   | ワークスペースパス（省略時はcwd）|
| `options.include`      | string[] | インクルードパターン（glob）    |
| `options.exclude`      | string[] | エクスクルードパターン（glob）  |
| `options.maxResults`   | number   | 最大結果数                      |
| `options.contextLines` | number   | コンテキスト行数                |

**戻り値（yield）**:

| フィールド | 型            | 説明             |
| ---------- | ------------- | ---------------- |
| `filePath` | string        | ファイルパス     |
| `matches`  | SearchMatch[] | マッチ情報配列   |

### replaceInFile()

```typescript
replaceInFile(
  content: string,
  pattern: string,
  replacement: string,
  options: SearchOptions
): ReplaceResult
```

**機能**:

- 単一ファイル内のパターンを置換
- 正規表現キャプチャグループ（$1, $2, $<name>）のサポート
- 置換位置のトラッキング

**パラメータ**:

| パラメータ    | 型            | 説明             |
| ------------- | ------------- | ---------------- |
| `content`     | string        | 置換対象テキスト |
| `pattern`     | string        | 検索パターン     |
| `replacement` | string        | 置換文字列       |
| `options`     | SearchOptions | 検索オプション   |

**戻り値**:

| フィールド               | 型            | 説明               |
| ------------------------ | ------------- | ------------------ |
| `content`                | string        | 置換後のテキスト   |
| `count`                  | number        | 置換した件数       |
| `replacements`           | Replacement[] | 置換詳細一覧       |
| `replacements[].line`    | number        | 行番号             |
| `replacements[].column`  | number        | 列番号             |
| `replacements[].originalText`  | string  | 置換前テキスト     |
| `replacements[].replacedText`  | string  | 置換後テキスト     |

### replaceInWorkspace()

```typescript
async *replaceInWorkspace(
  pattern: string,
  replacement: string,
  options: WorkspaceSearchOptions & { workspacePath?: string }
): AsyncGenerator<WorkspaceReplaceResult>
```

**機能**:

- ワークスペース内の複数ファイルを置換
- プレビューモード（ファイル変更しない）
- ドライランモードのサポート
- AsyncGeneratorによるストリーミング

**パラメータ**:

| パラメータ        | 型      | 説明                         |
| ----------------- | ------- | ---------------------------- |
| `pattern`         | string  | 検索パターン                 |
| `replacement`     | string  | 置換文字列                   |
| `options.preview` | boolean | プレビューモード             |
| `options.dryRun`  | boolean | ドライランモード             |

**戻り値（yield）**:

| フィールド     | 型            | 説明                       |
| -------------- | ------------- | -------------------------- |
| `filePath`     | string        | ファイルパス               |
| `success`      | boolean       | 置換成功/失敗              |
| `count`        | number        | 置換件数（成功時）         |
| `error`        | string        | エラーメッセージ（失敗時） |
| `replacements` | Replacement[] | 置換詳細（プレビュー時）   |

### cancelSearch()

```typescript
cancelSearch(): void
```

**機能**:

- 進行中のワークスペース検索をキャンセル

## エラーコード

| コード           | 説明                   | 原因                         |
| ---------------- | ---------------------- | ---------------------------- |
| `INVALID_PATTERN`| パターンが無効         | 不正な正規表現               |
| `TIMEOUT`        | タイムアウト           | ReDoS対策（5000msデフォルト）|
| `FILE_READ_ERROR`| ファイル読み取りエラー | 権限不足、ファイル不在       |
| `PATH_TRAVERSAL` | パストラバーサル検出   | 不正なパス参照               |
| `UNKNOWN`        | 不明なエラー           | その他                       |

## 使用パターン

**パターン1: ファイル内検索**

```typescript
import { SearchService } from "@repo/shared/search";

const service = new SearchService();
const matches = service.searchInFile(content, "pattern", {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
});

for (const match of matches) {
  console.log(`${match.line}:${match.column} - ${match.text}`);
}
```

**パターン2: ワークスペース検索**

```typescript
import { SearchService } from "@repo/shared/search";

const service = new SearchService();

for await (const result of service.searchInWorkspace("TODO", {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
  include: ["**/*.ts"],
  exclude: ["**/node_modules/**"],
})) {
  console.log(`${result.filePath}: ${result.matches.length} matches`);
}
```

**パターン3: 置換プレビュー**

```typescript
import { SearchService } from "@repo/shared/search";

const service = new SearchService();

for await (const result of service.replaceInWorkspace("oldFunc", "newFunc", {
  caseSensitive: true,
  wholeWord: true,
  regex: false,
  preview: true,  // ファイル変更しない
})) {
  if (result.success) {
    console.log(`${result.filePath}: ${result.count} replacements`);
    result.replacements?.forEach((r) => {
      console.log(`  L${r.line}: ${r.originalText} → ${r.replacedText}`);
    });
  }
}
```

## 性能特性

| 指標                       | 値              |
| -------------------------- | --------------- |
| ReDoSタイムアウト          | 5000ms          |
| デフォルト除外パターン     | node_modules等  |
| ストリーミング             | AsyncGenerator  |
| キャンセル                 | サポート        |
| テストカバレッジ           | 83.92%          |

## デフォルト除外パターン

以下のディレクトリはデフォルトで検索から除外されます：

- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.next/`
- `coverage/`

---

## 関連ドキュメント

- [エラーハンドリング仕様](./error-handling.md)
- [コアインターフェース仕様](./interfaces-core.md)
- [セキュリティガイドライン](./security-guidelines.md)
- [検索・置換パネルUI設計](./ui-ux-search-panel.md)

# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| Phase      | 2              |
| Phase名    | 設計           |
| 前提Phase  | Phase 1        |
| 後続Phase  | Phase 3        |
| ステータス | 未実施         |
| 作成日     | 2026-01-04     |
| 機能名     | 検索・置換機能 |

---

## 目的

Phase 1で定義された要件に基づき、ファイル内検索/置換およびワークスペース検索/置換のUI設計と検索エンジン設計を行う。

## 背景

VS Codeライクな使い勝手を目指し、標準的なキーボードショートカットを採用した検索・置換機能のアーキテクチャを設計する。

---

## サブタスク

| ID     | サブタスク名             | 責務                                   |
| ------ | ------------------------ | -------------------------------------- |
| T-02-1 | ファイル内検索UI設計     | 検索UIコンポーネント設計               |
| T-02-2 | ワークスペース検索UI設計 | ワークスペース検索UIコンポーネント設計 |
| T-02-3 | 検索エンジン設計         | 検索・置換ロジック設計                 |

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: electron-ui-patterns

**パス**: `.claude/skills/electron-ui-patterns/SKILL.md`

**Trigger条件**:
BrowserWindow、メニュー、ダイアログ、トレイの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 検索パネルUI設計書
- キーボードショートカット設計書

---

### スキル2: accessibility-wcag

**パス**: `.claude/skills/accessibility-wcag/SKILL.md`

**Trigger条件**:
アクセシビリティ設計と検証フローが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- アクセシビリティ設計チェックリスト

---

### スキル3: custom-hooks-patterns

**パス**: `.claude/skills/custom-hooks-patterns/SKILL.md`

**Trigger条件**:
React カスタムフックのパターン設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- useSearch, useReplace カスタムフック設計

---

### スキル4: state-lifting

**パス**: `.claude/skills/state-lifting/SKILL.md`

**Trigger条件**:
コンポーネント間の状態管理設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 検索状態管理設計書

---

## 参照資料

| 参照資料          | パス                                                                                       | 内容       |
| ----------------- | ------------------------------------------------------------------------------------------ | ---------- |
| Phase 1成果物     | `outputs/phase-1/`                                                                         | 要件定義書 |
| UI/UXガイドライン | `docs/00-requirements/16-ui-ux-guidelines.md`                                              | UI設計基準 |
| VS Code Search    | [VS Code Search](https://code.visualstudio.com/docs/editor/codebasics#_search-and-replace) | 参考実装   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                    | 内容                   |
| ------------------ | ----------------------------------------------------------------------- | ---------------------- |
| コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/component-specs.md`  | コンポーネント設計基準 |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/state-management.md` | 状態管理アーキテクチャ |

---

## 成果物

| 成果物               | パス                                      | 内容                      |
| -------------------- | ----------------------------------------- | ------------------------- |
| UI設計書             | `outputs/phase-2/ui-design.md`            | 検索パネルUI設計          |
| コンポーネント設計書 | `outputs/phase-2/component-design.md`     | Reactコンポーネント構成   |
| 検索エンジン設計書   | `outputs/phase-2/search-engine-design.md` | 検索アルゴリズム・API設計 |
| 状態管理設計書       | `outputs/phase-2/state-design.md`         | 検索状態・履歴管理設計    |

---

## 設計要件

### ファイル内検索UI設計（T-02-1）

```
┌─────────────────────────────────────────────────┐
│ 🔍 [検索入力フィールド        ] [Aa][.*][Ab] ↓↑│
│ ↕  [置換入力フィールド        ] [単一][全部]   │
│                                    3/10件      │
└─────────────────────────────────────────────────┘
```

**コンポーネント構成**:

- `SearchPanel`: 検索パネルコンテナ
- `SearchInput`: 検索入力フィールド
- `ReplaceInput`: 置換入力フィールド
- `SearchOptions`: 検索オプション（大文字小文字、正規表現、単語単位）
- `SearchNavigation`: 前/次ナビゲーション
- `ReplaceActions`: 置換アクション（単一、全部）
- `SearchStatus`: 検索結果ステータス

### ワークスペース検索UI設計（T-02-2）

```
┌──────────────────────────────────────────┐
│ 🔍 ワークスペース検索                     │
├──────────────────────────────────────────┤
│ [検索入力フィールド      ] [Aa][.*][Ab]  │
│ [置換入力フィールド      ] [置換] [全部] │
│ [ファイルパターン        ]               │
│ [除外パターン            ]               │
├──────────────────────────────────────────┤
│ 📁 src/components/Editor.tsx (5件)       │
│   │ 23: const search = ...               │
│   │ 45: function searchText(...) {       │
│   └ 67: return searchResult;             │
│ 📁 src/hooks/useSearch.ts (3件)          │
│   │ 12: export function useSearch() {    │
│   └ 34: const [searchTerm, ...           │
└──────────────────────────────────────────┘
```

**コンポーネント構成**:

- `WorkspaceSearchPanel`: ワークスペース検索パネルコンテナ
- `WorkspaceSearchInput`: 検索入力フィールド
- `WorkspaceReplaceInput`: 置換入力フィールド
- `FilePatternInput`: ファイルパターン入力
- `ExcludePatternInput`: 除外パターン入力
- `SearchResultsTree`: 検索結果ツリー
- `SearchResultItem`: 個別の検索結果アイテム
- `SearchResultContext`: コンテキスト表示（前後の行）

### 検索エンジン設計（T-02-3）

**アーキテクチャ**:

```
┌─────────────────────────────────────────────┐
│                SearchService                │
├─────────────────────────────────────────────┤
│ - searchInFile(text, pattern, options)      │
│ - searchInWorkspace(pattern, options)       │
│ - replaceInFile(text, pattern, replacement) │
│ - replaceInWorkspace(pattern, replacement)  │
└─────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐ ┌────────────┐ ┌───────────┐
│FileSearch │ │ WSSearch   │ │ Replace   │
│  Engine   │ │  Engine    │ │  Engine   │
└───────────┘ └────────────┘ └───────────┘
```

**インターフェース**:

```typescript
interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

interface SearchMatch {
  line: number;
  column: number;
  length: number;
  text: string;
  context: {
    before: string;
    after: string;
  };
}

interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}

interface SearchService {
  searchInFile(
    content: string,
    pattern: string,
    options: SearchOptions,
  ): SearchMatch[];

  searchInWorkspace(
    pattern: string,
    options: SearchOptions & {
      include?: string[];
      exclude?: string[];
    },
  ): AsyncGenerator<FileSearchResult>;

  replaceInFile(
    content: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
  ): { content: string; count: number };

  replaceInWorkspace(
    pattern: string,
    replacement: string,
    options: SearchOptions & {
      include?: string[];
      exclude?: string[];
      preview?: boolean;
    },
  ): AsyncGenerator<{ file: string; changes: number }>;
}
```

---

## 完了条件

- [ ] ファイル内検索UIコンポーネント設計が完了している
- [ ] ワークスペース検索UIコンポーネント設計が完了している
- [ ] 検索エンジンのインターフェースが定義されている
- [ ] 状態管理設計が完了している
- [ ] アクセシビリティ要件が考慮されている
- [ ] キーボードショートカットが設計されている
- [ ] コンポーネント間の依存関係が明確である

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- electron-ui-patterns: {{result}}
- accessibility-wcag: {{result}}
- custom-hooks-patterns: {{result}}
- state-lifting: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/search-replace-functionality/phase-3-design-review.md`

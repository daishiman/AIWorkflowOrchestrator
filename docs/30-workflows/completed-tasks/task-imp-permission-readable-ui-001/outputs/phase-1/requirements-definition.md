# 要件定義書: PermissionDialog 人間可読UI改善

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| フェーズ     | Phase 1: 要件定義                   |

---

## 1. 対象ツール一覧

### 1.1 分析結果

現行の `PermissionDialog.tsx` の `formatArgs()` 関数は以下のロジックで引数を表示している：

1. `args.command` が存在し文字列の場合 → コマンド文字列を直接表示
2. `args.path` が存在し文字列の場合 → パス文字列を直接表示
3. それ以外 → `JSON.stringify(args, null, 2)` で表示

### 1.2 対応ツール一覧（12種類）

| #   | ツール名     | 主要引数                                | 説明テンプレート                            |
| --- | ------------ | --------------------------------------- | ------------------------------------------- |
| 1   | Bash         | `command`, `description`                | 「{command}」コマンドを実行します           |
| 2   | Read         | `file_path`                             | 「{file_path}」ファイルを読み取ります       |
| 3   | Write        | `file_path`, `content`                  | 「{file_path}」ファイルに書き込みます       |
| 4   | Edit         | `file_path`, `old_string`, `new_string` | 「{file_path}」ファイルを編集します         |
| 5   | Glob         | `pattern`, `path`                       | 「{pattern}」パターンでファイルを検索します |
| 6   | Grep         | `pattern`, `path`                       | 「{pattern}」を含むファイルを検索します     |
| 7   | WebSearch    | `query`                                 | 「{query}」で検索します                     |
| 8   | Task         | `prompt`, `description`                 | タスクを実行します：{description}           |
| 9   | NotebookEdit | `notebook_path`, `new_source`           | ノートブックを編集します：{notebook_path}   |
| 10  | WebFetch     | `url`                                   | 「{url}」からデータを取得します             |
| 11  | Skill        | `skill`, `args`                         | 「{skill}」スキルを実行します               |
| 12  | AskUser      | `question`                              | ユーザーに確認します                        |

### 1.3 デフォルトテンプレート

未定義ツール向け: `「{toolName}」ツールの操作を実行します`

---

## 2. 説明テンプレート要件

### 2.1 テンプレート仕様

各テンプレートは以下の形式に従う：

- プレースホルダー: `{引数名}` 形式
- 引数が存在しない場合は汎用的なフォールバック文を使用
- 長い文字列は100文字で切り詰め（末尾に `...` 付加）

### 2.2 プレースホルダー型定義

| プレースホルダー  | 型     | 対象ツール        | 説明               |
| ----------------- | ------ | ----------------- | ------------------ |
| `{command}`       | string | Bash              | 実行コマンド文字列 |
| `{file_path}`     | string | Read, Write, Edit | ファイルパス       |
| `{pattern}`       | string | Glob, Grep        | 検索パターン       |
| `{query}`         | string | WebSearch         | 検索クエリ         |
| `{prompt}`        | string | Task              | タスク指示         |
| `{description}`   | string | Task, Bash        | 操作の説明         |
| `{notebook_path}` | string | NotebookEdit      | ノートブックパス   |
| `{url}`           | string | WebFetch          | URL                |
| `{skill}`         | string | Skill             | スキル名           |
| `{question}`      | string | AskUser           | 質問内容           |
| `{toolName}`      | string | デフォルト        | ツール名           |

### 2.3 フォールバック要件

| ケース               | 動作                                   |
| -------------------- | -------------------------------------- |
| ツール未定義         | デフォルトテンプレートを使用           |
| 必要な引数が欠損     | 汎用フォールバック文を使用             |
| 引数がnull/undefined | デフォルトテンプレートを使用           |
| 例外発生時           | デフォルトテンプレートにフォールバック |
| 引数値が非string型   | String()で変換して表示                 |

---

## 3. UI要件

### 3.1 説明文表示領域

- **配置**: ツール名表示（`<span>` タグ）の直下、引数表示（`<pre>` タグ）の上
- **スタイル**: `text-sm text-gray-600 mt-1` （既存ダイアログのテキストスタイルに準拠）
- **内容**: `getDescription(toolName, args)` の戻り値

### 3.2 詳細展開/折りたたみUI

- **デフォルト状態**: 折りたたみ（技術的詳細は非表示）
- **展開トリガー**: 「詳細を表示 ▼」ボタン
- **折りたたみトリガー**: 「詳細を隠す ▲」ボタン
- **展開コンテンツ**: 既存の `formatArgs()` 出力（`<pre>` タグ内）
- **状態管理**: `useState<boolean>(false)` でローカル管理

### 3.3 キーボード操作要件

| 操作      | 動作                      |
| --------- | ------------------------- |
| Enter     | 折りたたみ展開/折りたたみ |
| Space     | 折りたたみ展開/折りたたみ |
| Tab       | 次のフォーカス要素へ移動  |
| Shift+Tab | 前のフォーカス要素へ移動  |
| Escape    | ダイアログ閉じる（既存）  |

### 3.4 アクセシビリティ要件

| ARIA属性        | 要素           | 値               |
| --------------- | -------------- | ---------------- |
| `aria-expanded` | 詳細展開ボタン | `true` / `false` |
| `aria-controls` | 詳細展開ボタン | 詳細表示領域のID |
| `role`          | 詳細表示領域   | `region`         |

---

## 4. 品質要件

### 4.1 テストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 4.2 品質チェック項目

| チェック項目          | 基準                          |
| --------------------- | ----------------------------- |
| TypeScriptエラー      | 0件                           |
| ESLintエラー          | 0件                           |
| 既存テスト互換性      | 全458行のテストがPASS         |
| XSS防止               | dangerouslySetInnerHTML不使用 |
| Reactの自動エスケープ | JSX式展開のみ使用             |

### 4.3 既存テストとの整合性方針

- 既存の `PermissionDialog.test.tsx` (458行) は変更しない
- 新規テストファイルを追加: `permissionDescriptions.test.ts`, `PermissionDialog.readable.test.tsx`
- 既存テストが全てPASSし続けることを各フェーズで確認

---

## 5. セキュリティ要件

### 5.1 XSS防止

- ReactのJSX式展開（`{value}`）による自動HTMLエスケープに依存
- `dangerouslySetInnerHTML` は使用禁止
- テンプレート内のプレースホルダー置換はプレーンテキストとして処理
- HTMLタグを含む引数値はエスケープされた状態で表示

### 5.2 入力検証

- ツール引数は外部由来データとして扱う
- 文字列の長さ制限（表示用の切り詰め: 100文字）
- null/undefined/非文字列型への安全なフォールバック

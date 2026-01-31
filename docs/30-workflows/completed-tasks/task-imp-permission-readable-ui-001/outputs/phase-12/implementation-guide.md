# 実装ガイド: PermissionDialog 人間可読UI改善

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| タスクID | task-imp-permission-readable-ui-001 |
| 作成日   | 2026-01-30                          |
| フェーズ | Phase 12: ドキュメント更新          |

---

# Part 1: やさしい説明（中学生レベル）

## この機能は何をするの？

アプリがあなたのパソコンで何かしようとする時、「何をしますか？」と聞いてくるダイアログ（確認画面）があります。

これまでは、パソコンの専門用語でしか説明していなかったので、初めて使う人には分かりにくかったのです。

たとえば、レストランのメニューが全部料理の専門用語（「ポシェ」「ブレゼ」「フランベ」など）で書かれていたら、どんな料理か想像できないですよね？日本語で「茹でた魚」「蒸し煮のお肉」「お酒で炎を上げて仕上げたデザート」と書いてあれば、どんな料理か分かります。

今回の改善は、まさにこの「メニューの日本語化」と同じことをしたのです。

## 具体的にどうなったの？

### 改善前（わかりにくい）

```
ツール: Bash
ls -la /home/user/documents
```

→ これだけ見ても「何をするの？」とわかりにくい

### 改善後（わかりやすい）

```
ツール: Bash
「ls -la /home/user/documents」コマンドを実行します

[詳細を隠す ▲]
ls -la /home/user/documents
```

→ 「コマンドを実行するんだな」とすぐわかる！

## どんなツールに対応しているの？

| ツール名（英語） | 日本語での説明例                     |
| ---------------- | ------------------------------------ |
| Bash             | 「○○」コマンドを実行します           |
| Read             | 「○○」ファイルを読み取ります         |
| Write            | 「○○」ファイルに書き込みます         |
| Edit             | 「○○」ファイルを編集します           |
| Glob             | 「○○」パターンでファイルを検索します |
| Grep             | 「○○」を含むファイルを検索します     |
| WebSearch        | 「○○」で検索します                   |
| Task             | タスクを実行します                   |
| NotebookEdit     | ノートブックを編集します             |
| WebFetch         | 「○○」からデータを取得します         |
| Skill            | 「○○」スキルを実行します             |
| AskUser          | ユーザーに確認します                 |

知らないツールが来ても、「○○ツールの操作を実行します」という標準的な説明が表示されるので安心です。

## 「詳細を表示」ボタンって何？

確認画面には「詳細を隠す ▲」というボタンがあります。これを押すと、プログラマ向けの細かい情報を隠すことができます。もう一度押すと、また表示されます。

専門的な情報が必要な時だけ見られるようになっていて、普段は日本語の説明だけ見ればOKです。

---

# Part 2: 技術者向け詳細

## 1. モジュール概要

### ファイル構成

```
apps/desktop/src/renderer/components/skill/
├── permissionDescriptions.ts         ← 新規（説明テンプレートモジュール）
├── PermissionDialog.tsx              ← 修正（UI統合）
└── __tests__/
    ├── permissionDescriptions.test.ts ← 新規（34テスト）
    └── PermissionDialog.readable.test.tsx ← 新規（19テスト）
```

## 2. API仕様

### getDescription

```typescript
/**
 * ツール名と引数から人間可読な説明文を取得する
 *
 * @param toolName - ツール名（例: "Bash", "Read"）
 * @param args - ツール引数（例: { command: "ls -la" }）
 * @returns 人間可読な説明文（例: "「ls -la」コマンドを実行します"）
 */
export function getDescription(
  toolName: string,
  args: Record<string, unknown>,
): string;
```

### 使用例

```typescript
import { getDescription } from "./permissionDescriptions";

// 正常系
getDescription("Bash", { command: "ls -la" });
// → "「ls -la」コマンドを実行します"

getDescription("Read", { file_path: "/tmp/file.txt" });
// → "「/tmp/file.txt」ファイルを読み取ります"

// フォールバック
getDescription("UnknownTool", { foo: "bar" });
// → "「UnknownTool」ツールの操作を実行します"

getDescription("Bash", {});
// → "コマンドを実行します"
```

## 3. 型定義

```typescript
/** ツール別説明文生成関数 */
type ToolDescriptionGenerator = (args: Record<string, unknown>) => string;

/** ツール名→生成関数マッピング（内部） */
const toolDescriptionGenerators: Record<string, ToolDescriptionGenerator>;
```

## 4. ツール別テンプレート一覧

| ツール名     | 主要引数キー    | テンプレート                                  | フォールバック                   |
| ------------ | --------------- | --------------------------------------------- | -------------------------------- |
| Bash         | `command`       | `「{command}」コマンドを実行します`           | `コマンドを実行します`           |
| Read         | `file_path`     | `「{file_path}」ファイルを読み取ります`       | `ファイルを読み取ります`         |
| Write        | `file_path`     | `「{file_path}」ファイルに書き込みます`       | `ファイルに書き込みます`         |
| Edit         | `file_path`     | `「{file_path}」ファイルを編集します`         | `ファイルを編集します`           |
| Glob         | `pattern`       | `「{pattern}」パターンでファイルを検索します` | `パターンでファイルを検索します` |
| Grep         | `pattern`       | `「{pattern}」を含むファイルを検索します`     | `ファイル内を検索します`         |
| WebSearch    | `query`         | `「{query}」で検索します`                     | `Webを検索します`                |
| Task         | `description`   | `タスクを実行します：{description}`           | `タスクを実行します`             |
| NotebookEdit | `notebook_path` | `ノートブックを編集します：{notebook_path}`   | `ノートブックを編集します`       |
| WebFetch     | `url`           | `「{url}」からデータを取得します`             | `URLからデータを取得します`      |
| Skill        | `skill`         | `「{skill}」スキルを実行します`               | `スキルを実行します`             |
| AskUser      | -               | `ユーザーに確認します`                        | `ユーザーに確認します`           |

## 5. エラーハンドリング・フォールバック

### フォールバックフロー

```
getDescription(toolName, args)
  ├── try
  │   ├── toolName in generators → generator(args)
  │   │   ├── 引数存在 → テンプレート適用
  │   │   └── 引数欠損 → ツール固有フォールバック
  │   └── toolName not in generators → defaultDescription(toolName)
  └── catch → defaultDescription(toolName)
```

### safeString ヘルパー

- `null` / `undefined` → 空文字列
- 非string型 → `String()` 変換
- 100文字超 → 切り詰め（`...` 付加）

## 6. ARIA属性・アクセシビリティ

| 属性            | 要素           | 値                  |
| --------------- | -------------- | ------------------- |
| `aria-expanded` | 詳細展開ボタン | `true` / `false`    |
| `aria-controls` | 詳細展開ボタン | `{uniqueId}-detail` |
| `role="region"` | 詳細表示領域   | `region`            |

## 7. セキュリティ

- React JSXの自動エスケープにより、ツール引数に含まれるHTMLタグは安全にエスケープされる
- `dangerouslySetInnerHTML` は一切使用していない
- XSSペイロード（`<script>`, `onerror=`, `javascript:`）を含む引数もプレーンテキストとして表示される

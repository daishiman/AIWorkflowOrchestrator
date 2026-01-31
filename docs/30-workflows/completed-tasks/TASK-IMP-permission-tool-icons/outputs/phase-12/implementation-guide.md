# 実装ガイド: PermissionDialog ツール別アイコン表示

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスクID   | task-imp-permission-tool-icons-001    |
| タスク名   | PermissionDialog ツール別アイコン表示 |
| 作成日     | 2026-01-30                            |
| Phase      | 12                                    |
| ステータス | 完了                                  |

---

## Part 1: ツールアイコンって何？（やさしい説明）

### なぜアイコンが必要なの？

想像してみてください。あなたが図書館にいて、本を探しています。棚にはたくさんの本がありますが、全部白いカバーで名前だけ書いてあります。探すのが大変ですよね？

でも、もし本のカバーに絵が描いてあったら？

- 料理の本には鍋のマーク
- 科学の本には試験管のマーク
- 漫画にはフキダシのマーク

これなら一目で分かりますよね！

PermissionDialog（パーミッション・ダイアログ）のツールアイコンも同じ考え方です。パソコンがユーザーに「このツールを使っていいですか？」と聞くとき、ツールの名前だけでなく、絵（アイコン）も一緒に見せることで、「あ、これはファイルを読むツールだな」とすぐに分かるようにしています。

### 何をしたの？

10個のツールそれぞれに絵文字（えもじ）をつけました。

- ターミナル（コマンド入力するところ）→ 💻
- ファイルを読む → 📖
- ファイルに書く → ✏️
- ファイルを編集する → 📝
- ファイルを探す → 🔍 と 🔎
- フォルダを見る → 📁
- タスクを実行する → 📋
- インターネットで検索する → 🌐

知らないツールが来ても「🔧」マーク（レンチ、工具のマーク）が出るので安心です。

### ポイント

- 目が不自由な方が使うスクリーンリーダー（画面を読み上げるソフト）では、アイコンは読み上げられません。名前だけ読み上げられるので、邪魔になりません。
- アイコンは飾りとして扱われるため、操作には影響しません。

---

## Part 2: 技術的詳細

### 型定義

```typescript
const TOOL_ICONS: Record<string, string>; // 10ツール分のEmojiマッピング
const DEFAULT_TOOL_ICON: string; // デフォルトアイコン '🔧'
function getToolIcon(toolName: string): string; // アイコン取得ヘルパー
```

### 定数一覧

| 定数名            | 型                     | 値               |
| ----------------- | ---------------------- | ---------------- |
| TOOL_ICONS        | Record<string, string> | {Bash:'💻', ...} |
| DEFAULT_TOOL_ICON | string                 | '🔧'             |

### ツールアイコンマッピング

| ツール名  | アイコン | キー          |
| --------- | -------- | ------------- |
| Bash      | 💻       | `"Bash"`      |
| Read      | 📖       | `"Read"`      |
| Write     | ✏️       | `"Write"`     |
| Edit      | 📝       | `"Edit"`      |
| Glob      | 🔍       | `"Glob"`      |
| Grep      | 🔎       | `"Grep"`      |
| LS        | 📁       | `"LS"`        |
| Task      | 📋       | `"Task"`      |
| WebSearch | 🌐       | `"WebSearch"` |
| WebFetch  | 🌐       | `"WebFetch"`  |

### getToolIcon関数

```typescript
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] ?? DEFAULT_TOOL_ICON;
}
```

- **入力**: ツール名（string）
- **出力**: 対応するEmojiアイコン（string）
- **フォールバック**: 未定義ツール名には `DEFAULT_TOOL_ICON`（🔧）を返す
- **注意**: ケースセンシティブ（`"Bash"` のみ対応、`"bash"` はデフォルト）

### エッジケース

| ケース           | 入力                    | 出力 |
| ---------------- | ----------------------- | ---- |
| 定義済みツール   | `"Bash"`                | 💻   |
| 未定義ツール     | `"UnknownTool"`         | 🔧   |
| 空文字列         | `""`                    | 🔧   |
| 大文字小文字違い | `"bash"`                | 🔧   |
| 長い名前         | `"VeryLongToolName..."` | 🔧   |

### アクセシビリティ

- アイコンは装飾的要素として `aria-hidden="true"` を付与
- スクリーンリーダーはツール名テキストのみを読み上げる
- Tabキーでフォーカスが止まらない（span要素、tabindex設定なし）

### JSXテンプレート

```tsx
<span className="px-2 py-0.5 bg-gray-200 rounded text-sm font-mono font-medium inline-flex items-center gap-1">
  <span aria-hidden="true">{getToolIcon(pendingPermission.toolName)}</span>
  {pendingPermission.toolName}
</span>
```

### 変更ファイル

| ファイル                  | 変更内容                                                |
| ------------------------- | ------------------------------------------------------- |
| PermissionDialog.tsx      | TOOL_ICONS, DEFAULT_TOOL_ICON, getToolIcon追加、JSX修正 |
| PermissionDialog.test.tsx | 17テストケース追加                                      |

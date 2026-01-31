# 設計書: PermissionDialog ツール別アイコン表示

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスクID   | task-imp-permission-tool-icons-001    |
| タスク名   | PermissionDialog ツール別アイコン表示 |
| 作成日     | 2026-01-30                            |
| Phase      | 2                                     |
| ステータス | 完了                                  |

## 設計概要

PermissionDialog.tsx にEmojiアイコン表示機能を追加する。変更はRenderer Process層のみ。

## 1. toolIconsマッピング定数の設計

**配置場所**: `PermissionDialog.tsx` のコンポーネント定義の外（モジュールスコープ）

```typescript
const TOOL_ICONS: Record<string, string> = {
  Bash: "💻",
  Read: "📖",
  Write: "✏️",
  Edit: "📝",
  Glob: "🔍",
  Grep: "🔎",
  LS: "📁",
  Task: "📋",
  WebSearch: "🌐",
  WebFetch: "🌐",
} as const;

const DEFAULT_TOOL_ICON = "🔧";
```

**設計決定**:

- 定数名: `TOOL_ICONS`（UPPER_SNAKE_CASE）
- `as const` で型を厳密化
- デフォルトアイコン: 別定数 `DEFAULT_TOOL_ICON` として分離

## 2. ヘルパー関数の設計

```typescript
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] ?? DEFAULT_TOOL_ICON;
}
```

**設計決定**:

- コンポーネント外のpure functionとして定義（テスタビリティ向上）
- nullish coalescing（`??`）を使用
- export不要（PermissionDialog.tsx内でのみ使用）

## 3. コンポーネント変更箇所

**変更対象**: ツールバッジ表示部分（PermissionDialog.tsx:155行付近）

**変更前**:

```tsx
<span className="px-2 py-0.5 bg-gray-200 rounded text-sm font-mono font-medium">
  {pendingPermission.toolName}
</span>
```

**変更後**:

```tsx
<span className="px-2 py-0.5 bg-gray-200 rounded text-sm font-mono font-medium inline-flex items-center gap-1">
  <span aria-hidden="true">{getToolIcon(pendingPermission.toolName)}</span>
  {pendingPermission.toolName}
</span>
```

**追加CSSクラス**:

- `inline-flex`: インライン配置を維持しつつFlexboxで内部配置
- `items-center`: アイコンとテキストの縦中央揃え
- `gap-1`（4px）: アイコンとテキスト間のスペース（8pxグリッド準拠）

## 4. テスト設計

| TC-ID  | テスト名                                  | 検証内容                             |
| ------ | ----------------------------------------- | ------------------------------------ |
| TC-101 | 定義済みツール（Bash）のアイコン表示      | 💻がDOM内に存在すること              |
| TC-102 | 定義済みツール（Read）のアイコン表示      | 📖がDOM内に存在すること              |
| TC-103 | 定義済みツール（Write）のアイコン表示     | ✏️がDOM内に存在すること              |
| TC-104 | 未定義ツールのデフォルトアイコン表示      | 🔧がDOM内に存在すること              |
| TC-105 | アイコンにaria-hidden属性が付与されている | `aria-hidden="true"` の存在を検証    |
| TC-106 | アイコンがツール名の左側に配置されている  | DOM順序でアイコン→ツール名であること |
| TC-107 | 全10ツールのマッピングが存在する          | TOOL_ICONS定数に10エントリが存在     |

## 5. アーキテクチャ層別影響

| 層                         | 影響 | 内容                                  |
| -------------------------- | ---- | ------------------------------------- |
| フロントエンド（Renderer） | あり | TSXテンプレート変更、Tailwind CSS追加 |
| バックエンド（Main）       | なし | 変更なし                              |
| IPC通信                    | なし | 変更なし                              |
| Preload                    | なし | 変更なし                              |
| ローカルストレージ         | なし | 変更なし                              |

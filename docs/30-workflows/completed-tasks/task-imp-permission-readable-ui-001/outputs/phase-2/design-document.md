# 設計書: PermissionDialog 人間可読UI改善

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| フェーズ     | Phase 2: 設計                       |

---

## 1. permissionDescriptions モジュール設計

### 1.1 インターフェース・型定義

```typescript
/**
 * ツール別説明文を生成する関数型
 * argsからツール固有の説明文を返す
 */
type ToolDescriptionGenerator = (args: Record<string, unknown>) => string;

/**
 * ツール名→説明生成関数のマッピング
 */
const toolDescriptionGenerators: Record<string, ToolDescriptionGenerator>;

/**
 * デフォルト説明生成関数
 * 未定義ツール用のフォールバック
 */
function defaultDescription(
  toolName: string,
  args: Record<string, unknown>,
): string;

/**
 * 公開API: ツール名と引数から人間可読な説明文を取得する
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

### 1.2 ツール別説明テンプレート設計（12種類）

| ツール名     | テンプレート                                  | 主要引数キー    | フォールバック                   |
| ------------ | --------------------------------------------- | --------------- | -------------------------------- |
| Bash         | `「{command}」コマンドを実行します`           | `command`       | `コマンドを実行します`           |
| Read         | `「{file_path}」ファイルを読み取ります`       | `file_path`     | `ファイルを読み取ります`         |
| Write        | `「{file_path}」ファイルに書き込みます`       | `file_path`     | `ファイルに書き込みます`         |
| Edit         | `「{file_path}」ファイルを編集します`         | `file_path`     | `ファイルを編集します`           |
| Glob         | `「{pattern}」パターンでファイルを検索します` | `pattern`       | `パターンでファイルを検索します` |
| Grep         | `「{pattern}」を含むファイルを検索します`     | `pattern`       | `ファイル内を検索します`         |
| WebSearch    | `「{query}」で検索します`                     | `query`         | `Webを検索します`                |
| Task         | `タスクを実行します：{description}`           | `description`   | `タスクを実行します`             |
| NotebookEdit | `ノートブックを編集します：{notebook_path}`   | `notebook_path` | `ノートブックを編集します`       |
| WebFetch     | `「{url}」からデータを取得します`             | `url`           | `URLからデータを取得します`      |
| Skill        | `「{skill}」スキルを実行します`               | `skill`         | `スキルを実行します`             |
| AskUser      | `ユーザーに確認します`                        | `question`      | `ユーザーに確認します`           |

### 1.3 引数サニタイズ方針

- **Reactの自動エスケープに依存**: JSX `{value}` 式展開はHTMLを自動エスケープする
- **dangerouslySetInnerHTMLは不使用**: 一切使用しない
- **文字列長の制限**: 100文字を超える引数値は `value.slice(0, 100) + '...'` で切り詰め
- **型安全**: 引数値がstring型でない場合は `String(value)` で変換

### 1.4 文字列安全化ヘルパー

```typescript
/**
 * 引数値を安全な文字列に変換する
 * - null/undefined → 空文字列
 * - 非string型 → String()変換
 * - 100文字超 → 切り詰め
 */
function safeString(value: unknown, maxLength?: number): string;
```

---

## 2. PermissionDialog UI変更設計

### 2.1 レイアウト設計

既存UIの構造に沿って、以下の位置に新要素を追加する：

```
PermissionDialog
├── ヘッダー（権限の確認）         ← 変更なし
├── コンテンツ
│   ├── 説明テキスト                ← 変更なし
│   ├── ツール情報ボックス
│   │   ├── ツール名表示            ← 変更なし
│   │   ├── ★ 人間可読説明文       ← 新規追加
│   │   ├── ★ 詳細展開ボタン       ← 新規追加
│   │   └── ★ 技術的詳細（折り畳み）← 既存のformatArgs出力を移動
│   ├── 理由表示                    ← 変更なし
│   └── チェックボックス            ← 変更なし
└── フッター（ボタン群）            ← 変更なし
```

### 2.2 コンポーネント変更設計

#### 新規追加JSX

```tsx
{
  /* 人間可読説明文 */
}
<p className="text-sm text-gray-600 mt-2">
  {getDescription(pendingPermission.toolName, pendingPermission.args)}
</p>;

{
  /* 詳細展開ボタン */
}
<button
  type="button"
  className="text-xs text-gray-400 hover:text-gray-600 mt-2 flex items-center gap-1"
  onClick={() => setIsDetailExpanded(!isDetailExpanded)}
  aria-expanded={isDetailExpanded}
  aria-controls={`${uniqueId}-detail`}
>
  {isDetailExpanded ? "詳細を隠す ▲" : "詳細を表示 ▼"}
</button>;

{
  /* 技術的詳細（折りたたみ） */
}
{
  isDetailExpanded && (
    <div id={`${uniqueId}-detail`} role="region" className="mt-2">
      <pre className="p-2 bg-gray-100 rounded text-xs overflow-x-auto">
        {formatArgs(pendingPermission.args)}
      </pre>
    </div>
  );
}
```

### 2.3 状態管理設計

```typescript
// 折りたたみ状態（ローカルstate）
const [isDetailExpanded, setIsDetailExpanded] = useState(false);
```

- Zustand Storeは使用しない（ローカルUI状態のためuseStateで十分）
- ダイアログ非表示→再表示時にReactのアンマウント/マウントで自動リセット

### 2.4 ARIA属性設計

| 属性            | 要素           | 値                   | 説明           |
| --------------- | -------------- | -------------------- | -------------- |
| `aria-expanded` | 詳細展開ボタン | `true` / `false`     | 展開状態を通知 |
| `aria-controls` | 詳細展開ボタン | `${uniqueId}-detail` | 制御対象のID   |
| `role="region"` | 詳細表示領域   | `region`             | ランドマーク   |

---

## 3. データフロー設計

### 3.1 データフロー図

```
pendingPermission (Store)
   │
   ├── toolName: string
   ├── args: Record<string, unknown>
   │
   ├──→ getDescription(toolName, args)
   │       │
   │       ├── toolDescriptionGenerators[toolName] 存在?
   │       │   ├── Yes → generators[toolName](args) → 説明文
   │       │   └── No  → defaultDescription(toolName, args) → 説明文
   │       │
   │       └── (try-catch) → 例外時は defaultDescription にフォールバック
   │
   └──→ formatArgs(args) → 技術的詳細（折りたたみ内で使用）
```

### 3.2 エラーハンドリングフロー

```
getDescription(toolName, args)
   │
   ├── try
   │   ├── toolName が generators に存在 → generator(args) 呼出
   │   │   ├── 引数キー存在 → テンプレート適用 → 説明文
   │   │   └── 引数キー欠損 → フォールバック文
   │   └── toolName が generators に不在 → defaultDescription(toolName, args)
   │
   └── catch
       └── defaultDescription(toolName, args)
```

---

## 4. テスト戦略設計

### 4.1 テストファイル構成

| ファイル                             | 種別                   | テスト対象                   |
| ------------------------------------ | ---------------------- | ---------------------------- |
| `permissionDescriptions.test.ts`     | ユニットテスト         | getDescription関数単体       |
| `PermissionDialog.readable.test.tsx` | コンポーネントテスト   | 人間可読UI表示・折りたたみUI |
| `PermissionDialog.test.tsx`          | 既存テスト（変更なし） | 既存機能の回帰テスト         |

### 4.2 テストケースカテゴリ

#### permissionDescriptions.test.ts

| カテゴリ     | テストケース数 | 内容                                    |
| ------------ | -------------- | --------------------------------------- |
| 正常系       | 12+            | 各ツール別説明文生成                    |
| 異常系       | 5+             | 未定義ツール、空引数、null/undefined    |
| 境界値       | 5+             | 長い文字列、特殊文字、Unicode、HTMLタグ |
| セキュリティ | 3+             | XSSペイロード、javascript:プロトコル    |

#### PermissionDialog.readable.test.tsx

| カテゴリ         | テストケース数 | 内容                       |
| ---------------- | -------------- | -------------------------- |
| 説明文表示       | 5+             | 各ツールの説明が表示される |
| 詳細展開UI       | 4+             | 折りたたみ動作、展開状態   |
| アクセシビリティ | 4+             | ARIA属性、キーボード操作   |

---

## 5. ファイル配置

```
apps/desktop/src/renderer/components/skill/
├── PermissionDialog.tsx              ← 既存（修正）
├── permissionDescriptions.ts         ← 新規作成
└── __tests__/
    ├── PermissionDialog.test.tsx      ← 既存（変更なし）
    ├── permissionDescriptions.test.ts ← 新規作成
    └── PermissionDialog.readable.test.tsx ← 新規作成
```

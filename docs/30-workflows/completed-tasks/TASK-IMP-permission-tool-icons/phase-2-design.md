# Phase 2: 設計

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 2                              |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

toolIconsマッピングの定数設計、アイコン表示のコンポーネント変更設計、テスト設計を行い、実装方針を確定する。

## 実行タスク

- Task 1: toolIconsマッピング定数の型設計
- Task 2: コンポーネント変更箇所の詳細設計
- Task 3: テスト設計（追加テストケース定義）

## 参照資料

| 資料名           | パス                                                                             | 説明             |
| ---------------- | -------------------------------------------------------------------------------- | ---------------- |
| Phase 1成果物    | `outputs/phase-1/requirements-definition.md`                                     | 要件定義         |
| Phase 1受入基準  | `outputs/phase-1/acceptance-criteria.md`                                         | 受入基準         |
| 現在の実装       | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                | 修正対象ファイル |
| 現在のテスト     | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | テストファイル   |
| デザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`       | デザイントークン |
| デザイン原則     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`   | Apple HIG        |

## 実行手順

### ステップ1: toolIconsマッピング定数の設計

**配置場所**: `PermissionDialog.tsx` のコンポーネント定義の外（モジュールスコープ）

```typescript
/**
 * ツール名からEmojiアイコンへのマッピング
 * 元タスク仕様書（TASK-7C）で定義されたtoolIcons
 */
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

/** デフォルトアイコン（未定義ツール用） */
const DEFAULT_TOOL_ICON = "🔧";
```

**設計決定**:

- 定数名は `TOOL_ICONS`（UPPER_SNAKE_CASE、定数規約に従う）
- `as const`で型を厳密化
- デフォルトアイコンは別定数 `DEFAULT_TOOL_ICON` として分離

### ステップ2: ヘルパー関数の設計

```typescript
/**
 * ツール名に対応するアイコンを返す
 * 未定義ツールの場合はデフォルトアイコン（🔧）を返す
 */
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] ?? DEFAULT_TOOL_ICON;
}
```

**設計決定**:

- コンポーネント外のpure functionとして定義（テスタビリティ向上）
- nullish coalescing（`??`）を使用（`||`ではなく、空文字列を許容しない）
- export不要（PermissionDialog.tsx内でのみ使用）

### ステップ3: コンポーネント変更箇所の詳細設計

**変更対象**: ツールバッジ表示部分（現在のPermissionDialog.tsx:152-160付近）

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

**設計決定**:

- バッジのspanに `inline-flex items-center gap-1` を追加
  - `inline-flex`: インライン配置を維持しつつFlexboxで内部配置
  - `items-center`: アイコンとテキストの縦中央揃え
  - `gap-1`（4px）: アイコンとテキスト間の適切なスペース
- アイコンのspanに `aria-hidden="true"` を付与（スクリーンリーダー非読み上げ）
- 既存のTailwind CSSクラスはすべて維持

### ステップ4: テスト設計

既存テスト（9 describeブロック、43+テストケース）に以下を追加する。

**追加テストグループ**: `ツールアイコン表示`

| TC-ID  | テスト名                                  | 検証内容                                 |
| ------ | ----------------------------------------- | ---------------------------------------- |
| TC-101 | 定義済みツール（Bash）のアイコン表示      | 💻がDOM内に存在すること                  |
| TC-102 | 定義済みツール（Read）のアイコン表示      | 📖がDOM内に存在すること                  |
| TC-103 | 定義済みツール（Write）のアイコン表示     | ✏️がDOM内に存在すること                  |
| TC-104 | 未定義ツールのデフォルトアイコン表示      | 🔧がDOM内に存在すること                  |
| TC-105 | アイコンにaria-hidden属性が付与されている | `aria-hidden="true"`の存在を検証         |
| TC-106 | アイコンがツール名の左側に配置されている  | DOM順序でアイコン→ツール名であること     |
| TC-107 | 全10ツールのマッピングが存在する          | TOOL_ICONS定数に10エントリが存在すること |

**テスト実装方針**:

- 既存の`mockPendingPermission`パターンを使用
- `screen.getByText`でアイコン文字列の存在を検証
- `aria-hidden`は`querySelector('[aria-hidden="true"]')`で検証

## 統合テスト連携

| テストカテゴリ   | 影響 | 対応                                     |
| ---------------- | ---- | ---------------------------------------- |
| UIレンダリング   | あり | アイコン表示のレンダリングテスト追加     |
| スナップショット | 注意 | スナップショットテストがあれば更新が必要 |
| a11y             | あり | aria-hidden属性の検証追加                |

## 多角的チェック観点

| 観点               | 該当 | 確認内容                                                  |
| ------------------ | ---- | --------------------------------------------------------- |
| UI/UX（Apple HIG） | ✅   | gap-1(4px)はデザインシステムの最小調整単位に適合          |
| アクセシビリティ   | ✅   | aria-hidden="true"で装飾アイコンを適切に処理              |
| エラーハンドリング | ✅   | DEFAULT_TOOL_ICONでnullish coalescingによるフォールバック |

## Electronデスクトップアプリ観点

| 層                             | 影響 | 確認内容                                      |
| ------------------------------ | ---- | --------------------------------------------- |
| **フロントエンド（Renderer）** | ✅   | TSXテンプレートの変更、Tailwind CSSクラス追加 |
| **バックエンド（Main）**       | -    | 変更なし                                      |
| **IPC通信**                    | -    | 変更なし                                      |
| **Preload**                    | -    | 変更なし                                      |
| **ローカルストレージ**         | -    | 変更なし                                      |

## 成果物

| 成果物 | パス                                     | 説明               |
| ------ | ---------------------------------------- | ------------------ |
| 設計書 | `outputs/phase-2/architecture-design.md` | 詳細設計・変更箇所 |

## 完了条件

- [ ] toolIcons定数の型・構造が設計されている
- [ ] getToolIconヘルパー関数が設計されている
- [ ] コンポーネント変更箇所のBefore/Afterが明示されている
- [ ] テストケース（TC-101〜TC-107）が設計されている
- [ ] アクセシビリティ対応方針が決定されている
- [ ] Tailwind CSSクラスの追加方針が決定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. toolIconsマッピング定数の型設計（Task 1）
3. コンポーネント変更箇所の詳細設計（Task 2）
4. テスト設計（Task 3）
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート

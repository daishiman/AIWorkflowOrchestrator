# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 5                              |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

TDDのGreenフェーズとして、Phase 4で作成した失敗テストをすべてPASSさせるための最小限の実装を行う。

## 実行タスク

- Task 1: TOOL_ICONS定数の実装 — 10ツール分のEmojiマッピング定義
- Task 2: getToolIconヘルパー関数の実装 — デフォルトアイコン付きルックアップ
- Task 3: JSXテンプレートの修正 — アイコン表示をバッジに追加
- Task 4: 全テストPASS確認 — 既存+新規テストがすべてPASS

## 参照資料

| 資料名           | パス                                                                         | 説明               |
| ---------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 2設計書    | `outputs/phase-2/architecture-design.md`                                     | 実装設計           |
| Phase 4テスト    | `outputs/phase-4/test-specification.md`                                      | テスト仕様         |
| 修正対象ファイル | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`            | 実装対象           |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Renderer層パターン |

## 実行手順

### ステップ1: TOOL_ICONS定数の追加

PermissionDialog.tsx のimport文の後、コンポーネント定義の前に以下を追加する。

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
};

/** デフォルトアイコン（未定義ツール用） */
const DEFAULT_TOOL_ICON = "🔧";
```

**配置場所**: 既存の `formatArgs` 関数の前（モジュールスコープ）

### ステップ2: getToolIconヘルパー関数の追加

TOOL_ICONS定数の直後に追加する。

```typescript
/**
 * ツール名に対応するアイコンを返す
 * 未定義ツールの場合はデフォルトアイコン（🔧）を返す
 */
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] ?? DEFAULT_TOOL_ICON;
}
```

### ステップ3: JSXテンプレートの修正

ツールバッジ表示部分を修正する。

**変更対象**: PermissionDialog.tsx内のツール名表示部分

**変更前（該当箇所を探す）**:

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

**変更内容**:

1. バッジのspanに `inline-flex items-center gap-1` を追加
2. アイコン表示用の `<span aria-hidden="true">` を追加
3. `getToolIcon()` でアイコン文字列を取得

### ステップ4: テスト実行（Green確認）

全テスト（既存+新規）がPASSすることを確認する。

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

**期待結果**: 全テストがPASS（Green）する。

### ステップ5: TypeScript型チェック

```bash
cd apps/desktop && npx tsc --noEmit
```

**期待結果**: エラー0件。

### ステップ6: ESLintチェック

```bash
cd apps/desktop && npx eslint src/renderer/components/skill/PermissionDialog.tsx
```

**期待結果**: エラー0件。

## 統合テスト連携

| テストカテゴリ | 影響 | 対応                                       |
| -------------- | ---- | ------------------------------------------ |
| UIレンダリング | あり | アイコン表示が正しくレンダリングされること |
| 型安全性       | あり | TypeScript型チェックPASS                   |
| Lint品質       | あり | ESLintチェックPASS                         |

## 多角的チェック観点

| 観点               | 該当 | 確認内容                                      |
| ------------------ | ---- | --------------------------------------------- |
| UI/UX（Apple HIG） | ✅   | gap-1(4px), inline-flexが適切に機能しているか |
| アクセシビリティ   | ✅   | aria-hidden="true"が正しく付与されているか    |
| エラーハンドリング | ✅   | 未定義ツールにDEFAULT_TOOL_ICONが返るか       |

## Electronデスクトップアプリ観点

| 層                             | 変更内容                 |
| ------------------------------ | ------------------------ |
| **フロントエンド（Renderer）** | PermissionDialog.tsx修正 |
| **バックエンド（Main）**       | 変更なし                 |
| **IPC通信**                    | 変更なし                 |
| **Preload**                    | 変更なし                 |
| **ローカルストレージ**         | 変更なし                 |

## 成果物

| 成果物       | パス                                        | 説明                   |
| ------------ | ------------------------------------------- | ---------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更内容と結果のまとめ |

## 完了条件

- [ ] TOOL_ICONS定数が10ツール分定義されている
- [ ] DEFAULT_TOOL_ICON定数が定義されている
- [ ] getToolIcon関数が実装されている
- [ ] JSXテンプレートにアイコン表示が追加されている
- [ ] aria-hidden="true"が付与されている
- [ ] 全テスト（既存+新規）がPASSしている
- [ ] TypeScriptエラー0件
- [ ] ESLintエラー0件
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. TOOL_ICONS定数の実装（Task 1）
3. getToolIconヘルパー関数の実装（Task 2）
4. JSXテンプレートの修正（Task 3）
5. 全テストPASS確認（Task 4）
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 5
```

## 次のPhase

Phase 6: テスト拡充

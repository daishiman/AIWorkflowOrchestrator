# Phase 5: 実装（TDD Green）

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 5                                   |
| フェーズ名   | 実装                                |
| カテゴリ     | TDD-Green                           |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 4で作成したテストをすべてPASSさせる最小限の実装を行う。permissionDescriptions.ts モジュールを新規作成し、PermissionDialog.tsx に人間可読UI（説明文表示 + 詳細展開）を統合する。

---

## タスク

- Task 1: permissionDescriptions.ts の実装
  - `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts` を新規作成する
  - `getDescription(toolName: string, args: Record<string, unknown>): string` 関数を実装する
  - 10種類以上のツール別説明テンプレートを実装する
  - デフォルトテンプレートのフォールバックロジックを実装する
  - 引数のサニタイズ処理を実装する（Reactの自動エスケープを前提としつつ、文字列切り詰め等）

- Task 2: PermissionDialog.tsx の修正
  - 既存の `formatArgs()` 関数はそのまま維持する（技術的詳細表示用）
  - `getDescription()` をインポートして説明文を生成する
  - 説明文表示UIを追加する（ツール名の下に配置）
  - 「詳細を表示」/「詳細を隠す」折りたたみUIを追加する
  - `useState` で展開/折りたたみ状態を管理する
  - ARIA属性（`aria-expanded`, `aria-controls`）を追加する

- Task 3: テスト実行・全テストPASS確認
  - 新規テスト（`permissionDescriptions.test.ts`）がすべてPASSすることを確認する
  - 新規テスト（`PermissionDialog.readable.test.tsx`）がすべてPASSすることを確認する
  - 既存テスト（`PermissionDialog.test.tsx`）がすべてPASSすることを確認する
  - TypeScriptコンパイルエラーが0件であることを確認する
  - ESLintエラーが0件であることを確認する

---

## 参照資料

| ドキュメント           | パス                                                                                      | 説明                 |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------------- |
| Phase 2設計書          | `outputs/phase-2/design-document.md`                                                      | 実装の設計基準       |
| Phase 4テスト          | `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts`     | PASSさせるべきテスト |
| Phase 4テスト          | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` | PASSさせるべきテスト |
| 既存PermissionDialog   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                         | 修正対象ファイル     |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                | スタイル設計参照     |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`              | 層別配置ルール       |

---

## 手順

### Task 1 実行手順

1. Phase 2の設計書からインターフェース仕様を確認する
2. `permissionDescriptions.ts` を以下の構造で作成する：

**ファイル配置**: `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`

**実装構造**:

```
// 型定義
type ToolDescriptionGenerator = (args: Record<string, unknown>) => string

// ツール別説明テンプレート（10種類以上）
const toolDescriptionGenerators: Record<string, ToolDescriptionGenerator> = {
  Bash: (args) => ... ,
  Read: (args) => ... ,
  Write: (args) => ... ,
  Edit: (args) => ... ,
  Glob: (args) => ... ,
  Grep: (args) => ... ,
  WebSearch: (args) => ... ,
  Task: (args) => ... ,
  NotebookEdit: (args) => ... ,
  WebFetch: (args) => ... ,
  // 追加ツール
}

// デフォルトテンプレート
const defaultDescription = (toolName: string, args: Record<string, unknown>): string => ...

// 公開API
export function getDescription(toolName: string, args: Record<string, unknown>): string {
  // toolDescriptionGenerators にキーがあればそれを使用
  // なければ defaultDescription にフォールバック
  // 例外発生時もデフォルトにフォールバック
}
```

3. 各テンプレートを実装する：
   - Bash: `「{command}」コマンドを実行します`
   - Read: `「{path}」ファイルを読み取ります`
   - Write: `「{path}」ファイルに書き込みます`
   - Edit: `「{path}」ファイルを編集します`
   - Glob: `「{pattern}」パターンでファイルを検索します`
   - Grep: `「{pattern}」を含むファイルを検索します`
   - WebSearch: `「{query}」で検索します`
   - Task: `タスクを実行します：{description}`（description省略時は汎用文）
   - NotebookEdit: `ノートブックを編集します：{notebook_path}`
   - WebFetch: `「{url}」からデータを取得します`

4. 引数が欠損している場合の安全なフォールバック値を設定する

### Task 2 実行手順

1. 既存 `PermissionDialog.tsx` を読み込む
2. 以下の修正を加える：

**インポート追加**:

```
import { getDescription } from './permissionDescriptions'
```

**状態追加**:

```
const [isDetailExpanded, setIsDetailExpanded] = useState(false)
```

**JSX修正**（ツール名表示と既存引数表示の間に挿入）:

```
{/* 人間可読説明文 */}
<p className="text-sm text-gray-300 mt-1">
  {getDescription(permission.tool, permission.args)}
</p>

{/* 詳細展開UI */}
<button
  type="button"
  className="text-xs text-gray-500 hover:text-gray-300 mt-2"
  onClick={() => setIsDetailExpanded(!isDetailExpanded)}
  aria-expanded={isDetailExpanded}
  aria-controls="permission-detail"
>
  {isDetailExpanded ? '詳細を隠す ▲' : '詳細を表示 ▼'}
</button>

{isDetailExpanded && (
  <div id="permission-detail" role="region" className="mt-2 ...">
    {/* 既存の formatArgs() 出力 */}
  </div>
)}
```

3. 既存の `formatArgs()` 出力を折りたたみ内に移動する
4. 展開/折りたたみのリセット処理を追加する（ダイアログ表示時にリセット）

### Task 3 実行手順

1. 全テスト実行：
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
   ```
2. TypeScript型チェック：
   ```bash
   cd apps/desktop && npx tsc --noEmit
   ```
3. ESLint実行：
   ```bash
   cd apps/desktop && npx eslint src/renderer/components/skill/permissionDescriptions.ts src/renderer/components/skill/PermissionDialog.tsx
   ```

---

## TDD状態

| 項目         | 値                                                                           |
| ------------ | ---------------------------------------------------------------------------- |
| TDDフェーズ  | Green                                                                        |
| テスト状態   | 全テストPASS（実装完了後）                                                   |
| 検証コマンド | `cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/` |

---

## 統合テストアクション

| カテゴリ           | 確認内容                                              |
| ------------------ | ----------------------------------------------------- |
| データフロー       | getDescription→PermissionDialogの呼び出しが正常に動作 |
| エラーハンドリング | 未定義ツール・空引数時にフォールバックが正常動作      |
| 状態同期           | isDetailExpanded状態変更がUI表示に正しく反映される    |
| UI統合             | 既存UI（ボタン、チェックボックス等）との共存が正常    |

---

## システム開発観点チェック

| 観点               | 該当 | 確認内容                                                       |
| ------------------ | ---- | -------------------------------------------------------------- |
| セキュリティ       | ○    | React JSXの自動エスケープで安全、dangerouslySetInnerHTML不使用 |
| UI/UX（Apple HIG） | ○    | デザイントークン準拠のスタイル、8pxグリッド                    |
| アーキテクチャ     | ○    | Renderer層内、モジュール分離、単一責務                         |
| エラーハンドリング | ○    | try-catchフォールバック、デフォルトテンプレート                |

### Electronデスクトップアプリ観点

| 層                 | 該当 | 確認内容               |
| ------------------ | ---- | ---------------------- |
| フロントエンド     | ○    | React/TypeScriptで実装 |
| バックエンド(Main) | ×    | Main側変更なし         |
| IPC通信            | ×    | 変更不要               |
| Preload            | ×    | 変更不要               |
| ローカルストレージ | ×    | 変更不要               |

---

## 成果物

| 成果物名                | パス                                                                   | 種別 | 説明                     |
| ----------------------- | ---------------------------------------------------------------------- | ---- | ------------------------ |
| permissionDescriptions  | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts` | code | ツール別説明テンプレート |
| PermissionDialog (更新) | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`      | code | 人間可読UI統合済み       |

---

## 完了条件

- [ ] `permissionDescriptions.ts` が作成されている
- [ ] `getDescription()` 関数が実装されている
- [ ] 10種類以上のツール別テンプレートが実装されている
- [ ] デフォルトテンプレートが実装されている
- [ ] PermissionDialog.tsx に説明文表示が追加されている
- [ ] 詳細展開/折りたたみUIが実装されている
- [ ] ARIA属性（aria-expanded, aria-controls）が実装されている
- [ ] 新規テスト（`permissionDescriptions.test.ts`）がすべてPASS
- [ ] 新規テスト（`PermissionDialog.readable.test.tsx`）がすべてPASS
- [ ] 既存テスト（`PermissionDialog.test.tsx`）がすべてPASS
- [ ] TypeScriptエラー 0件
- [ ] ESLintエラー 0件

---

## 次のフェーズ

Phase 6: テスト拡充 → エッジケース・アクセシビリティテストの追加

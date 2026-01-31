# Phase 2: 設計

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 2                                   |
| フェーズ名   | 設計                                |
| カテゴリ     | 設計                                |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 1の要件定義に基づいて、permissionDescriptions モジュールの詳細設計と、PermissionDialogの UI変更設計を行う。既存アーキテクチャ（Renderer層・Zustand状態管理・Atomic Design）との整合性を確保する。

---

## タスク

- Task 1: permissionDescriptions モジュール設計
  - `permissionDescriptions.ts` のインターフェース・型定義を設計する
  - ツール別説明テンプレートの実装方針を設計する
  - 引数からプレースホルダーを置換するロジックを設計する
  - デフォルトテンプレートのフォールバック設計を行う

- Task 2: PermissionDialog UI変更設計
  - 説明文表示領域のレイアウト設計（既存UI構造に沿って配置）
  - 「詳細を表示」折りたたみUIのコンポーネント設計
  - `useState`による展開/折りたたみ状態管理の設計
  - ARIA属性（`aria-expanded`, `aria-controls`）の設計

- Task 3: データフロー設計
  - PermissionDialogからpermissionDescriptionsへのデータフロー設計
  - `toolName`（string）と `args`（Record<string, unknown>）を受け取り、説明文（string）を返す関数インターフェースを設計する
  - エラー時のフォールバックフローを設計する

- Task 4: テスト戦略設計
  - permissionDescriptions単体テストの設計
  - PermissionDialogコンポーネントテストの拡張設計
  - テストケースのカテゴリ分類（正常系・異常系・境界値・アクセシビリティ）を設計する

---

## 参照資料

| ドキュメント           | パス                                                                             | 説明                              |
| ---------------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                                     | 要件定義書                        |
| 既存PermissionDialog   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                | 現行実装                          |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | 層別責務・設計パターン            |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | Zustand Slice パターン            |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`       | デザイントークン                  |
| UI/UXデザイン原則      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`   | Atomic Design・コンポーネント階層 |
| コアインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`           | Result型・IPC型定義               |
| セキュリティ入力検証   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力サニタイズ基準                |

---

## 手順

### Task 1 実行手順

1. Phase 1の要件定義書を読み込む
2. 以下のインターフェースを設計する：

```
// 設計すべきインターフェース
type ToolDescriptionGenerator = (args: Record<string, unknown>) => string

interface PermissionDescriptions {
  // ツール名→説明生成関数のマッピング
  generators: Record<string, ToolDescriptionGenerator>
  // デフォルト説明生成関数
  defaultGenerator: (toolName: string, args: Record<string, unknown>) => string
  // 公開API: ツール名と引数から説明文を取得
  getDescription: (toolName: string, args: Record<string, unknown>) => string
}
```

3. 各ツールの説明テンプレートを設計する（10種類以上）：
   - Bash: コマンド文字列を含む説明
   - Read/Write/Edit: ファイルパスを含む説明
   - Glob/Grep: パターンを含む説明
   - WebSearch: 検索クエリを含む説明
   - Task: タスク説明を含む説明
   - NotebookEdit: ノートブック操作の説明
   - WebFetch: URL取得の説明
   - その他追加ツール

4. 引数のサニタイズ方針を設計する（XSS防止のため、HTMLエスケープ等）

### Task 2 実行手順

1. 既存PermissionDialog.tsxのJSX構造を確認する
2. 説明文表示位置を設計する：
   - ツール名表示の直下に配置
   - `text-sm text-gray-300` 等のスタイル設定
3. 折りたたみUIを設計する：
   - `<button>` で「詳細を表示 ▼」/「詳細を隠す ▲」を切り替え
   - `<div>` 内に既存の`formatArgs()`出力を配置
   - アニメーション: `max-height` トランジションまたは条件付きレンダリング
4. 状態管理: `const [isDetailExpanded, setIsDetailExpanded] = useState(false)` を追加

### Task 3 実行手順

1. データフロー図を作成する：
   ```
   PermissionDialog
     ├── toolName (string)
     ├── args (Record<string, unknown>)
     │
     ├── getDescription(toolName, args) → 説明文 (string)
     │
     └── formatArgs(toolName, args) → 技術的詳細 (string)（既存、折りたたみ内に移動）
   ```
2. getDescription関数のエラーハンドリングフロー：
   - ツール未定義 → デフォルトテンプレート使用
   - 引数欠損 → 安全なフォールバック文字列
   - 例外発生 → デフォルトテンプレートにフォールバック

### Task 4 実行手順

1. テストケース設計（カテゴリ別）：
   - **正常系**: 各ツール（10種類+）の説明文生成テスト
   - **異常系**: 未定義ツール、空引数、null/undefined引数
   - **境界値**: 長いコマンド文字列、特殊文字を含むパス
   - **アクセシビリティ**: 折りたたみのaria属性、キーボード操作
   - **XSSセキュリティ**: HTMLタグを含む引数の安全性
2. 既存テスト（`PermissionDialog.test.tsx`）への追加テスト方針を策定する
3. 新規テストファイル（`permissionDescriptions.test.ts`）の構造を設計する

---

## 統合テストアクション

| カテゴリ           | 確認内容                                                |
| ------------------ | ------------------------------------------------------- |
| データフロー       | getDescription→PermissionDialog間のデータ受け渡し正常性 |
| エラーハンドリング | 未定義ツール・空引数・例外時のフォールバック動作        |
| 状態同期           | isDetailExpanded状態とUI表示の同期                      |
| UI統合             | 説明文表示と既存UIレイアウトの共存                      |

---

## システム開発観点チェック

| 観点               | 該当 | 確認内容                                          |
| ------------------ | ---- | ------------------------------------------------- |
| セキュリティ       | ○    | 引数のHTMLエスケープ・XSS防止設計                 |
| UI/UX（Apple HIG） | ○    | デザイントークン・8pxグリッド準拠のレイアウト設計 |
| アーキテクチャ     | ○    | Renderer層内モジュール分離・単一責務設計          |
| エラーハンドリング | ○    | フォールバック設計・堅牢なデフォルト値設計        |

### Electronデスクトップアプリ観点

| 層                 | 該当 | 確認内容                           |
| ------------------ | ---- | ---------------------------------- |
| フロントエンド     | ○    | React/TypeScriptコンポーネント設計 |
| バックエンド(Main) | ×    | Main側変更なし                     |
| IPC通信            | ×    | 変更不要                           |
| Preload            | ×    | 変更不要                           |
| ローカルストレージ | ×    | 変更不要                           |

---

## 成果物

| 成果物名 | パス                                 | 種別     | 説明                     |
| -------- | ------------------------------------ | -------- | ------------------------ |
| 設計書   | `outputs/phase-2/design-document.md` | document | モジュール設計・UI設計書 |

---

## 完了条件

- [ ] permissionDescriptionsモジュールのインターフェース・型定義が設計されている
- [ ] 10種類以上のツール別説明テンプレートが設計されている
- [ ] デフォルトテンプレートのフォールバック設計がされている
- [ ] 引数サニタイズ方針（XSS防止）が設計されている
- [ ] 説明文表示のUI配置設計がされている
- [ ] 折りたたみUIのコンポーネント設計がされている
- [ ] ARIA属性設計がされている
- [ ] データフロー図が作成されている
- [ ] テスト戦略（カテゴリ別テストケース分類）が設計されている
- [ ] 成果物 `outputs/phase-2/design-document.md` が生成されている

---

## 次のフェーズ

Phase 3: 設計レビューゲート → Phase 2の設計を検証する

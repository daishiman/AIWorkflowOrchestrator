# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 1                                   |
| フェーズ名   | 要件定義                            |
| カテゴリ     | 要件                                |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

PermissionDialogの操作説明を自然言語化するための要件を定義する。非技術者ユーザーが操作内容を理解し、許可/拒否を適切に判断できるUIを実現するための要件を明確化する。

---

## 背景

現在のPermissionDialogは、`formatArgs()` 関数でツール引数を表示しているが、以下の問題がある：

- Bashコマンド（例: `ls -la /path`）が技術者向け表現のまま表示される
- ファイル操作の目的や影響が伝わりにくい
- 非技術者ユーザーが許可/拒否の判断材料を得にくい

specification.mdのUI/UX仕様では「人間可読な操作説明」への移行が将来対応として言及されている。

---

## タスク

- Task 1: 対象ツール一覧の定義
  - 現在のPermissionDialog.tsx（`apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`）の`formatArgs()`関数を分析し、対応すべきツールの完全な一覧を作成する
  - 最低10種類のツール（Bash, Read, Write, Edit, Glob, Grep, WebSearch, Task, NotebookEdit, WebFetch等）を特定する

- Task 2: 説明テンプレート要件の定義
  - 各ツールについて、引数から自然言語説明文を生成するためのテンプレート仕様を定義する
  - プレースホルダー（`{command}`, `{path}`, `{pattern}`等）の一覧と型を定義する
  - 未定義ツール向けのデフォルトテンプレートの要件を定義する

- Task 3: UI要件の定義
  - 説明文表示領域の配置要件を定義する（既存UIとの整合性を確認）
  - 「詳細を表示」折りたたみUIの動作要件を定義する
  - キーボード操作要件（Enter/Spaceで展開/折りたたみ）を定義する
  - アクセシビリティ要件（ARIA属性、スクリーンリーダー対応）を定義する

- Task 4: 品質要件の定義
  - テストカバレッジ基準を定義する（Line 80%以上、Branch 60%以上、Function 80%以上）
  - TypeScriptエラー0件、ESLintエラー0件の基準を確認する
  - 既存テスト（458行、`PermissionDialog.test.tsx`）との整合性要件を定義する

---

## 参照資料

| ドキュメント          | パス                                                                                   | 説明                            |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| 未タスク指示書        | `docs/30-workflows/unassigned-task/task-imp-permission-readable-ui-001.md`             | タスク元定義                    |
| 既存PermissionDialog  | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                      | 現行実装（215行）               |
| 既存テスト            | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`       | 現行テスト（458行）             |
| TASK-7C実装ガイド     | `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md` | PermissionDialog実装ガイド      |
| UI/UXデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`             | デザイントークン・グリッド仕様  |
| UI/UXデザイン原則     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`         | Atomic Design・アクセシビリティ |
| UI/UXエージェント実行 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`           | エージェント実行UI仕様          |
| セキュリティ実装      | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`         | 入力検証・XSS防止               |
| specification.md      | `docs/30-workflows/skill-import-agent-system/specification.md`                         | システム仕様書                  |

---

## 手順

### Task 1 実行手順

1. `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` を読み込み、`formatArgs()` 関数の処理内容を分析する
2. Claude Agent SDKのツール一覧（Bash, Read, Write, Edit, Glob, Grep, WebSearch, Task, NotebookEdit, WebFetch等）を確認する
3. 各ツールの典型的な引数パターンを一覧化する

### Task 2 実行手順

1. 各ツールについて、引数から自然言語説明を生成するテンプレートを設計する
2. テンプレート例：
   - Bash: `「{command}」コマンドを実行します`
   - Read: `「{path}」ファイルを読み取ります`
   - Write: `「{path}」ファイルに書き込みます`
3. プレースホルダーの型定義（string, number, boolean等）を明記する
4. デフォルトテンプレート: `「{toolName}」ツールの操作を実行します`

### Task 3 実行手順

1. 既存PermissionDialog UIの構造を確認する
2. 説明文を「ツール名表示」と「引数表示」の間に配置する方針を策定する
3. 折りたたみUIの仕様を定義する：
   - デフォルトは折りたたみ状態（説明文のみ表示）
   - 「詳細を表示」ボタンで技術的詳細（既存のformatArgs出力）を展開
   - `aria-expanded`属性を使用
4. キーボード操作・フォーカス管理要件を定義する

### Task 4 実行手順

1. 既存テストの構造を確認し、追加テストとの共存方針を策定する
2. テストカバレッジ基準を文書化する
3. 品質チェック項目一覧を作成する

---

## 統合テストアクション

| カテゴリ           | 確認内容                                                  |
| ------------------ | --------------------------------------------------------- |
| データフロー       | permissionDescriptions→PermissionDialog間のデータ受け渡し |
| エラーハンドリング | 未定義ツール・空引数時のフォールバック動作                |
| 状態同期           | 詳細展開/折りたたみ状態のUI反映                           |

---

## システム開発観点チェック

| 観点               | 該当 | 確認内容                                       |
| ------------------ | ---- | ---------------------------------------------- |
| セキュリティ       | ○    | XSS防止（ユーザー入力の安全な表示）            |
| UI/UX（Apple HIG） | ○    | デザイントークン準拠、アクセシビリティ基準     |
| アーキテクチャ     | ○    | Renderer層への適切な配置                       |
| エラーハンドリング | ○    | 未定義ツール・不正引数への安全なフォールバック |

### Electronデスクトップアプリ観点

| 層                 | 該当 | 確認内容                               |
| ------------------ | ---- | -------------------------------------- |
| フロントエンド     | ○    | Rendererプロセスでのコンポーネント実装 |
| バックエンド(Main) | ×    | Main側変更なし                         |
| IPC通信            | ×    | 既存IPCチャネルで対応可能              |
| Preload            | ×    | 変更不要                               |
| ローカルストレージ | ×    | 変更不要                               |

---

## 成果物

| 成果物名   | パス                                         | 種別     | 説明                 |
| ---------- | -------------------------------------------- | -------- | -------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | document | 要件定義の完全な文書 |

---

## 完了条件

- [ ] 対象ツール10種類以上の一覧が定義されている
- [ ] 各ツールの説明テンプレート仕様が定義されている
- [ ] デフォルトテンプレートの仕様が定義されている
- [ ] UI配置・動作要件が定義されている
- [ ] アクセシビリティ要件が定義されている
- [ ] 品質基準（カバレッジ、lint、typecheck）が定義されている
- [ ] 既存テストとの整合性方針が定義されている
- [ ] セキュリティ観点（XSS防止）が考慮されている
- [ ] 成果物 `outputs/phase-1/requirements-definition.md` が生成されている

---

## 次のフェーズ

Phase 2: 設計 → Phase 1の要件定義に基づいてモジュール設計・UI設計を行う

# TASK-WCE-WORKSPACE-001: Chat Edit Workspace管理統合

## メタ情報

```yaml
issue_number: 660
```

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | TASK-WCE-WORKSPACE-001               |
| タスク名     | Chat Edit Workspace管理統合          |
| 分類         | 改善                                 |
| 対象機能     | workspace-chat-edit / Workspace連携  |
| 優先度       | 中                                   |
| 見積もり規模 | 小規模                               |
| ステータス   | 完了（Phase 12まで）                 |
| 発見元       | Phase 12（コードベースTODOスキャン） |
| 発見日       | 2026-02-02                           |
| 作成日       | 2026-02-02                           |

---

## 概要

workspace-chat-edit機能において、ワークスペースパスの取得とファイル一覧の取得が仮実装のままになっている問題を解決する。

### 背景

以下のTODOが存在し、本番環境での正常動作を阻害している：

1. `chatEditHandlers.ts:77` - `getWorkspacePath()`が`process.cwd()`を使用
2. `useFileContext.ts:96` - `openFiles`が空配列固定

### 目的

chat-edit機能がElectronアプリのWorkspace管理と連携し、正しいワークスペースパスとファイル一覧を取得できるようにする。

---

## Phase構成

| Phase | 名称                 | カテゴリ     | 依存     |
| ----- | -------------------- | ------------ | -------- |
| 1     | 要件定義             | 要件         | -        |
| 2     | 設計                 | 設計         | Phase 1  |
| 3     | 設計レビューゲート   | ゲート       | Phase 2  |
| 4     | テスト作成           | TDD-Red      | Phase 3  |
| 5     | 実装                 | TDD-Green    | Phase 4  |
| 6     | テスト拡充           | 品質         | Phase 5  |
| 7     | テストカバレッジ確認 | 品質         | Phase 6  |
| 8     | リファクタリング     | TDD-Refactor | Phase 7  |
| 9     | 品質保証             | 品質         | Phase 8  |
| 10    | 最終レビューゲート   | ゲート       | Phase 9  |
| 11    | 手動テスト検証       | 検証         | Phase 10 |
| 12    | ドキュメント更新     | 文書化       | Phase 11 |
| 13    | PR作成               | 完了         | Phase 12 |

---

## スコープ

### 含むもの

- `chatEditHandlers.ts`のワークスペースパス取得ロジック修正
- `useFileContext.ts`のファイル一覧取得ロジック修正
- Workspace Sliceとの連携実装
- IPC経由でのワークスペース情報取得メカニズム（必要に応じて）
- ユニットテスト追加

### 含まないもの

- Workspace管理機能自体の実装（既存実装を活用）
- ファイルウォッチャー実装（リアルタイム更新）
- ファイルツリーUI実装

---

## 成果物一覧

| 成果物               | パス                                                                               | Phase    |
| -------------------- | ---------------------------------------------------------------------------------- | -------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                       | Phase 1  |
| 設計書               | `outputs/phase-2/architecture-design.md`                                           | Phase 2  |
| レビュー結果         | `outputs/phase-3/design-review-result.md`                                          | Phase 3  |
| テスト仕様書         | `outputs/phase-4/test-specification.md`                                            | Phase 4  |
| テストコード         | `apps/desktop/src/main/handlers/__tests__/chatEditHandlers.workspace.test.ts`      | Phase 4  |
| テストコード         | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/*.test.ts` | Phase 4  |
| 実装コード           | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                               | Phase 5  |
| 実装コード           | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts`   | Phase 5  |
| カバレッジレポート   | `outputs/phase-6/coverage-report.md`                                               | Phase 6  |
| カバレッジ確認結果   | `outputs/phase-7/coverage-report.md`                                               | Phase 7  |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md`                                            | Phase 8  |
| 品質レポート         | `outputs/phase-9/quality-report.md`                                                | Phase 9  |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                          | Phase 10 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                           | Phase 11 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                                         | Phase 12 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`                                      | Phase 12 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`                                    | Phase 12 |
| PR情報               | `outputs/phase-13/pr-info.md`                                                      | Phase 13 |

---

## 完了条件

### 機能要件

- [ ] `getWorkspacePath()`がWorkspace管理から正しいパスを取得している
- [ ] `getAvailableFiles()`がWorkspaceのファイル一覧を返している
- [ ] ワークスペース外のファイルアクセスが適切に制限されている

### 品質要件

- [ ] テストカバレッジ Line 80%以上
- [ ] TypeScript strict mode エラー0件
- [ ] ESLint エラー0件
- [ ] `grep -rn "TODO.*実際のワークスペース管理" apps/desktop/src/` の結果が0件
- [ ] `grep -rn "TODO.*openFilesプロパティ" apps/desktop/src/` の結果が0件

### ドキュメント要件

- [ ] llm-workspace-chat-edit.md更新
- [ ] aiworkflow-requirements/LOGS.md更新
- [ ] task-specification-creator/LOGS.md更新

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                  |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------- |
| Workspace Chat Edit仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 既存chat-edit仕様     |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Electronパターン      |
| インターフェース定義    | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`         | コアインターフェース  |
| API設計                 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`           | IPCエンドポイント仕様 |

### プロジェクト内参照

| 参照資料            | パス                                                                             | 内容              |
| ------------------- | -------------------------------------------------------------------------------- | ----------------- |
| workspaceSlice.ts   | `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`                       | Workspace状態管理 |
| chatEditHandlers.ts | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                             | TODO箇所（L77）   |
| useFileContext.ts   | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts` | TODO箇所（L96）   |
| workspace型定義     | `apps/desktop/src/renderer/store/types/workspace.ts`                             | Workspace型定義   |

---

## リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                   |
| ------------------------------ | ------ | -------- | -------------------------------------- |
| WorkspaceSliceの構造変更が必要 | 中     | 中       | 既存Sliceを調査し、最小限の拡張で対応  |
| IPC通信追加による複雑化        | 低     | 低       | 既存IPCパターンを踏襲し、一貫性を保つ  |
| セキュリティ制約の回避リスク   | 高     | 低       | パス検証ロジックを強化し、テストを追加 |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-02-02 | 1.0.0      | 初版作成 |

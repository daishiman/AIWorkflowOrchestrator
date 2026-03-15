# UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001: workspacePath セキュリティ検証テスト実装

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                         |
| タスク名     | workspacePath セキュリティ検証テスト実装（TC-WS-01〜06）           |
| 分類         | test                                                               |
| 対象機能     | chatEditHandlers.ts / workspacePath 制約ガード                     |
| 優先度       | 高                                                                 |
| 見積もり規模 | 中規模                                                             |
| ステータス   | 完了（Phase 1-12 完了 / Phase 13 未実施）                          |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12（2026-03-14） |
| 発見日       | 2026-03-14                                                         |
| 作成日       | 2026-03-14                                                         |
| issue_number | 1222                                                               |

## 目的

`chatEditHandlers.ts`（IPC版: `apps/desktop/src/main/ipc/chatEditHandlers.ts`）の workspacePath セキュリティ検証ロジック（L159-173）を網羅する単体テスト（TC-WS-01〜06）を実装し、防御コードが常に機能していることを自動検証できる状態にする。

## 背景

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 で `isAllowedPath(ctx.filePath, [args.workspacePath])` によるワークスペース制約ガードを実装したが、以下のテストが不足している：

- `isAllowedPath` が IPC ハンドラ内で正しく呼ばれているかの検証
- workspacePath 未指定時のスキップ動作の検証
- パストラバーサル攻撃パターンに対するガード動作の検証
- 複数コンテキストファイルのうち一部が workspace 外にある場合の挙動検証
- 空コンテキスト配列のエッジケース検証

## スコープ

### 含むもの

- IPC 版 `chatEditHandlers.ts`（`apps/desktop/src/main/ipc/chatEditHandlers.ts`）の workspacePath 検証ロジックに対する単体テスト（TC-WS-01〜06）
- モック RuntimeResolver・ContextBuilder を用いたハンドラ直接テスト
- パストラバーサル攻撃パターンのセキュリティテスト
- `isAllowedPath` の呼び出し有無を検証するスパイテスト

### 含まないもの

- `isAllowedPath` 関数そのものの実装変更
- `handlers/chatEditHandlers.ts` のテスト追加（別ファイル・別責務）
- E2E テスト（Playwright）での検証
- workspacePath 検証ロジックの機能追加・仕様変更
- Preload API の公開修正（P59: 別タスクスコープ）

## 受入基準

### 機能要件

- [ ] TC-WS-01: workspacePath 指定時、workspace 内ファイルは PASS する
- [ ] TC-WS-02: workspacePath 指定時、workspace 外ファイルは `PERMISSION_DENIED` エラーを返す
- [ ] TC-WS-03: workspacePath 未指定時、`isAllowedPath` が呼ばれずに処理が続行する
- [ ] TC-WS-04: パストラバーサル攻撃パターン（`../../`）に対して `PERMISSION_DENIED` を返す
- [ ] TC-WS-05: 複数コンテキストのうち 1 つでも workspace 外なら全体が `PERMISSION_DENIED` を返す
- [ ] TC-WS-06: 空のコンテキスト配列で `isAllowedPath` が呼ばれずに正常処理される

### 品質要件

- [ ] TC-WS-01〜06 の全テストが Vitest で PASS する
- [ ] `chatEditHandlers.ts` の workspacePath 検証ブランチの Branch Coverage が 70% 以上
- [ ] 既存テストへの影響がない（`pnpm --filter @repo/desktop test` が全 PASS）

## テストケース一覧

| TC ID    | テスト内容                                 | 期待結果                   | カテゴリ     |
| -------- | ------------------------------------------ | -------------------------- | ------------ |
| TC-WS-01 | workspace 内ファイルコンテキストの正常処理 | `success: true`            | 正常系       |
| TC-WS-02 | workspace 外ファイルコンテキストの拒否     | `PERMISSION_DENIED`        | 異常系       |
| TC-WS-03 | workspacePath 未指定時の検証スキップ       | `isAllowedPath` 未呼び出し | 境界値       |
| TC-WS-04 | パストラバーサル攻撃パターンのガード       | `PERMISSION_DENIED`        | セキュリティ |
| TC-WS-05 | 複数コンテキストのうち 1 つが workspace 外 | `PERMISSION_DENIED`        | 異常系       |
| TC-WS-06 | 空コンテキスト配列の正常処理               | `isAllowedPath` 未呼び出し | エッジケース |

## 苦戦箇所と対策

| ID  | 問題                            | 対策                                                                                       |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| P57 | AuthMode 値の設計書との乖離     | 型定義正本は `packages/shared/src/types/auth-mode.ts`。実値: `"subscription" \| "api-key"` |
| P58 | chatEditHandlers の同名二重存在 | 正本は `ipc/chatEditHandlers.ts`（IPC ハンドラ登録）。`handlers/` は別責務                 |
| P59 | Preload API 未公開              | ハンドラ直接テストで対応。Preload 公開修正は別タスク                                       |
| P61 | ChatEditService の動的注入      | RuntimeResolver をモックし、テスト時はモック adapter を直接注入                            |

## 関連実装ファイル

| ファイル                                                                | 役割                       |
| ----------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`                         | テスト対象（IPC ハンドラ） |
| `apps/desktop/src/main/services/chat-edit/utils/PathValidator.ts`       | `isAllowedPath` 実装       |
| `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.security.test.ts` | 既存セキュリティテスト     |
| `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.test.ts`          | 既存テスト                 |
| `packages/shared/src/types/auth-mode.ts`                                | AuthMode 型定義正本        |

## 関連タスク

| タスクID                                    | 関係     |
| ------------------------------------------- | -------- |
| TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 | 親タスク |

## Phase 構成

| Phase | 名称             | 仕様書                         |
| ----- | ---------------- | ------------------------------ |
| 1     | 要件定義         | `phase-1-requirements.md`      |
| 2     | 設計             | `phase-2-design.md`            |
| 3     | 設計レビュー     | `phase-3-design-review.md`     |
| 4     | テスト作成       | `phase-4-test-creation.md`     |
| 5     | 実装             | `phase-5-implementation.md`    |
| 6     | テスト拡充       | `phase-6-test-expansion.md`    |
| 7     | カバレッジ確認   | `phase-7-coverage-check.md`    |
| 8     | リファクタリング | `phase-8-refactoring.md`       |
| 9     | 品質保証         | `phase-9-quality-assurance.md` |
| 10    | 最終レビュー     | `phase-10-final-review.md`     |
| 11    | 手動テスト       | `phase-11-manual-test.md`      |
| 12    | ドキュメント     | `phase-12-documentation.md`    |
| 13    | PR 作成          | `phase-13-pr-creation.md`      |

## 参照資料

| 資料名               | パス                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| タスク指示書         | `docs/30-workflows/completed-tasks/task-chat-edit-workspace-constraint-test-001.md`                                     |
| IPC セキュリティ原則 | `.claude/rules/04-electron-security.md`                                                                                 |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                                                    |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                                                      |
| セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                            |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                             |
| 仕様抽出追跡表       | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/outputs/phase-1/spec-extraction-traceability-matrix.md` |

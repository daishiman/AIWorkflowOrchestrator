# Phase 13: PR作成

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 13                                        |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

実装をコミットし、PRを作成してCI/CDを通過させる。

## 実行タスク

### Task 13-1: ローカル確認

**PR作成前の必須チェック:**

```bash
# ビルド確認
pnpm --filter @repo/desktop build

# 全テスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

| #   | 確認項目       | コマンド                                | 結果 | 備考 |
| --- | -------------- | --------------------------------------- | ---- | ---- |
| 1   | ビルド成功     | `pnpm --filter @repo/desktop build`     | -    | -    |
| 2   | テストPASS     | `pnpm --filter @repo/desktop test`      | -    | -    |
| 3   | 型チェックPASS | `pnpm --filter @repo/desktop typecheck` | -    | -    |
| 4   | LintPASS       | `pnpm --filter @repo/desktop lint`      | -    | -    |

### Task 13-2: 変更内容の確認

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff
```

**変更ファイル一覧（予定）:**

| ファイル                                                               | 変更種別 | 内容             |
| ---------------------------------------------------------------------- | -------- | ---------------- |
| `apps/desktop/src/main/ipc/permission-handlers.ts`                     | 新規     | IPC Handler      |
| `apps/desktop/src/main/ipc/index.ts`                                   | 変更     | Handler登録追加  |
| `apps/desktop/src/preload/skill-api.ts`                                | 変更     | Preload API拡張  |
| `apps/desktop/src/preload/types.ts`                                    | 変更     | 型定義追加       |
| `apps/desktop/src/renderer/hooks/usePermissionDialog.ts`               | 新規     | React Hook       |
| `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` | 新規     | UIコンポーネント |
| `apps/desktop/src/renderer/components/Permission/index.ts`             | 新規     | エクスポート     |
| `apps/desktop/src/**/__tests__/*.test.ts`                              | 新規     | テストファイル   |

### Task 13-3: PR作成

⚠️ **重要**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

```bash
# ユーザー許可後に実行
/ai:diff-to-pr
```

**PRテンプレート:**

```markdown
## Summary

- PermissionResolver IPC Handlers実装（TASK-4-2）
- Main Process ↔ Renderer Process間の権限確認IPC通信を実装
- usePermissionDialog Hook と PermissionDialog コンポーネントを追加

## Changes

### IPC Handler（Main Process）

- `registerPermissionHandlers()`: IPCハンドラ登録
- `createPermissionRequestForwarder()`: リクエスト転送関数
- `unregisterPermissionHandlers()`: ハンドラ解除

### Preload API

- `skillPermissionAPI.onPermissionRequest()`: リクエスト購読
- `skillPermissionAPI.sendPermissionResponse()`: レスポンス送信

### React Hook & Component

- `usePermissionDialog`: 権限確認状態管理
- `PermissionDialog`: 確認ダイアログUI

### Security

- IPC sender検証（validateIpcSender）
- チャンネルホワイトリスト（ALLOWED\_\*\_CHANNELS）

## Test plan

- [ ] IPC Handlerユニットテスト
- [ ] Preload APIユニットテスト
- [ ] usePermissionDialog Hookテスト
- [ ] PermissionDialogコンポーネントテスト
- [ ] 統合テスト（IPC通信フロー）
- [ ] アクセシビリティテスト

## Related Issues

Closes #505

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Task 13-4: CI/CD確認

| #   | CI項目            | 期待結果 | 結果 | 備考 |
| --- | ----------------- | -------- | ---- | ---- |
| 1   | Build             | PASS     | -    | -    |
| 2   | Lint              | PASS     | -    | -    |
| 3   | Type Check        | PASS     | -    | -    |
| 4   | Unit Tests        | PASS     | -    | -    |
| 5   | Integration Tests | PASS     | -    | -    |

### Task 13-5: マージ準備確認

| #   | 確認項目           | 状態 | 備考 |
| --- | ------------------ | ---- | ---- |
| 1   | CI/CD全項目PASS    | -    | -    |
| 2   | コードレビュー承認 | -    | -    |
| 3   | コンフリクトなし   | -    | -    |
| 4   | ブランチ最新       | -    | -    |

⚠️ **マージ**: ユーザーがGitHub UIで手動実行

## 統合テスト連携【必須】

PR作成前の統合テスト最終確認:

| 確認項目     | 基準       | 結果       | 判定 |
| ------------ | ---------- | ---------- | ---- |
| 全テスト成功 | 100%       | {{RESULT}} | -    |
| カバレッジ   | 基準達成   | {{RESULT}} | -    |
| CI通過       | 全項目PASS | {{RESULT}} | -    |

## 参照資料

| 資料名               | パス                                            | 説明           |
| -------------------- | ----------------------------------------------- | -------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | Phase 12成果物 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | Phase 12成果物 |

## 成果物

| 成果物   | パス           | 説明          |
| -------- | -------------- | ------------- |
| PRリンク | GitHub PR URL  | 作成されたPR  |
| CI結果   | GitHub Actions | CI/CD実行結果 |

## 完了条件

- [ ] ローカル確認（ビルド/テスト/型チェック/Lint）がPASS
- [ ] 変更内容が確認されている
- [ ] PRが作成されている（ユーザー許可後）
- [ ] CI/CDが全項目PASS
- [ ] マージ準備が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク完了

Phase 13完了をもって、TASK-4-2（PermissionResolver IPC Handlers）は完了となる。

**完了後のアクション:**

1. GitHub Issue #505 をクローズ
2. タスク仕様書を `docs/30-workflows/completed-tasks/` に移動

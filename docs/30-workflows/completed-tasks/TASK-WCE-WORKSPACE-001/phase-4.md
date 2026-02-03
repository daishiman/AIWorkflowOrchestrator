# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 4                      |
| 機能名 | TASK-WCE-WORKSPACE-001 |
| 作成日 | 2026-02-02             |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

### Task 1: chatEditHandlersテスト作成

`apps/desktop/src/main/handlers/__tests__/chatEditHandlers.workspace.test.ts`

| テストケース                                      | 期待結果                             |
| ------------------------------------------------- | ------------------------------------ |
| workspacePathが指定された場合、そのパスを使用する | ワークスペースパスが正しく設定される |
| workspacePathがnullの場合、nullを返す             | nullが返される                       |
| ワークスペース内のファイルへのアクセス            | 正常にファイルが読み込まれる         |
| ワークスペース外のファイルへのアクセス            | PERMISSION_DENIEDエラーが返される    |
| workspacePathが空文字の場合                       | 適切なエラーまたはnullが返される     |

### Task 2: useFileContextテスト作成

`apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/useFileContext.workspace.test.ts`

| テストケース                           | 期待結果                             |
| -------------------------------------- | ------------------------------------ |
| folderFileTreesが空の場合              | 空配列が返される                     |
| 単一フォルダのファイルツリーがある場合 | そのフォルダのファイル一覧が返される |
| 複数フォルダのファイルツリーがある場合 | 全フォルダのファイル一覧が統合される |
| ネストされたディレクトリ構造の場合     | 再帰的にファイルが抽出される         |
| ファイルが存在しないフォルダの場合     | 空配列が返される                     |

### Task 3: extractFilesFromTreeユーティリティテスト作成

| テストケース             | 期待結果                      |
| ------------------------ | ----------------------------- |
| 空のツリーノード         | 空配列が返される              |
| ファイルのみのツリー     | ファイルのpath/nameが返される |
| ディレクトリのみのツリー | 空配列が返される              |
| 深くネストされたツリー   | 全階層のファイルが抽出される  |
| 特殊文字を含むパス       | 正しくパスが処理される        |

### Task 4: 統合テストシナリオ設計

| シナリオカテゴリ   | 検証内容                                         | テストファイル                         |
| ------------------ | ------------------------------------------------ | -------------------------------------- |
| API接続テスト      | chat-edit:read-fileでworkspacePath検証が機能する | `chatEditHandlers.integration.test.ts` |
| データフローテスト | Workspace Slice変更→useFileContext→最新一覧取得  | `useFileContext.flow.test.ts`          |
| エラーハンドリング | ワークスペース外アクセス時のエラー表示           | `chatEditHandlers.error.test.ts`       |

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容       |
| ----------------------- | ------------------------------------------------------------------------------ | ---------- |
| テスト戦略              | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`        | テスト方針 |
| Workspace Chat Edit仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 既存仕様   |

## アーキテクチャ層別テスト

| 層               | テスト観点                               | テストファイル配置                                                        |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Main Process     | chatEditHandlersのワークスペースパス検証 | `apps/desktop/src/main/handlers/__tests__/`                               |
| Renderer Process | useFileContextのファイル一覧取得         | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/` |
| Shared           | extractFilesFromTreeユーティリティ       | `apps/desktop/src/renderer/features/workspace-chat-edit/utils/__tests__/` |

## 統合テスト連携

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                      | テストファイル          |
| ------------------ | --------------------------------------------- | ----------------------- |
| API接続テスト      | IPCチャンネルの疎通・レスポンス形式           | `*.integration.test.ts` |
| データフローテスト | Workspace Slice→useFileContext→chatEditの往復 | `*.flow.test.ts`        |
| エラーハンドリング | PERMISSION_DENIEDエラー時のフロントエンド表示 | `*.error.test.ts`       |

## 実行手順

### 1. テストシナリオ設計

受け入れ基準からテストシナリオを導出する。TDD原則に従い、テストを先に書く。

### 2. ユニットテスト作成

各機能のユニットテストを作成する。テストは失敗する状態（Red）で完了。

```bash
# テスト作成後の確認
pnpm --filter @repo/desktop test -- --run chatEditHandlers.workspace
pnpm --filter @repo/desktop test -- --run useFileContext.workspace
```

### 3. テストの失敗確認

すべてのテストが失敗することを確認（Red状態）。

## 成果物

| 成果物             | パス                                                                                                      | 説明               |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                                                   | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`                                                                           | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                                                              | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/main/handlers/__tests__/chatEditHandlers.workspace.test.ts`                             | Main Processテスト |
| テストファイル     | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/useFileContext.workspace.test.ts` | Rendererテスト     |

## 完了条件

- [ ] chatEditHandlersのワークスペーステストが作成されている
- [ ] useFileContextのファイル一覧テストが作成されている
- [ ] extractFilesFromTreeユーティリティテストが作成されている
- [ ] 統合テストシナリオが設計されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%以上）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）

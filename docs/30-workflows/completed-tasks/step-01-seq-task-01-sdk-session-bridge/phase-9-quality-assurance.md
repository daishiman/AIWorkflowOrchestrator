# Phase 9: 品質保証 -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| Phase番号  | 9                           |
| 機能名     | sdk-session-bridge          |
| タスクID   | TASK-SDK-SC-01              |
| 作成日     | 2026-04-02                  |
| 依存 Phase | Phase 8（リファクタリング） |

## 目的

実装済みコードが TypeScript 型チェック・ESLint・セキュリティ基準を全て満たしていることを確認する。CI で失敗しない状態にする。

## 実行タスク

### Task 9-1: TypeScript 型チェック

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

期待する結果: **0 エラー**

エラーが出た場合の対処方針:

| エラー種別                           | 対処方法                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `Type 'X' is not assignable to 'Y'`  | 型定義を見直し、Union 型または型ガードで修正する                                   |
| `Property 'X' does not exist on 'Y'` | インターフェース定義に不足プロパティを追加する                                     |
| `Cannot find module 'X'`             | import パスを確認し、`packages/shared/src/types/index.ts` のエクスポートを確認する |
| `Object is possibly 'null'`          | null チェック（`if (x === null)` または `x?.`)を追加する                           |

### Task 9-2: ESLint チェック

```bash
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

期待する結果: **0 エラー**（警告は許容するが記録する）

主なチェック項目:

| ルール                               | 対象箇所                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any` | `SkillCreatorSdkSession.ts` / `SkillCreatorIpcBridge.ts` 内の any 型使用禁止 |
| `@typescript-eslint/no-unused-vars`  | 未使用変数の排除                                                             |
| `no-console`                         | `console.log` を `logger` ユーティリティに置き換え                           |
| `import/no-cycle`                    | 循環インポートがないことを確認                                               |

### Task 9-3: セキュリティチェック

Electron セキュリティルール（`.claude/rules/04-electron-security.md`）への準拠を確認する。

| チェック項目                                                 | 確認方法                                                                                            | 状態  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ----- |
| API キーが IPC チャネル経由でレンダラーに送出されていない    | `SkillCreatorIpcBridge.ts` の `webContents.send()` 呼び出しを全確認                                 | - [ ] |
| API キーがログに出力されていない                             | `SkillCreatorSdkSession.ts` のログ出力箇所を全確認                                                  | - [ ] |
| `UserInputAnswer.value` が `secret` 種別の場合にマスクされる | IPC 送信前にマスク処理が行われていることを確認                                                      | - [ ] |
| `contextIsolation` を前提とした IPC 設計になっている         | `ipcMain.handle` / `ipcMain.on` のみを使用し、`ipcRenderer.send` を Main 側で使っていないことを確認 | - [ ] |

### Task 9-4: 依存関係チェック

```bash
# 新規追加したインポートが不要な依存関係を生んでいないことを確認
pnpm --filter @repo/desktop why @anthropic-ai/claude-agent-sdk
```

`@anthropic-ai/claude-agent-sdk` が `@repo/desktop` の dependencies に含まれていることを確認する。含まれていない場合は追加する:

```bash
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk
```

### Task 9-5: 全体テスト再実行

```bash
pnpm --filter @repo/desktop vitest run
```

期待する結果: 既存テストを含む全テストが PASS（リグレッションなし）

## 参照資料

| 資料名             | パス                                                           |
| ------------------ | -------------------------------------------------------------- |
| セキュリティルール | `.claude/rules/04-electron-security.md`                        |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                             |
| ESLint 設定        | `apps/desktop/.eslintrc.js`（または `eslint.config.js`）       |
| TypeScript 設定    | `apps/desktop/tsconfig.json` / `packages/shared/tsconfig.json` |

## 成果物

| 成果物                         | パス                                                                                    | 形式     |
| ------------------------------ | --------------------------------------------------------------------------------------- | -------- |
| 品質保証レポート（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-9-quality-assurance.md` | Markdown |

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` が 0 エラーで通った
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラーで通った
- [ ] `pnpm --filter @repo/shared lint` が 0 エラーで通った
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラーで通った
- [ ] API キーが IPC 経由でレンダラーに送出されていないことを確認した
- [ ] API キーがログに出力されていないことを確認した
- [ ] `secret` 種別の回答値がマスクされていることを確認した
- [ ] `@anthropic-ai/claude-agent-sdk` が dependencies に含まれていることを確認した
- [ ] 全テスト（既存テスト含む）が PASS した

## 次の Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）

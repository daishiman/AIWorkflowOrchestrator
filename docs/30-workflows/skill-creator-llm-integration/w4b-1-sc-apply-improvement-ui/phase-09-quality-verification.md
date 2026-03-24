# Phase 9: 品質検証

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 9                             |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 8 完了                  |

## 目的

Lint・型チェック・全テスト実行により、コード品質が全プロジェクト基準を満たしていることを確認する。

## 実行タスク

### Task 1: ESLint 実行

```bash
cd apps/desktop && pnpm lint
```

- [ ] エラー 0 件
- [ ] 警告のうち、本タスクに起因するもの 0 件

### Task 2: TypeScript 型チェック

```bash
pnpm typecheck
```

- [ ] `apps/desktop` の型チェックエラー 0 件
- [ ] `packages/shared` の型チェックエラー 0 件

重点チェック項目:

- `creatorHandlers.ts` の新ハンドラ型定義
- `skill-api.ts` の `applyRuntimeImprovement` メソッド型
- 新規コンポーネントの Props 型

### Task 3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

- [ ] 全テスト PASS
- [ ] 既存テストにリグレッションなし

### Task 4: IPC 契約検証

```bash
# チャンネル定義と ALLOWED_INVOKE_CHANNELS の整合確認
grep -n "SKILL_CREATOR_APPLY_IMPROVEMENT" apps/desktop/src/preload/channels.ts

# ハンドラ登録と unregister の整合確認
grep -n "SKILL_CREATOR_APPLY_IMPROVEMENT" apps/desktop/src/main/ipc/creatorHandlers.ts

# Preload API での使用確認
grep -n "SKILL_CREATOR_APPLY_IMPROVEMENT" apps/desktop/src/preload/skill-api.ts
```

- [ ] `channels.ts`: チャンネル定義 + `ALLOWED_INVOKE_CHANNELS` に存在
- [ ] `creatorHandlers.ts`: `ipcMain.handle` + `ipcMain.removeHandler` に存在
- [ ] `skill-api.ts`: `safeInvoke` で参照されている
- [ ] ハードコード文字列（`"skill-creator:apply-improvement"`）がハンドラ・Preload に存在しない（P27 準拠）

### Task 5: セキュリティ確認

- [ ] `validateIpcSender` が新ハンドラに含まれている
- [ ] `sanitizeErrorMessage` がエラー経路で使用されている
- [ ] non-null assertion (`!`) が新コードに存在しない
- [ ] `as` キャストによるバリデーションバイパスがない

## 参照資料

- `.claude/rules/02-code-quality.md`（Lint・型チェック基準）
- `.claude/rules/07-git-and-tooling.md`（コミット前チェックリスト）

## 成果物

- 品質検証結果（本ファイルのチェックリストに記録）

## 完了条件

- [ ] ESLint エラー 0 件
- [ ] TypeScript 型チェックエラー 0 件
- [ ] 全テスト PASS
- [ ] IPC 契約検証（チャンネル定義/ハンドラ/Preload の3箇所一致）
- [ ] セキュリティ確認全項目クリア

## 次の Phase

Phase 10: 最終レビュー

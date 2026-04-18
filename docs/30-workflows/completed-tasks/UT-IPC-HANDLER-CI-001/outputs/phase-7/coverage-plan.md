# カバレッジ計画

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 7                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 計測方法

```bash
npx vitest run "src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts" \
  --coverage --coverage.include="src/main/ipc/creatorHandlers.ts"
```

## 実測値（creatorHandlers.registrationSnapshot.test.ts 単体）

| 指標       | 実測値 | 閾値 | 判定          |
| ---------- | ------ | ---- | ------------- |
| Statements | 11.91% | 80%  | ⚠️ 意図的低値 |
| Branches   | 50.00% | 60%  | ⚠️ 意図的低値 |
| Functions  | 7.14%  | 80%  | ⚠️ 意図的低値 |
| Lines      | 11.91% | 80%  | ⚠️ 意図的低値 |

## カバレッジが低い理由（意図的）

このテストは **「チャンネル登録の静的検証」** を目的としており、ハンドラの内部ロジックはテスト対象外。

- `ipcMain.handle` がモックされているためハンドラ本体（各 async 関数）は実行されない
- `unregisterRuntimeSkillCreatorHandlers()` は呼び出さない
- ハンドラ動作テストは既存テスト群（`creatorHandlers.*.test.ts`）が担当

## 全テストスイートでのカバレッジ

`creatorHandlers.ts` 全体のカバレッジは既存のテスト群（`creatorHandlers.adapterStatus.test.ts`, `creatorHandlers.test.ts` 等）によって確保済み。本タスクのテストはチャンネル登録の静的検証のみを担う。

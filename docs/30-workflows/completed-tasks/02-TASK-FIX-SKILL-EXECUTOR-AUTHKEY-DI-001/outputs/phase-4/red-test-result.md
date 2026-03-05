# Phase 4 Redテスト結果

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
```

## 結果

- ステータス: **Fail（想定通り Red）**
- 失敗件数: 1
- 対象: `IPC Handler Double Registration Prevention > auth-key handlers lifecycle > registerAllIpcHandlers が registerSkillHandlers に authKeyService を注入する`

## 主要失敗ログ

- 期待: `registerSkillHandlers(mockWindow, anything, anything)`
- 実際: `registerSkillHandlers(mockWindow, {})`
- 差分: 第3引数 `authKeyService` が未注入

## 判定

- Red固定完了。Phase 5 で `skillHandlers.ts` / `ipc/index.ts` のDI配線修正を実施する。

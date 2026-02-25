# Phase 6: テスト拡充レポート

## 担当

- SubAgent-B（テスト拡充）

## 目的

Phase 5 の契約変更（`execute` unwrap / `remove` 戻り値同期）に追従し、契約ドリフトを検出できるテストへ更新する。

## 実施内容

### 1. Preload テスト更新

- `apps/desktop/src/preload/__tests__/skill-api.test.ts`
  - `RemoveResult` fixture を追加。
  - `remove()` の期待値を `void` から `RemoveResult` へ更新。
  - `execute()` 関連モックを wrapper 形式 `{ success: true, data: ... }` に更新。
- `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`
  - `execute()` モックを wrapper 形式へ更新。
  - `remove()` の期待値を `RemoveResult` へ更新。

### 2. 失敗再現からの復旧

- 修正前: `skill-api.unification.test.ts` で 3件失敗（`execute` の unwrap 前提不一致）。
- 修正後: 3件解消。

## 実行コマンドと結果

```bash
corepack pnpm --dir apps/desktop exec vitest run \
  src/preload/__tests__/skill-api.test.ts \
  src/preload/__tests__/skill-api.unwrap.test.ts \
  src/preload/__tests__/skill-api.unification.test.ts
```

- 結果: **PASS**（3 files, 133 tests）

```bash
corepack pnpm --dir apps/desktop exec vitest run \
  src/main/ipc/__tests__/skillHandlers.test.ts \
  src/main/ipc/__tests__/skillHandlers.execute.test.ts \
  src/main/ipc/__tests__/skillHandlers.validation.test.ts
```

- 結果: **PASS**（3 files, 145 tests）

```bash
corepack pnpm --dir apps/desktop exec vitest run \
  src/renderer/hooks/__tests__/useSkillExecution.test.ts \
  src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts \
  src/renderer/store/slices/__tests__/agentSlice.execution.test.ts
```

- 結果: **PASS**（3 files, 116 tests）

## 判定

- [x] 契約ドリフト検出テストを実更新。
- [x] Main/Preload/Renderer の関連テスト回帰なし。
- [x] Phase 7（カバレッジ確認）へ遷移可能。

# Phase 5: 実装

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 5                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

`apps/desktop/src/main/ipc/index.ts` の1箇所を修正し、`RuntimeSkillCreatorFacade` に `skillFileManager`、`llmAdapter`、`resourceLoader` を注入する。

## 実行タスク

### Task 1: import 文の追加

`apps/desktop/src/main/ipc/index.ts` の import セクションに以下を追加する:

```typescript
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import type { ILLMAdapter } from "../adapters/llm/types";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
```

追加位置: 既存の import 文群の末尾（ただし、同カテゴリの import と近くに配置する）。

### Task 2: track() ブロックの修正

`apps/desktop/src/main/ipc/index.ts` L889-909 を以下のように修正する:

**修正手順**:

1. `track("registerSkillCreatorHandlers", () => {` を `track("registerSkillCreatorHandlers", async () => {` に変更
2. `const skillExecutor = getSkillExecutorInstance();` の後に LLM アダプター取得ロジックを追加
3. `ResourceLoader` のインスタンス化を追加
4. `RuntimeSkillCreatorFacade` のコンストラクタ引数に3依存を追加

**具体的な変更内容**:

```typescript
track("registerSkillCreatorHandlers", async () => {
  const skillCreatorService = new SkillCreatorService();
  const skillExecutor = getSkillExecutorInstance();
  if (!skillExecutor) {
    console.warn(
      "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
    );
  }

  // LLM アダプター取得（API キー未設定時は undefined にフォールバック）
  let llmAdapter: ILLMAdapter | undefined;
  try {
    llmAdapter = await LLMAdapterFactory.getAdapter("anthropic");
  } catch {
    console.warn(
      "[IPC] LLM adapter not available (API key may not be set), skill creator LLM features will be degraded",
    );
  }

  // ResourceLoader: skill-creator リソース読み込み基盤
  const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);

  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
        llmAdapter,
        resourceLoader,
        skillFileManager,
      })
    : undefined;
  registerSkillCreatorHandlers(
    mainWindow,
    skillCreatorService,
    runtimeSkillCreatorService,
  );
});
```

### Task 3: track() 関数の async 対応確認

`track()` 関数がコールバックの `Promise` を正しく処理するか確認する。処理しない場合は、以下の代替パターンを使用する:

```typescript
track("registerSkillCreatorHandlers", () => {
  // 内部で即時実行 async 関数を使用
  void (async () => {
    // ... async ロジック
  })();
});
```

この場合、ハンドラ登録が非同期完了を待たずに `track()` が返る可能性がある。`registerSkillCreatorHandlers` の呼び出しが即時実行 async の内部にある限り、ハンドラ登録完了前に IPC 呼び出しが到達するリスクは低い（Electron の Main Process は起動シーケンス完了後に Renderer を起動するため）。

### Task 4: 実装後の型チェック

```bash
cd apps/desktop && pnpm typecheck
```

### Task 5: 実装後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

## 参照資料

- Phase 2 設計（`phase-02-design.md`）
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`
- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
- `apps/desktop/src/main/services/skill/constants.ts`

## 成果物

- `apps/desktop/src/main/ipc/index.ts` の修正済みファイル

## 完了条件

- [ ] import 文を4行追加した
- [ ] `track("registerSkillCreatorHandlers", ...)` ブロックを修正した
- [ ] `RuntimeSkillCreatorFacade` のコンストラクタに `llmAdapter`、`resourceLoader`、`skillFileManager` を注入した
- [ ] `pnpm typecheck` がエラーなしで完了した
- [ ] 既存テストが全て PASS した

## 次のPhase

Phase 6: テスト拡充

# UT-SC-03-003: DI Wiring Implementation Guide

## Part 1: 中学生レベル概念説明

### レストランの厨房で理解する DI 配線

レストランの厨房（RuntimeSkillCreatorFacade）では、シェフが料理を作ります。

**開店準備でそろえるもの（コンストラクタ注入）:**

- 包丁やまな板（SkillExecutor）= 最初から厨房にある
- レシピ本（ResourceLoader）= 開店前に本棚に並べられる
- 保存容器（SkillFileWriter）= 最初から棚にある

**配達で届くもの（Setter Injection）:**

- 特別な電動ミキサー（LLMAdapter）= 業者から配達される

配達が届いたら、スタッフが「これ使ってください」とシェフに渡します（`setLLMAdapter()`）。

**配達が届く前にお客さんが来たら？**
シェフは手動で代替調理します（graceful degradation = スタブ応答）。配達が届いた後は電動ミキサーを使った本格的な料理を提供します。

### ポイント

- 最初から持てるもの → コンストラクタで渡す（Constructor Injection）
- 後から届くもの → 届いてから渡す（Setter Injection）
- 届く前でも注文には応じる → graceful degradation

## Part 2: 開発者向け技術詳細

### 変更概要

| ファイル                       | 変更内容                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts` | `llmAdapter` の `readonly` 解除 + `setLLMAdapter()` 追加         |
| `ipc/index.ts`                 | `ResourceLoader` 生成 + fire-and-forget async で LLMAdapter 注入 |

### setLLMAdapter() メソッド

```typescript
setLLMAdapter(adapter: ILLMAdapter): void {
  this.llmAdapter = adapter;
}
```

- **引数型**: `ILLMAdapter`（インターフェース — DIP 準拠）
- **冪等性**: 複数回呼び出し可。最後の adapter が使用される
- **P34 準拠**: `LLMAdapterFactory.getAdapter()` が非同期のため Setter Injection を採用

### ipc/index.ts の fire-and-forget 配線

```typescript
const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
    })
  : undefined;

if (runtimeSkillCreatorService) {
  void (async () => {
    try {
      const adapter = await LLMAdapterFactory.getAdapter("anthropic");
      runtimeSkillCreatorService.setLLMAdapter(adapter);
    } catch (error: unknown) {
      console.warn(
        "[IPC] LLMAdapter initialization failed, ...",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  })();
}
```

### readonly 解除のトレードオフ

- `private readonly llmAdapter` → `private llmAdapter`
- 型安全性の低下は最小限（setter は `ILLMAdapter` 型のみ受け付け）
- `setLLMAdapter()` の呼び出し元は `ipc/index.ts` の1箇所のみ

### テスト追加

| TC   | 内容                                | ファイル                             |
| ---- | ----------------------------------- | ------------------------------------ |
| TC-1 | setLLMAdapter() 注入後の LLM 使用   | RuntimeSkillCreatorFacade.test.ts    |
| TC-2 | 未呼び出し時の graceful degradation | RuntimeSkillCreatorFacade.test.ts    |
| TC-3 | 冪等性（複数回呼び出し）            | RuntimeSkillCreatorFacade.test.ts    |
| TC-4 | ResourceLoader コンストラクタ注入   | RuntimeSkillCreatorFacade.test.ts    |
| TC-5 | DI 配線統合テスト                   | skillCreatorHandlers.runtime.test.ts |
| TC-6 | getAdapter 失敗時の degradation     | skillCreatorHandlers.runtime.test.ts |
| TC-7 | undefined 注入で degradation 復帰   | RuntimeSkillCreatorFacade.test.ts    |
| TC-8 | plan() 中の setLLMAdapter() 安全性  | RuntimeSkillCreatorFacade.test.ts    |
| TC-9 | 不正パス ResourceLoader エラー伝播  | RuntimeSkillCreatorFacade.test.ts    |

### カバレッジ結果

| 指標     | 値     | 基準 |
| -------- | ------ | ---- |
| Line     | 83.39% | 80%+ |
| Branch   | 86.11% | 60%+ |
| Function | 93.33% | 80%+ |

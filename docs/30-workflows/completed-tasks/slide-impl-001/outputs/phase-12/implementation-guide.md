# UT-SLIDE-IMPL-001 実装ガイド

## Part 1: 概念説明（中学生レベル）

### ModifierResponse 拡張

テストの答案に先生がコメントを書き加えるようなもの。元の答案（success/changes/error）はそのままで、新しいコメント欄（`fallback_reason`/`suggested_action`）を追加した。

- `fallback_reason`: 「なぜ自動で処理できなかったか」の理由メモ
- `suggested_action`: 「代わりにこうしてください」という提案メモ

### SlideCapabilityDTO + IPC

アプリのヘルスチェックカード。今の状態（synced/running/degraded/guidance）を窓口（IPC）で確認できるようにした。

- `lane`: 「自動レーン」か「手動レーン」か（integrated/manual）
- `apiKeySource`: APIキーがどこから来たか（safeStorage/env/none）
- `uiStatus`: 画面に表示する状態（synced/running/degraded/guidance）

### Agent SDK adapter

翻訳者を間に入れるようなもの。直接外国語で会話していたのを、専門の翻訳者（adapter）経由に変更した。

- `IAuthKeyService`: APIキーの管理者
- `RuntimePolicyResolver`: どのレーンで実行するかの判定者
- `AgentSDKAdapter`: LLM呼び出しの翻訳者

## Part 2: 開発者向け実装詳細

### 変更ファイル一覧

| ファイル                                                | 変更内容                                                                                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/slide/types.ts`                    | ModifierResponse拡張、SlideLane/ApiKeySource/SlideUIStatus/SlideCapabilityDTO追加                                                              |
| `packages/shared/src/slide/index.ts`                    | 新規型のre-export追加                                                                                                                          |
| `apps/desktop/src/main/slide/agent-client.ts`           | DI interfaces (IAuthKeyService, RuntimePolicyResolver, AgentSDKAdapter, AgentClientDependencies) + createModifierAgentAPI() ファクトリ関数追加 |
| `apps/desktop/src/main/slide/modifier-skill.ts`         | ローカル型定義→shared import移行、parseModifierResponse拡張フィールド対応                                                                      |
| `apps/desktop/src/main/slide/ipc-handlers.ts`           | CAPABILITY_GET追加、resolveSlideCapability()、P42 3段バリデーション handler                                                                    |
| `apps/desktop/src/preload/channels.ts`                  | SLIDE_CAPABILITY_GET定数追加、ALLOWED_INVOKE_CHANNELS登録                                                                                      |
| `apps/desktop/src/preload/index.ts`                     | slideApi.getCapability()追加                                                                                                                   |
| `apps/desktop/src/preload/types.ts`                     | SlideCapabilityDTO import + SlideApi interface拡張                                                                                             |
| `apps/desktop/src/renderer/phase11-ut-slide-ui-001.tsx` | getCapability モック追加（型整合性維持）                                                                                                       |

### IPC channel 登録手順

1. `channels.ts` に `SLIDE_CAPABILITY_GET: "slide:capability:get"` 定数追加
2. `ALLOWED_INVOKE_CHANNELS` に追加
3. `ipc-handlers.ts` の `SLIDE_INVOKE_CHANNELS` に `CAPABILITY_GET` 追加
4. handler を `registerSlideIpcHandlers()` 内に実装
5. `unregisterSlideIpcHandlers()` に `removeHandler` 追加
6. `preload/index.ts` に `getCapability` メソッド追加
7. `preload/types.ts` の `SlideApi` interface に型定義追加

### DI パターンの使い方

```typescript
// プロダクション: デフォルトの Anthropic SDK adapter を使用
const api = createModifierAgentAPI({
  authKeyService: realAuthKeyService,
  runtimeResolver: realRuntimeResolver,
});

// テスト: モック adapter を注入
const api = createModifierAgentAPI({
  authKeyService: mockAuthKeyService,
  runtimeResolver: mockRuntimeResolver,
  agentSDKAdapter: mockAdapter, // モック注入
});
```

### テスト実行方法

```bash
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/
```

### カバレッジ

| ファイル        | Line   | Branch | Function |
| --------------- | ------ | ------ | -------- |
| agent-client.ts | 85.97% | 69.44% | 82.35%   |
| ipc-handlers.ts | 85.35% | 89.02% | 87.50%   |
| channels.ts     | 100%   | 100%   | 100%     |

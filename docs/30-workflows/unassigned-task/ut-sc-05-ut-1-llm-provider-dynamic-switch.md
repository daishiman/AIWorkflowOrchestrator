# UT-SC-05-UT-1: LLMプロバイダー動的切替（APIキー設定後のアプリ再起動不要化）

## メタ情報

```yaml
issue_number: 1601
```

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | UT-SC-05-UT-1                   |
| 検出元   | UT-SC-05-IPC-DI-WIRING Phase 12 |
| 優先度   | HIGH                            |
| 影響     | LLMプロバイダー選択の柔軟性向上 |
| 検出日   | 2026-03-24                      |

## 概要

`apps/desktop/src/main/ipc/index.ts` の `LLMAdapterFactory.getAdapter("anthropic")` がAnthropicをハードコードしており、ユーザーが選択したLLMプロバイダーに動的に切り替える仕組みがない。APIキー設定変更後にアプリを再起動せずにプロバイダーを切り替えられるようにする。

## 現状

```typescript
// apps/desktop/src/main/ipc/index.ts L914-926
void (async () => {
  try {
    const adapter = await LLMAdapterFactory.getAdapter("anthropic"); // Anthropic固定
    runtimeSkillCreatorService.setLLMAdapter(adapter);
  } catch {
    console.warn("[IPC] LLM adapter not available");
  }
})();
```

## 期待される修正

- ユーザーの設定（SecureStorage等）からプロバイダー名を動的取得
- APIキー保存・削除時の `LLMAdapterFactory.clearInstance()` 連携
- `RuntimeSkillCreatorFacade.setLLMAdapter()` を再呼び出しして動的切替

## 影響範囲

- `apps/desktop/src/main/ipc/index.ts`（Setter Injection IIFE）
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`（clearInstance連携）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（setLLMAdapter再呼出し）

## 関連仕様

- P34: 遅延初期化 DI パターン
- `api-ipc-system-core.md` L365: apiKey save/delete 後の clearInstance 仕様

## リスク

- APIキー変更中のリクエスト競合
- プロバイダー切替中のGraceful Degradation発動

## 見積もり

小〜中規模（3-5ファイル修正）

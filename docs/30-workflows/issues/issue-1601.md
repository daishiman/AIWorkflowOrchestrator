# [#1601] [UT-SC-05-UT-1] LLMプロバイダー動的切替（APIキー設定後のアプリ再起動不要化）

## メタ情報

```yaml
task_id: UT-SC-05-UT-1
task_name: UT
category: -
target_feature: -
priority: HIGH
scale: -
status: 未実施
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/ut-sc-05-ut-1-llm-provider-dynamic-switch.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | HIGH   |
| 規模       | -      |
| ステータス | 未実施 |

---

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

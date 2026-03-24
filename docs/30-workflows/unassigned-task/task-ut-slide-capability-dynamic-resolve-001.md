# UT-SLIDE-CAPABILITY-DYNAMIC-001: resolveSlideCapability 動的実装

## メタ情報

```yaml
issue_number: 1560
```

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | UT-SLIDE-CAPABILITY-DYNAMIC-001               |
| 優先度     | medium                                        |
| 検出元     | UT-SLIDE-IMPL-001 Phase 5 Task 4              |
| 検出日     | 2026-03-24                                    |
| 前提タスク | UT-SLIDE-IMPL-001（完了）                     |
| 影響範囲   | `apps/desktop/src/main/slide/ipc-handlers.ts` |

## 目的

`resolveSlideCapability()` 関数を静的スタブから動的実装に移行する。
現在は `{ lane: "integrated", apiKeySource: "env", uiStatus: "synced" }` を固定返却しているが、
実際の `IAuthKeyService` / `RuntimePolicyResolver` / Agent SDK adapter の状態に基づいて
`SlideCapabilityDTO` を動的に算出する。

## 背景

UT-SLIDE-IMPL-001 の Phase 2 Task 5 で状態遷移根拠テーブルが設計済み:

| apiKeySource | adapterStatus | 決定される uiStatus | 根拠                                |
| ------------ | ------------- | ------------------- | ----------------------------------- |
| `"none"`     | any           | `"guidance"`        | API key 未設定では LLM 呼び出し不可 |
| any          | `"error"`     | `"degraded"`        | adapter エラーで機能制限            |
| any          | `"running"`   | `"running"`         | LLM 処理実行中                      |
| valid        | `"idle"`      | `"synced"`          | 正常状態                            |

Phase 5 実装では意図的にスコープ外とし、静的スタブで AC-5 を部分的に充足した。

## 実装要件

### 必須チェック項目（Phase 5 Task 4 未完了分）

1. `sessionId` から `RuntimePolicyResolver` 経由で lane を判定
2. `IAuthKeyService` 経由で apiKeySource を取得
3. uiStatus を現在の実行状態から算出（上記状態遷移根拠テーブルに従う）
4. `apiKeySource === "none"` の場合 `uiStatus: "guidance"` を返す（P62 対策）
5. エラー時に `blockedReason` を設定する

### DI 設計

```typescript
// ipc-handlers.ts 内の resolveSlideCapability を以下に置換

interface SlideCapabilityDeps {
  authKeyService: IAuthKeyService;
  runtimeResolver: RuntimePolicyResolver;
  agentSDKAdapter: AgentSDKAdapter;
}

function resolveSlideCapability(
  sessionId: string,
  deps: SlideCapabilityDeps,
): SlideCapabilityDTO {
  const apiKeySource = deps.authKeyService.getKeySource("anthropic");
  if (apiKeySource === "none") {
    return {
      lane: "manual",
      apiKeySource: "none",
      uiStatus: "guidance",
      blockedReason: "API key not configured",
    };
  }

  const adapterStatus = deps.agentSDKAdapter.getStatus();
  if (adapterStatus === "error") {
    return {
      lane: "manual",
      apiKeySource,
      uiStatus: "degraded",
      blockedReason: "Agent SDK adapter error",
    };
  }
  if (adapterStatus === "running") {
    return { lane: "integrated", apiKeySource, uiStatus: "running" };
  }
  return { lane: "integrated", apiKeySource, uiStatus: "synced" };
}
```

### 型拡張（必要に応じて）

`SlideCapabilityDTO` に `blockedReason?: string` が未定義の場合、`packages/shared/src/slide/types.ts` に追加が必要。

## テスト要件

- 状態遷移根拠テーブルの4パターンを網羅するユニットテスト
- `IAuthKeyService` / `RuntimePolicyResolver` / `AgentSDKAdapter` のモック注入テスト
- P62 対策: `apiKeySource === "none"` で `guidance` が返ることの検証
- エラー時の `blockedReason` 設定検証

## 参照資料

| 資料名                 | パス                                                         |
| ---------------------- | ------------------------------------------------------------ |
| Phase 2 設計（Task 5） | `docs/30-workflows/slide-impl-001/outputs/phase-2/design.md` |
| Phase 5 実装仕様       | `docs/30-workflows/slide-impl-001/phase-5-implementation.md` |
| 現在の静的スタブ       | `apps/desktop/src/main/slide/ipc-handlers.ts` L139-147       |
| P62 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md` P62                     |

## 完了条件

- [ ] `resolveSlideCapability()` が `IAuthKeyService` / `RuntimePolicyResolver` を使用して動的に `SlideCapabilityDTO` を返す
- [ ] 状態遷移根拠テーブルの全4パターンが正しく動作する
- [ ] P62 対策が実装されている（fallback なし）
- [ ] `blockedReason` がエラー時に設定される
- [ ] テストカバレッジが Line 80% / Branch 60% 以上

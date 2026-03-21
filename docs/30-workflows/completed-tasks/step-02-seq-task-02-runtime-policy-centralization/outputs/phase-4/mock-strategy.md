# Phase 4: モック境界定義 - Runtime Policy Centralization

## メタ情報

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| タスクID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                       |
| 作成日   | 2026-03-21                                                       |
| 前提     | Phase 2 design-summary.md, Phase 4 resolve-signature-decision.md |

---

## 1. RuntimePolicyResolver モック境界

### 目的

Unit テストで policy 判定ロジックのみを検証する際の差し替え点を定義する。

### モック境界

```
[IPC ハンドラー] ──resolve()──> [IRuntimePolicyResolver] ──判定ロジック──> [RuntimeDecision]
                                     ^
                                     |
                              ここをモック差し替え
```

### モック定義

```typescript
// Unit テスト用モック
const mockRuntimePolicyResolver: IRuntimePolicyResolver = {
  resolve: vi.fn().mockResolvedValue({
    type: "integrated_api",
    apiKey: "sk-test-key",
  }),
};

// terminal_handoff ケース用
const mockHandoffResolver: IRuntimePolicyResolver = {
  resolve: vi.fn().mockResolvedValue({
    type: "terminal_handoff",
    bundle: {
      launcher: "claude",
      promptBundle: "test prompt",
      cwd: "/tmp",
      suggestedCommand: "claude chat",
      manualRetryRule: "retry with API key",
    },
  }),
};
```

### 差し替え方針

| テスト種別  | モック対象                             | 理由                                            |
| ----------- | -------------------------------------- | ----------------------------------------------- |
| Unit        | `IRuntimePolicyResolver` 全体          | 判定ロジックの入出力を直接制御するため          |
| Integration | `IAuthModeService` + `IAuthKeyService` | ハンドラー -> Resolver -> Decision の結合を検証 |

### 注意事項

- `resolveWithService()` はインターフェースに含まれないため、モック対象にしない
- `resolve()` の引数（authMode, apiKey）はテストケースで直接指定する（M-2 確定シグネチャ準拠）

---

## 2. TerminalHandoffBuilder モック境界

### 目的

handoff bundle 生成を切り離し、`buildForSurface()` の入出力契約を独立検証する。

### モック境界

```
[IPC ハンドラー] ──decision.type === "terminal_handoff"──> [TerminalHandoffBuilder.buildForSurface()]
                                                               ^
                                                               |
                                                        ここをモック差し替え
```

### モック定義

```typescript
// Unit テスト用モック
const mockTerminalHandoffBuilder = {
  build: vi.fn().mockReturnValue({
    launcher: "claude",
    promptBundle: "test",
    cwd: "/tmp",
    suggestedCommand: "claude chat",
    manualRetryRule: "retry",
  }),
  buildForSurface: vi.fn().mockReturnValue({
    terminalCommand: "claude --resume",
    contextSummary: "surface=agent, prompt=test",
    reason: "subscription mode",
  }),
  buildForAgentExecution: vi.fn(), // deprecated - テスト対象外
  buildForSkillExecution: vi.fn(), // deprecated - テスト対象外
};
```

### 差し替え方針

| テスト種別  | モック対象                    | 理由                                                        |
| ----------- | ----------------------------- | ----------------------------------------------------------- |
| Unit        | `TerminalHandoffBuilder` 全体 | `HandoffGuidance` の必須フィールド存在を検証するため        |
| Integration | 実体を使用（モック不要）      | surface 横断でも `buildForSurface()` の実際の出力を検証する |

### 注意事項

- `buildForAgentExecution` / `buildForSkillExecution` は deprecated のためテスト対象としない
- `surfaceType` 引数が `SurfaceType` 型の有効な値のみ受け入れることを型レベルで検証する
- `HandoffGuidance` の 3 必須フィールド（terminalCommand / contextSummary / reason）が string 型であることを runtime で検証する

---

## 3. Health Route モック境界

### 目的

IPC 経由の health check 応答を制御し、`llm:check-health` と `AI_CHECK_CONNECTION` の動作を独立検証する。

### モック境界

```
[Renderer llmSlice.checkHealth()] ──IPC──> [llm:check-health ハンドラー] ──> [LLM Provider]
                                                                               ^
                                                                               |
                                                                       ここをモック差し替え
                                                                    （LLM Provider 接続を制御）
```

### モック定義

```typescript
// healthy レスポンス
const mockHealthyResult: HealthCheckResult = {
  status: "healthy",
  providerId: "openai",
  errorMessage: null,
  checkedAt: Date.now(),
};

// unhealthy レスポンス
const mockUnhealthyResult: HealthCheckResult = {
  status: "unhealthy",
  providerId: "openai",
  errorMessage: "Invalid API key",
  checkedAt: Date.now(),
};

// unknown レスポンス（タイムアウト等）
const mockUnknownResult: HealthCheckResult = {
  status: "unknown",
  providerId: "openai",
  errorMessage: "Connection timeout",
  checkedAt: Date.now(),
};

// legacy route（AI_CHECK_CONNECTION）
const mockLegacyResponse = {
  status: "disconnected",
};
```

### 差し替え方針

| テスト種別  | モック対象                           | 理由                                                        |
| ----------- | ------------------------------------ | ----------------------------------------------------------- |
| Unit        | LLM Provider 接続層                  | health check ハンドラーの応答変換ロジックを検証するため     |
| Integration | IPC チャンネル（`llm:check-health`） | Renderer -> Main -> Provider の結合を検証するため           |
| Manual      | モック不使用                         | 実際のプロバイダーに接続して `HealthCheckResult` を確認する |

### 注意事項

- `AI_CHECK_CONNECTION` は legacy のため新規テストではモック不要（既存テストの動作確認のみ）
- `checkedAt` の値は `Date.now()` 付近であることをアサートする（厳密一致ではなく ±1000ms の範囲チェック）
- health check 結果を runtime 判定に流用するテストケースは作成しない（FR-4 禁止事項）

---

## 4. 境界間の依存関係

```
[RuntimePolicyResolver] ──depends──> [IAuthModeService] + [IAuthKeyService]
        |
        | type === "terminal_handoff"
        v
[TerminalHandoffBuilder] ──depends──> (なし。純粋変換)
        |
        | HandoffGuidance を返す
        v
[IPC ハンドラー] ──sanitize──> [Renderer]
        |
        | health は独立
        v
[Health Route] ──depends──> [LLM Provider 接続層]
```

### テスト分離の原則

1. **RuntimePolicyResolver** のテストでは `TerminalHandoffBuilder` をモックする（bundle 生成ロジックと分離）
2. **TerminalHandoffBuilder** のテストでは `RuntimePolicyResolver` に依存しない（独立した入出力テスト）
3. **Health Route** のテストでは `RuntimePolicyResolver` と `TerminalHandoffBuilder` の両方から独立（health は policy 判定に影響しない）
4. **Integration テスト**のみが上記 3 境界を結合する

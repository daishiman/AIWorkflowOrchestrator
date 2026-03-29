# Phase 2: 設計

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 2                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

`RuntimeSkillCreatorFacade` のステータスプロパティ設計、`plan()` のエラーレスポンス分岐設計、`ipc/index.ts` のステータス更新コールバック設計、IPC レスポンス拡張設計を行う。

## 実行タスク

- `LLMAdapterStatus` 型と Facade プロパティを設計する
- `plan()` のエラーレスポンス分岐を設計する
- `ipc/index.ts` のステータス更新フローを設計する
- IPC レスポンスへのステータス付与を設計する

## 参照資料

| 資料名       | パス                                                                  | 説明                             |
| ------------ | --------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件 | `phase-1-requirements.md`                                             | ステータス・エラーレスポンス要件 |
| IPC 初期化   | `apps/desktop/src/main/ipc/index.ts` (934-946行)                      | fire-and-forget 初期化           |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 現行 plan() 実装                 |
| 型定義       | `packages/shared/src/types/skillCreator.ts`                           | レスポンス型                     |
| preload API  | `apps/desktop/src/preload/skill-creator-api.ts`                       | preload 層                       |

### 現行コードアンカー

| ファイル                                                              | 設計観点                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `setLLMAdapter()` メソッドの既存パターンを踏襲          |
| `apps/desktop/src/main/ipc/index.ts` (934-946行)                      | fire-and-forget の catch ブロックにステータス更新を追加 |
| `packages/shared/src/types/skillCreator.ts`                           | `RuntimeSkillCreatorPlanResponse` の拡張点              |

## 実行手順

### ステップ1: LLMAdapterStatus 型と Facade プロパティを設計する

**型定義（shared types）**:

```typescript
/** LLMAdapter の初期化ステータス */
type LLMAdapterStatus = "ready" | "initializing" | "failed";
```

**Facade プロパティ**:

```typescript
class RuntimeSkillCreatorFacade {
  // 新規追加
  private _llmAdapterStatus: LLMAdapterStatus = "initializing";
  private _llmAdapterFailureReason: string | null = null;

  /** LLMAdapter の現在のステータスを取得する */
  get llmAdapterStatus(): LLMAdapterStatus {
    return this._llmAdapterStatus;
  }

  /** LLMAdapter 初期化失敗時の理由を取得する */
  get llmAdapterFailureReason(): string | null {
    return this._llmAdapterFailureReason;
  }

  /** 既存メソッドの拡張: ステータスを "ready" に遷移 */
  setLLMAdapter(adapter: LLMAdapter): void {
    this.llmAdapter = adapter;
    this._llmAdapterStatus = "ready";
    this._llmAdapterFailureReason = null;
  }

  /** 新規メソッド: 初期化失敗を記録 */
  setLLMAdapterFailed(reason: string): void {
    this._llmAdapterStatus = "failed";
    this._llmAdapterFailureReason = reason;
  }
}
```

- 初期値は `"initializing"`（Facade 生成直後）
- `setLLMAdapter()` 成功時に `"ready"` へ遷移
- `setLLMAdapterFailed()` で `"failed"` へ遷移し、理由を保持

### ステップ2: plan() のエラーレスポンス分岐を設計する

```typescript
async plan(input: RuntimeSkillCreatorPlanInput): Promise<RuntimeSkillCreatorPlanResponse> {
  // 新規追加: アダプターステータスチェック
  if (this._llmAdapterStatus === "failed") {
    return {
      success: false,
      error: this._llmAdapterFailureReason
        ?? "LLMAdapter の初期化に失敗しました",
      errorCode: "LLM_ADAPTER_FAILED",
      adapterStatus: this._llmAdapterStatus,
    };
  }

  if (this._llmAdapterStatus === "initializing") {
    return {
      success: false,
      error: "LLMAdapter の初期化中です。しばらくお待ちください",
      errorCode: "LLM_ADAPTER_INITIALIZING",
      adapterStatus: this._llmAdapterStatus,
    };
  }

  // 既存の plan ロジック...
}
```

**エラーコード体系**:

| errorCode                  | 状態             | メッセージ例                                                  |
| -------------------------- | ---------------- | ------------------------------------------------------------- |
| `LLM_ADAPTER_FAILED`       | `"failed"`       | APIキーを設定してください / LLMAdapter の初期化に失敗しました |
| `LLM_ADAPTER_INITIALIZING` | `"initializing"` | LLMAdapter の初期化中です。しばらくお待ちください             |

**actionable メッセージの判定ロジック**:

- 失敗理由に "API key" / "api_key" / "ANTHROPIC_API_KEY" が含まれる場合: 「APIキーを設定してください」
- それ以外: 保持された失敗理由をそのまま返す

### ステップ3: ipc/index.ts のステータス更新フローを設計する

```typescript
// 現行コード (934-946行) の改修案
if (runtimeSkillCreatorService) {
  void (async () => {
    try {
      const adapter = await LLMAdapterFactory.getAdapter("anthropic");
      runtimeSkillCreatorService.setLLMAdapter(adapter);
      // ↑ setLLMAdapter 内で status = "ready" に遷移
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn("[IPC] LLMAdapter initialization failed:", reason);
      runtimeSkillCreatorService.setLLMAdapterFailed(reason);
      // ↑ 新規: status = "failed" に遷移し、理由を保持
    }
  })();
}
```

- fire-and-forget パターンは維持する（`void` キーワード保持）
- catch ブロックに `setLLMAdapterFailed()` を追加するのみ
- `console.warn` も維持（ログ出力は引き続き有用）

### ステップ4: IPC レスポンスへのステータス付与を設計する

**レスポンス型の拡張**:

```typescript
// packages/shared/src/types/skillCreator.ts
interface RuntimeSkillCreatorPlanResponse {
  success: boolean;
  // 既存フィールド...
  plan?: RuntimeSkillCreatorPlan;
  // 新規追加
  error?: string;
  errorCode?: string;
  adapterStatus?: LLMAdapterStatus;
}
```

- `adapterStatus` は optional フィールドとして追加（後方互換）
- エラー時は `success: false` + `error` + `errorCode` + `adapterStatus`
- 正常時は既存レスポンスに `adapterStatus: "ready"` を追加

## 統合テスト連携

- Phase 4 でステータス遷移（initializing → ready、initializing → failed）の test case を作成する
- Phase 4 で plan() の各ステータスに対するレスポンスの test case を作成する
- Phase 6 で setLLMAdapter / setLLMAdapterFailed の連続呼び出し edge case を追加する
- Phase 9 で既存の plan() テストとの互換性を監査する

## 成果物

| 成果物                 | パス                                        | 説明                             |
| ---------------------- | ------------------------------------------- | -------------------------------- |
| 設計書                 | `phase-2-design.md`                         | ステータス・エラーレスポンス設計 |
| adapter status 設計    | `outputs/phase-2/adapter-status-design.md`  | ステータス遷移図と Facade API    |
| error response catalog | `outputs/phase-2/error-response-catalog.md` | エラーコード・メッセージ一覧     |

## 完了条件

- [ ] `LLMAdapterStatus` 型と Facade プロパティが設計されている
- [ ] `plan()` のエラーレスポンス分岐が errorCode 付きで設計されている
- [ ] `ipc/index.ts` の改修箇所が fire-and-forget 維持で設計されている
- [ ] IPC レスポンス拡張が後方互換で設計されている
- [ ] **本Phase内の全タスクを100%実行完了**

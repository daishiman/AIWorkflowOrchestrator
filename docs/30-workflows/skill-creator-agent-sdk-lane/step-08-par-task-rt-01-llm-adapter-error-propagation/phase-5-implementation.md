# Phase 5: 実装

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 5                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

`LLMAdapterStatus` 型定義、Facade のステータスプロパティ追加、`plan()` のエラーレスポンス分岐、`ipc/index.ts` のステータス更新コールバック、IPC レスポンス拡張を実装する。

## 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `LLMAdapterStatus` 型追加、`RuntimeSkillCreatorPlanResponse` に optional フィールド追加
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — ステータスプロパティ、`setLLMAdapterFailed()`、`plan()` エラー分岐
- `apps/desktop/src/main/ipc/index.ts` (934-946行) — catch ブロックに `setLLMAdapterFailed()` 追加
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` — テストケース追加

## 実装しないこと

- fire-and-forget パターン自体の変更
- UI / renderer 側のエラー表示（TASK-RT-02 の責務）
- LLMAdapterFactory のリトライロジック
- preload API の新規チャネル追加
- API キー管理機能

## 実行タスク

- shared type に `LLMAdapterStatus` を追加する
- `RuntimeSkillCreatorPlanResponse` にエラー関連フィールドを追加する
- Facade にステータスプロパティとメソッドを追加する
- `plan()` にエラーレスポンス分岐を追加する
- `ipc/index.ts` の catch ブロックにステータス更新を追加する
- ユニットテストを作成する

## 参照資料

| 資料名                 | パス                                        | 説明              |
| ---------------------- | ------------------------------------------- | ----------------- |
| Phase 2 設計           | `phase-2-design.md`                         | Facade / IPC 設計 |
| error response catalog | `outputs/phase-2/error-response-catalog.md` | エラーコード一覧  |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`            | test case 一覧    |
| 型定義                 | `packages/shared/src/types/skillCreator.ts` | 現行型定義        |

## 実行手順

### ステップ1: shared type を拡張する

`packages/shared/src/types/skillCreator.ts`:

```typescript
// 新規追加
export type LLMAdapterStatus = "ready" | "initializing" | "failed";
```

### ステップ2: RuntimeSkillCreatorPlanResponse を拡張する

```typescript
// Before（既存フィールドは維持）
export interface RuntimeSkillCreatorPlanResponse {
  success: boolean;
  plan?: RuntimeSkillCreatorPlan;
  // ...
}

// After（optional フィールドを追加）
export interface RuntimeSkillCreatorPlanResponse {
  success: boolean;
  plan?: RuntimeSkillCreatorPlan;
  // 新規追加
  error?: string;
  errorCode?: string;
  adapterStatus?: LLMAdapterStatus;
  // ...
}
```

既存の正常レスポンスへの影響がないことを確認する（全て optional）。

### ステップ3: Facade にステータスプロパティを追加する

`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`:

```typescript
private _llmAdapterStatus: LLMAdapterStatus = "initializing";
private _llmAdapterFailureReason: string | null = null;

get llmAdapterStatus(): LLMAdapterStatus {
  return this._llmAdapterStatus;
}

get llmAdapterFailureReason(): string | null {
  return this._llmAdapterFailureReason;
}
```

### ステップ4: setLLMAdapter() を拡張し、setLLMAdapterFailed() を追加する

```typescript
// 既存メソッドの拡張
setLLMAdapter(adapter: LLMAdapter): void {
  this.llmAdapter = adapter;
  this._llmAdapterStatus = "ready";
  this._llmAdapterFailureReason = null;
}

// 新規メソッド
setLLMAdapterFailed(reason: string): void {
  this._llmAdapterStatus = "failed";
  this._llmAdapterFailureReason = reason;
}
```

### ステップ5: plan() にエラーレスポンス分岐を追加する

```typescript
async plan(input: RuntimeSkillCreatorPlanInput): Promise<RuntimeSkillCreatorPlanResponse> {
  if (this._llmAdapterStatus === "failed") {
    const isApiKeyError = this._llmAdapterFailureReason
      && /api.?key|ANTHROPIC_API_KEY/i.test(this._llmAdapterFailureReason);
    return {
      success: false,
      error: isApiKeyError
        ? "APIキーを設定してください"
        : this._llmAdapterFailureReason ?? "LLMAdapter の初期化に失敗しました",
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

  // 既存の plan ロジック（変更なし）
  // 正常レスポンスに adapterStatus を付与
}
```

### ステップ6: ipc/index.ts の catch ブロックを拡張する

```typescript
// 934-946行の改修
if (runtimeSkillCreatorService) {
  void (async () => {
    try {
      const adapter = await LLMAdapterFactory.getAdapter("anthropic");
      runtimeSkillCreatorService.setLLMAdapter(adapter);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn("[IPC] LLMAdapter initialization failed:", reason);
      runtimeSkillCreatorService.setLLMAdapterFailed(reason);
    }
  })();
}
```

### ステップ7: ユニットテストを作成する

- Phase 4 の test matrix に従い、ステータス遷移とエラーレスポンスのテストを作成する
- `vitest` で既存テストファイルにテストケースを追加する
- llmAdapter の mock を使用する

## 統合テスト連携

- Phase 6 でタイミング競合や連続呼び出しの edge case を追加する
- Phase 7 で AC-1〜AC-6 の coverage を確認する

## 実装完了の判断

- `facade.llmAdapterStatus` が `"ready"` / `"initializing"` / `"failed"` を正しく返せる
- `facade.llmAdapterFailureReason` が失敗時の理由を返せる
- `plan()` がステータスに応じたエラーレスポンスを返せる
- `ipc/index.ts` の初期化失敗時にステータスが更新される
- 全テストケースが pass する
- 既存テストが pass する

## 成果物

| 成果物              | パス                        | 説明                         |
| ------------------- | --------------------------- | ---------------------------- |
| implementation plan | `phase-5-implementation.md` | 実装対象、責務、変更ポイント |

## 完了条件

- [ ] `LLMAdapterStatus` 型が shared types に追加されている
- [ ] `RuntimeSkillCreatorPlanResponse` にエラー関連フィールドが追加されている
- [ ] Facade にステータスプロパティと `setLLMAdapterFailed()` が追加されている
- [ ] `plan()` がステータスに応じたエラーレスポンスを返す
- [ ] `ipc/index.ts` の catch ブロックが `setLLMAdapterFailed()` を呼ぶ
- [ ] ユニットテストが全パターンを網羅する
- [ ] **本Phase内の全タスクを100%実行完了**

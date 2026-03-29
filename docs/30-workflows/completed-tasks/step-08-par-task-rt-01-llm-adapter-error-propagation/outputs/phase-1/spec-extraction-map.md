# Phase 1: Spec Extraction Map

## 現行コード → 要件 → AC 対応表

| #   | ファイル                                    | 行 / メソッド                      | 現行動作                                                                      | 問題                                     | 要件                                                                                            | AC         |
| --- | ------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| 1   | `apps/desktop/src/main/ipc/index.ts`        | 934-946行 fire-and-forget catch    | `console.warn` のみ。エラーは握りつぶされ、`llmAdapter` は `undefined` のまま | ユーザーに初期化失敗が伝わらない         | catch 内で `setLLMAdapterFailed(reason)` を呼びステータスを `"failed"` に遷移させる             | AC-1, AC-2 |
| 2   | `RuntimeSkillCreatorFacade.ts`              | `plan()` — `!this.llmAdapter` 分岐 | llmAdapter 未設定時に空 stub データを返す                                     | ユーザーは「機能が壊れている」と誤認する | `llmAdapterStatus` に応じて `{ success: false, error, errorCode, adapterStatus }` を返す        | AC-3, AC-4 |
| 3   | `packages/shared/src/types/skillCreator.ts` | `RuntimeSkillCreatorPlanResponse`  | error response union がなく、失敗状態の契約が曖昧                             | エラー状態を型で表現できない             | `RuntimeSkillCreatorPlanErrorResponse` を追加し `RuntimeSkillCreatorPlanResponse` を union 拡張 | AC-5       |
| 4   | `RuntimeSkillCreatorFacade.ts`              | クラス全体                         | `llmAdapterStatus` プロパティなし                                             | アダプターの状態を外部から観測できない   | `llmAdapterStatus` getter, `llmAdapterFailureReason` getter, `setLLMAdapterFailed()` を追加     | AC-1, AC-2 |
| 5   | `ipc/index.ts` + Facade                     | fire-and-forget パターン全体       | `void (async () => { ... })()` で IPC 登録をブロックしない                    | パターン自体は正しい（維持すべき）       | fire-and-forget パターンは維持。catch 内にステータス更新を追加するのみ                          | AC-6       |

## AC → テスト観点マッピング

| AC   | テスト観点                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------- |
| AC-1 | Facade 生成直後 `"initializing"` / `setLLMAdapter()` 後 `"ready"` / `setLLMAdapterFailed()` 後 `"failed"` |
| AC-2 | `llmAdapterFailureReason` が失敗理由を保持 / `setLLMAdapter()` 後に `null` クリア                         |
| AC-3 | `plan()` が `"failed"` / `"initializing"` 時に `success: false` レスポンスを返す                          |
| AC-4 | API key エラー時に "APIキーを設定してください"、その他は具体的理由                                        |
| AC-5 | レスポンスに `adapterStatus` フィールドが含まれる                                                         |
| AC-6 | 既存テストが pass / fire-and-forget パターン維持                                                          |

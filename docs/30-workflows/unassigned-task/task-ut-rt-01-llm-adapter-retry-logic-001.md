# TASK-UT-RT-01-LLM-ADAPTER-RETRY-LOGIC-001

## 1. メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | TASK-UT-RT-01-LLM-ADAPTER-RETRY-LOGIC-001 |
| 種別     | follow-up / feature                       |
| 優先度   | Medium                                    |
| 親タスク | TASK-RT-01                                |
| 作成日   | 2026-03-29                                |
| 状態     | open                                      |

## 2. 背景

TASK-RT-01 で `LLMAdapterStatus` の状態遷移（`initializing` → `ready` / `failed`）を実装したが、`failed` 状態からの復帰パス（`failed` → `ready`）が未実装のまま残っている。

現状では一度 `failed` になると `RuntimeSkillCreatorFacade` のライフサイクル内でリトライする手段がなく、ユーザーが API キーを設定し直しても `plan()` 呼び出しが `LLM_ADAPTER_FAILED` エラーを返し続ける。

### 苦戦箇所（TASK-RT-01 より引継ぎ）

- TASK-RT-01 の実装時、`setLLMAdapterFailed()` の設計段階で `failed` → `ready` への復帰パスを検討したが、「ユーザー操作トリガーのタイミング設計が複雑になる」と判断し意図的にスコープ外とした。
- 復帰の契機として「APIキー設定変更イベント」を捕捉する必要があるが、その IPC チャネルと `RuntimeSkillCreatorFacade` の接続設計が未定。

## 3. 実施スコープ

- `RuntimeSkillCreatorFacade` に `retryLLMAdapter()` または状態リセットメソッドを追加する
- `failed` 状態でユーザーが API キーを再設定した際に `LLMAdapterFactory.getAdapter()` を再試行できるようにする
- 復帰成功時: `_llmAdapterStatus` を `"ready"` に遷移
- 復帰失敗時: `_llmAdapterStatus` は `"failed"` のまま、`_llmAdapterFailureReason` を更新
- IPC ハンドラー側（`ipc/index.ts`）でリトライトリガーを受け取れるようにする

### スコープ外

- UI 側のリトライボタン実装（TASK-RT-02 と協調して別タスク化）
- 自動リトライ（インターバル等）

## 4. 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `retryLLMAdapter()` メソッド追加
- `apps/desktop/src/main/ipc/index.ts` — リトライ IPC ハンドラー追加
- `packages/shared/src/types/skillCreator.ts` — リトライ関連型追加（必要に応じて）
- テスト: `RuntimeSkillCreatorFacade.adapter-status.test.ts` にリトライシナリオ追加

## 5. 完了条件

- `failed` 状態の Facade インスタンスで `retryLLMAdapter()` を呼び出すと `LLMAdapterFactory.getAdapter()` が再実行される
- 再試行成功時に `_llmAdapterStatus` が `"ready"` に遷移する
- 再試行失敗時に `_llmAdapterStatus` が `"failed"` のままで `_llmAdapterFailureReason` が更新される
- 既存の `plan()` / `execute()` / `improve()` テストがリグレッションなし

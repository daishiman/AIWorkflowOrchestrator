# Implementation Guide — TASK-RT-01: LLM Adapter Error Propagation

## Part 1: 中学生レベル概念説明

AI にスキルを作ってもらうには、AI のサービスにつなぐための「鍵」（API キー）が必要です。

**今まで**: 鍵がないとき、エラーが見えず空っぽの結果が返ってきて「壊れてる？」と思ってしまう状態でした。

**これから**: 鍵がないときは「鍵を設定してください」と教えてくれるようになります。

**例え**: レストランで注文したのに料理が来ない（今まで）→「申し訳ありません、材料がありません」と教えてくれる（これから）。

---

## Part 2: 技術詳細

### LLMAdapterStatus 型と遷移

```
type LLMAdapterStatus = "ready" | "initializing" | "failed";
```

- `initializing` → `ready`: `setLLMAdapter()` 成功時
- `initializing` → `failed`: `LLMAdapterFactory.getAdapter()` が throw した時

### RuntimeSkillCreatorFacade 変更

- `_llmAdapterStatus: LLMAdapterStatus` — 初期値 `"initializing"`
- `_llmAdapterFailureReason: string | null` — 失敗理由保持
- `setLLMAdapterFailed(reason: string)` — status を `"failed"` に遷移し reason を保持
- constructor で `deps.llmAdapter` 存在時に status を `"ready"` に初期化

### plan() エラーレスポンス分岐

| status           | errorCode                  | メッセージ                                            |
| ---------------- | -------------------------- | ----------------------------------------------------- |
| `"failed"`       | `LLM_ADAPTER_FAILED`       | `toActionableMessage()` で判定したメッセージ          |
| `"initializing"` | `LLM_ADAPTER_INITIALIZING` | 「LLMAdapter の初期化中です。しばらくお待ちください」 |

### toActionableMessage()

- reason に `API key` / `api_key` / `ANTHROPIC_API_KEY` / `apikey` が含まれる → 「APIキーを設定してください」
- reason が null / 空文字 → デフォルトメッセージ
- その他 → reason そのまま返却

### ipc/index.ts 変更

catch ブロックに `runtimeSkillCreatorService.setLLMAdapterFailed(reason)` を追加。fire-and-forget パターンと `console.warn` は維持。

### 型拡張

- `RuntimeSkillCreatorPlanResponse` union に `RuntimeSkillCreatorPlanErrorResponse` を追加
- `RuntimeSkillCreatorPlanResult` に `adapterStatus?: LLMAdapterStatus` を追加（後方互換）

### テスト

- 実装時点の記録では 7 ファイル 101 テスト（新規 26 テスト `adapter-status.test.ts`）を実施
- 本レビュー環境では `esbuild` の arch mismatch により再実行は未完了
- ステータス遷移、エラーレスポンス、toActionableMessage edge cases、タイミング競合、既存互換性をカバー

### Phase 11 証跡

NON_VISUAL タスクのため、証跡はスクリーンショットではなく IPC 応答とログで管理する。

- 判定方針: `outputs/phase-11/screenshot-plan.json`
- 実施結果: `outputs/phase-11/manual-test-result.md`
- walkthrough 所見: `outputs/phase-11/manual-test-report.md`
- 発見事項: `outputs/phase-11/discovered-issues.md`

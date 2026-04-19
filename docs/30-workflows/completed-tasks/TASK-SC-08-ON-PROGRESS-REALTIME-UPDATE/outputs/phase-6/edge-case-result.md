# 異常系テスト結果

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 6                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 異常系テストの目的

正常系（既知 phase → 期待 stage）以外の入力・状態に対して、システムが適切に振る舞うことを確認する。

---

## 2. 未知 phase フォールバックテスト

### テスト結果

| 入力 phase        | 期待値       | 実際の値     | 結果 | 備考                                |
| ----------------- | ------------ | ------------ | ---- | ----------------------------------- |
| `"unknown-phase"` | `"planning"` | `"planning"` | PASS | 未登録キー → フォールバック         |
| `""`              | `"planning"` | `"planning"` | PASS | 空文字 → フォールバック             |
| `"   "`           | `"planning"` | `"planning"` | PASS | 空白のみ → フォールバック           |
| `"PLANNING"`      | `"planning"` | `"planning"` | PASS | 大文字 → フォールバック             |
| `"null"`          | `"planning"` | `"planning"` | PASS | 文字列 "null" → フォールバック      |
| `"undefined"`     | `"planning"` | `"planning"` | PASS | 文字列 "undefined" → フォールバック |
| `"123"`           | `"planning"` | `"planning"` | PASS | 数字文字列 → フォールバック         |
| `"plan ning"`     | `"planning"` | `"planning"` | PASS | スペース含む → フォールバック       |
| `"generate"`      | `"planning"` | `"planning"` | PASS | 部分一致でもフォールバック          |

**全 9 ケースで `"planning"` へのフォールバックが正常動作。**

---

## 3. error phase 特殊処理テスト

`phase === "error"` は `PHASE_TO_STAGE` を経由せず、専用の error 処理パスを通る。

### テスト結果

| 入力 phase | message               | 期待 stage | 期待 errorCode      | 結果 |
| ---------- | --------------------- | ---------- | ------------------- | ---- |
| `"error"`  | `"API_KEY not found"` | `"error"`  | `"API_KEY_NOT_SET"` | PASS |
| `"error"`  | `"NETWORK timeout"`   | `"error"`  | `"NETWORK_ERROR"`   | PASS |
| `"error"`  | `"generation failed"` | `"error"`  | `"LLM_ERROR"`       | PASS |
| `"error"`  | `"api key invalid"`   | `"error"`  | `"API_KEY_NOT_SET"` | PASS |
| `"error"`  | `"network error"`     | `"error"`  | `"NETWORK_ERROR"`   | PASS |

**error phase は `mapPhaseToStage` を経由せず、直接 `setStage("error")` が呼び出される。フォールバックへの影響なし。**

---

## 4. skillCreatorAPI 未定義時のテスト

`window.skillCreatorAPI` が未定義の場合、onProgress が呼び出されないケース。

### テスト結果

| 条件                                             | 期待動作                     | 実際の動作                 | 結果 |
| ------------------------------------------------ | ---------------------------- | -------------------------- | ---- |
| `window.skillCreatorAPI` が undefined            | useEffect が早期 return する | 早期 return、エラーなし    | PASS |
| `window.skillCreatorAPI.onProgress` が undefined | useEffect が早期 return する | 早期 return、エラーなし    | PASS |
| API が後から注入される                           | 再レンダリング時に接続       | 依存配列による再実行で接続 | PASS |

---

## 5. 連続 phase 受信テスト

短時間に複数の phase イベントが連続して届くケース。

### テスト結果

| シナリオ                                 | 期待動作                              | 結果 |
| ---------------------------------------- | ------------------------------------- | ---- |
| `loading-skill` → `analyzing` の順に受信 | 最後の `analyzing` の状態が反映される | PASS |
| `improving` → `done` の順に受信          | 最後の `done` の状態が反映される      | PASS |
| `engine-selection` → `error` の順に受信  | `error` 状態になり error が設定される | PASS |
| 同一 phase を 10 回連続受信              | Store が 10 回更新されるが UI は安定  | PASS |

---

## 6. アンマウント後の受信テスト（P5対策確認）

コンポーネントがアンマウントされた後に onProgress が呼び出されるケース。

### テスト結果

| シナリオ                                   | 期待動作                                       | 結果 |
| ------------------------------------------ | ---------------------------------------------- | ---- |
| アンマウント後にコールバックが呼び出される | クリーンアップ関数でリスナー解除済みのため無視 | PASS |
| アンマウント後に Store 更新が発生しない    | `resetProgress` 呼び出し済みのため変化なし     | PASS |
| クリーンアップ関数が正確に 1 回呼ばれる    | `mockCleanup` が `toHaveBeenCalledOnce()`      | PASS |

---

## 7. 型境界テスト

`PHASE_TO_STAGE` の値が `StreamingGenerationStage` 型の有効値のみであることの確認。

### テスト結果

| 確認項目                                             | 結果 |
| ---------------------------------------------------- | ---- |
| 全 9 エントリの値が有効な `StreamingGenerationStage` | PASS |
| TypeScript コンパイラが型エラーを報告しない          | PASS |
| 無効な stage 値（例: `"unknown-stage"`）が含まれない | PASS |

---

## 8. 異常系テスト総括

| カテゴリ                  | テストケース数 | PASS   | FAIL  |
| ------------------------- | -------------- | ------ | ----- |
| 未知 phase フォールバック | 9              | 9      | 0     |
| error phase 特殊処理      | 5              | 5      | 0     |
| API 未定義時              | 3              | 3      | 0     |
| 連続 phase 受信           | 4              | 4      | 0     |
| アンマウント後（P5対策）  | 3              | 3      | 0     |
| 型境界                    | 3              | 3      | 0     |
| **合計**                  | **27**         | **27** | **0** |

**全 27 件の異常系テストが PASS。未知 phase は必ず `"planning"` にフォールバックし、UI が壊れない。**

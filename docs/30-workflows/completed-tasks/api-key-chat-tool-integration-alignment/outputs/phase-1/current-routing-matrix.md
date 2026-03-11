# Phase 1 配線事実確認マトリクス

## Before

| 観点                 | 実装                                                          |
| -------------------- | ------------------------------------------------------------- |
| Settings APIキー保存 | `api-keys` ストアへ保存                                       |
| LLM実行時キー参照    | `llm-api-keys` ストアのみ参照                                 |
| `ai.chat` 選択値     | `AIChatRequest` に provider/model なし。Main 側フォールバック |
| AuthKey表示          | `auth-key:exists` は `exists: boolean` のみ                   |

## After（目標）

| 観点             | 目標契約                                            |
| ---------------- | --------------------------------------------------- |
| Settings/LLMキー | 単一ソース（`api-keys`）を参照                      |
| `ai.chat`        | request で provider/model 指定可能。`llm.*` と一致  |
| 選択状態同期     | Renderer → Main の `llm:set-selected-config` で同期 |
| AuthKey表示      | `source` を返し、UIバッジを厳密表示                 |

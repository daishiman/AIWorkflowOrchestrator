# Phase 1 要件定義書 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## タスクID: TASK-LLM-MOD-01

## 要件一覧

### R-01: OpenAI モデル更新

- 削除: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`
- 追加: `gpt-5.4` (default, 1050000), `gpt-5.4-mini` (1050000), `gpt-5.4-nano` (1050000), `gpt-5.4-pro` (1050000), `o3` (200000), `o4-mini` (200000)

### R-02: Anthropic モデル更新

- 削除: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307`
- 追加: `claude-sonnet-4-6` (default, 200000), `claude-opus-4-6` (200000), `claude-haiku-4-5` (200000)

### R-03: Google モデル更新

- 削除: `gemini-1.5-pro`, `gemini-1.5-flash`
- 追加: `gemini-3-flash-preview` (default, 1048576), `gemini-3.1-pro-preview` (1048576), `gemini-3.1-flash-lite-preview` (1048576)

### R-04: xAI モデル更新

- 削除: `grok-beta`
- 追加: `grok-4-1-fast-non-reasoning` (default, 2097152), `grok-4-1-fast-reasoning` (2097152), `grok-3-mini` (131072)

### R-05: OpenRouter（変更なし）

### R-06: description フィールド追加

- `description?: string` を PROVIDER_CONFIGS の型定義に追加

### R-07: inferProviderId パターン追加

- `o3`/`o4` プレフィックスが既にコードに存在するため追加不要

## 受入基準

| ID    | 受入基準                                                  |
| ----- | --------------------------------------------------------- |
| AC-01 | OpenAI: `gpt-5.4` が `isDefault: true`                    |
| AC-02 | Anthropic: `claude-sonnet-4-6` が `isDefault: true`       |
| AC-03 | Google: `gemini-3-flash-preview` が `isDefault: true`     |
| AC-04 | xAI: `grok-4-1-fast-non-reasoning` が `isDefault: true`   |
| AC-05 | 旧モデルIDが PROVIDER_CONFIGS に存在しない                |
| AC-06 | `inferProviderId("o3")` → `"openai"`                      |
| AC-07 | `inferProviderId("o4-mini")` → `"openai"`                 |
| AC-08 | `inferProviderId("gpt-5.4")` → `"openai"`                 |
| AC-09 | 各モデルに `description` フィールドが存在（空文字列不可） |
| AC-10 | TypeScript コンパイルエラーが 0 件                        |
| AC-11 | 既存の `inferProviderId` 返り値が変更されない             |

## スコープ外

- OpenRouter のモデル定義変更
- LLMAdapterFactory の変更
- Renderer 側の変更
- Preload 型定義の変更
- API キー検証ロジックの変更

# Phase 1: 要件定義サマリー - TASK-LLM-MOD-03

## P50 チェック: 既実装状態の調査結果

- `GoogleAdapter.ts` の `formatContents` メソッドは systemPrompt を `{ role: "user", parts: [{ text: "System: ..." }] }` として `contents` 配列の先頭に追加するワークアラウンドを採用している
- Gemini API の正式な `system_instruction` フィールドを使用していない
- 既存テスト `ADP-012` の `"should prepend systemPrompt as user message"` はワークアラウンドを前提とした期待値を持ち、変更後は Red になる

## 機能要件 (FR)

| FR番号   | 内容                                             |
| -------- | ------------------------------------------------ |
| FR-03-01 | `formatContents` から systemPrompt を分離        |
| FR-03-02 | `buildRequestBody` ヘルパーメソッド追加          |
| FR-03-03 | `sendChat` / `streamChat` のリクエストボディ更新 |
| FR-03-04 | APIバージョン判断（v1beta 採用）                 |

## 受け入れ基準 (AC)

| AC番号   | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| AC-05    | systemPrompt を `system_instruction` フィールドで送信する         |
| AC-06    | systemPrompt なしの場合 `system_instruction` を省略する           |
| AC-03-01 | `formatContents` が `contents` に systemPrompt を含めない         |
| AC-03-02 | `buildRequestBody` が systemPrompt ありの場合に正しいボディを返す |
| AC-03-03 | `buildRequestBody` が systemPrompt なしの場合に正しいボディを返す |
| AC-03-04 | `sendChat` が `buildRequestBody` を使用する                       |
| AC-03-05 | `streamChat` が `buildRequestBody` を使用する                     |
| AC-07    | `pnpm typecheck` が PASS する                                     |

## スコープ

### 含む

- `GoogleAdapter.ts` の `formatContents`, `buildRequestBody`, `sendChat`, `streamChat`, `baseUrl` 変更
- `GoogleAdapter.test.ts` のテスト更新・追加

### 含まない

- `PROVIDER_CONFIGS` のモデル定義更新（Task01 スコープ）
- Renderer / UI の変更
- 他アダプターの変更

## 完了条件

- [x] 全機能要件が明文化されている（FR-03-01〜FR-03-04）
- [x] 受け入れ基準が検証可能な形式で定義されている
- [x] スコープの含む/含まないが明確に区分されている
- [x] 関連ファイル一覧が特定されている
- [x] APIバージョン判断の根拠が記録されている
- [x] 本Phase内の全タスクを100%実行完了

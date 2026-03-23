# Phase 1: 要件定義 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |

## 目的

GoogleAdapter の systemPrompt 処理を `user` ロール埋め込みワークアラウンドから Gemini API 公式の `system_instruction` フィールドに移行するための要件を明文化し、受け入れ基準を定義する。

## P50チェック: 既実装状態の調査

```bash
# 現在の GoogleAdapter の実装状態確認
grep -n "systemPrompt\|system_instruction\|formatContents\|buildRequestBody" \
  apps/desktop/src/main/adapters/llm/GoogleAdapter.ts

# 既存テストの確認
grep -n "systemPrompt\|system_instruction\|prepend" \
  apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**調査結果**: `GoogleAdapter.ts` の `formatContents` メソッドは systemPrompt を `{ role: "user", parts: [{ text: "System: ..." }] }` として `contents` 配列の先頭に追加するワークアラウンドを採用している。Gemini API の正式な `system_instruction` フィールドを使用していない。既存テスト `ADP-012` の `"should prepend systemPrompt as user message"` はこのワークアラウンドを前提とした期待値を持ち、変更後は Red になる。

## 機能要件 (FR)

### FR-03-01: formatContents メソッドのリファクタリング

`formatContents` メソッドを会話メッセージのみを返す純粋な変換関数に変更する。

- 変更前: systemPrompt を `user` ロールとして `contents` 配列の先頭に挿入する
- 変更後: `request.messages` をそのまま Gemini 形式（`role`/`parts`）に変換するだけにする
- `assistant` ロールは Gemini の `model` ロールに変換することを維持する

### FR-03-02: buildRequestBody ヘルパーメソッド追加

`sendChat` と `streamChat` の両メソッドで重複しているリクエストボディ構築ロジックを `buildRequestBody` ヘルパーメソッドとして共通化する。

- `contents`: `this.formatContents(request)` の結果を設定する
- `generationConfig.temperature`: `request.temperature` を設定する
- `generationConfig.maxOutputTokens`: `request.maxTokens` を設定する
- `system_instruction`: `request.systemPrompt` が存在する場合のみ `{ parts: [{ text: request.systemPrompt }] }` を設定する
- `request.systemPrompt` が存在しない場合、`system_instruction` フィールドはボディに含めない

### FR-03-03: sendChat / streamChat のリクエストボディ更新

`sendChat` と `streamChat` のインライン `JSON.stringify({ contents: ..., generationConfig: ... })` を `JSON.stringify(this.buildRequestBody(request))` に置き換える。

### FR-03-04: APIバージョン判断

`system_instruction` フィールドが Google Generative AI API の `v1` で使用可能かどうかを `research/google-models.md` の調査結果に基づいて判断する。

| 判断                                    | 対応                                       |
| --------------------------------------- | ------------------------------------------ |
| `v1` で `system_instruction` が使用可能 | `baseUrl` の変更なし（`v1` を維持）        |
| `v1` で `system_instruction` が使用不可 | `baseUrl` のデフォルト値を `v1beta` に変更 |

**調査結果** (`research/google-models.md` より): `system_instruction` は Gemini 2.5 以降で `v1beta` で確実に使用可能。Gemini 3系（`gemini-3-flash-preview`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`）も同様に `v1beta` が推奨。`v1` でも使用可能かは要確認。安全策として `v1beta` を使用する方針を採用する。また Gemini 3系では `thinking_level` および Thought Signatures が新機能として追加されているが、本タスクのスコープ外とし、後続タスクで対応する。

## 非機能要件 (NFR)

### NFR-03-01: 型安全性

- `buildRequestBody` の戻り値型は `Record<string, unknown>` とする
- `system_instruction` フィールドを条件付きで追加する際に型アサーションを使用しない

### NFR-03-02: テスト網羅性

- `buildRequestBody` の単体テストが存在すること
- systemPrompt ありの場合に `system_instruction` フィールドが送信されることをテストする
- systemPrompt なしの場合に `system_instruction` フィールドが省略されることをテストする
- `sendChat` と `streamChat` の両方で `system_instruction` が正しく動作することをテストする

### NFR-03-03: 後方互換性

- systemPrompt を指定しないリクエストの動作は変更しない
- 既存の `contents` 形式（`role`/`parts` 構造）は維持する
- `generationConfig` のフィールド（`temperature`、`maxOutputTokens`）は維持する

## 受け入れ基準 (AC)

| AC番号   | 内容                                                                       | 検証方法                                                                                  |
| -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| AC-05    | GoogleAdapter が systemPrompt を `system_instruction` フィールドで送信する | テスト: リクエストボディキャプチャで `body.system_instruction.parts[0].text` が一致       |
| AC-06    | GoogleAdapter が systemPrompt なしの場合に `system_instruction` を省略する | テスト: リクエストボディキャプチャで `body.system_instruction` が `undefined`             |
| AC-03-01 | `formatContents` が `contents` に systemPrompt を含めない                  | テスト: `body.contents` にシステムプロンプトテキストが含まれないことを確認                |
| AC-03-02 | `buildRequestBody` が systemPrompt ありの場合に正しいボディを返す          | 単体テスト: `buildRequestBody` の戻り値を直接検証                                         |
| AC-03-03 | `buildRequestBody` が systemPrompt なしの場合に正しいボディを返す          | 単体テスト: `buildRequestBody` の戻り値に `system_instruction` が含まれない               |
| AC-03-04 | `sendChat` が `buildRequestBody` を使用してリクエストを送信する            | テスト: `sendChat` のリクエストボディキャプチャで `system_instruction` フィールドを確認   |
| AC-03-05 | `streamChat` が `buildRequestBody` を使用してリクエストを送信する          | テスト: `streamChat` のリクエストボディキャプチャで `system_instruction` フィールドを確認 |
| AC-07    | `pnpm typecheck` が PASS する                                              | CI: TypeScript コンパイルエラーがゼロ                                                     |

## スコープ

### 含む

- `GoogleAdapter.ts` の `formatContents` メソッドリファクタリング
- `GoogleAdapter.ts` の `buildRequestBody` メソッド追加
- `GoogleAdapter.ts` の `sendChat` / `streamChat` のリクエストボディ更新
- `GoogleAdapter.ts` の `baseUrl` デフォルト値の APIバージョン判断・変更
- `GoogleAdapter.test.ts` のテストケース更新（既存 Red テストの修正と新規テスト追加）

### 含まない

- `PROVIDER_CONFIGS` のモデル定義更新（Task01 のスコープ）
- Renderer 側 UI の変更
- `checkHealth` メソッドの変更
- `BaseLLMAdapter` の変更
- OpenAI、Anthropic、xAI アダプターの変更

## 関連ファイル一覧

| ファイル                                                             | 変更種別 | 理由                               |
| -------------------------------------------------------------------- | -------- | ---------------------------------- |
| `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`                | 変更必須 | 本タスクの対象ファイル             |
| `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | 変更必須 | 既存テストの修正と新規テストの追加 |

## 参照資料

| 資料名           | パス                               | 内容                                              |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| Google API調査   | `../../research/google-models.md`  | Gemini 最新モデル・API仕様・v1/v1betaトレードオフ |
| Task03 概要      | `./index.md`                       | タスク概要・完了条件                              |
| 全体要件定義     | `../../phase-1-requirements.md`    | FR-04: GoogleAdapter system_instruction 対応      |
| コード品質ルール | `.claude/rules/02-code-quality.md` | TypeScript型安全・テスト基準                      |

## 成果物

| 成果物     | パス                                    | 説明            |
| ---------- | --------------------------------------- | --------------- |
| 要件定義書 | `phase-1-requirements.md`（本ファイル） | FR・NFR・AC定義 |

## 完了条件

- [x] 全機能要件が明文化されている（FR-03-01〜FR-03-04）
- [x] 受け入れ基準が検証可能な形式で定義されている（AC-05、AC-06、AC-03-01〜AC-03-05、AC-07）
- [x] スコープの含む/含まないが明確に区分されている
- [x] 関連ファイル一覧が特定されている
- [x] APIバージョン判断の根拠が記録されている

## 統合テスト連携

本タスク（Task03）は Task02（AnthropicAdapter更新）と並列実行可能。Task04（テスト更新）は本タスク完了後に開始する。Task04 では本タスクで更新した `GoogleAdapter.test.ts` の内容を参照してテスト期待値の整合性を確認すること。

## 次のPhase

Phase 2: 設計

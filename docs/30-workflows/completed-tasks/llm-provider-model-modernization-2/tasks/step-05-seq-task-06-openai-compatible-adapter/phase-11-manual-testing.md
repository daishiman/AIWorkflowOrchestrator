# Phase 11: 手動テスト -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 11                        |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 10（最終レビュー）  |

## 目的

Electron アプリを起動し、`OpenAICompatibleAdapter` を経由した OpenAI / xAI / OpenRouter の各プロバイダーへのチャット送信が正常に動作することを手動で確認する。CLI 環境での自動代替確認手段も記載する。

## 実行タスク

### Task 11-1: 手動確認シナリオ（Electron アプリ起動時）

Electron アプリを起動できる環境がある場合、以下のシナリオを実施する:

#### シナリオ MT-01: OpenAI プロバイダーでのチャット送信

1. アプリを起動する
2. Settings で OpenAI の API キーを設定する
3. Chat View で Provider を "OpenAI"、Model を "GPT-4.1" に設定する
4. メッセージを送信し、レスポンスが返ることを確認する
5. ストリーミングで文字が逐次表示されることを確認する

#### シナリオ MT-02: xAI プロバイダーでのチャット送信

1. Settings で xAI の API キーを設定する
2. Chat View で Provider を "xAI"、Model を "Grok 3" に設定する
3. メッセージを送信し、レスポンスが返ることを確認する

#### シナリオ MT-03: OpenRouter プロバイダーでのチャット送信

1. Settings で OpenRouter の API キーを設定する
2. Chat View で Provider を "OpenRouter" に設定する
3. メッセージを送信し、レスポンスが返ることを確認する
4. DevTools の Network タブで `HTTP-Referer` と `X-Title` ヘッダーが送信されていることを確認する

#### シナリオ MT-04: ヘルスチェック確認

1. Settings で各プロバイダーの API キー設定画面を開く
2. 接続テスト（ヘルスチェック）ボタンを押す
3. "Connected" ステータスが表示されることを確認する

#### シナリオ MT-05: Anthropic / Google が影響を受けていないことの確認

1. Provider を "Anthropic" に切り替える
2. メッセージを送信し、レスポンスが返ることを確認する
3. Provider を "Google" に切り替える
4. メッセージを送信し、レスポンスが返ることを確認する

### Task 11-2: CLI 環境での自動代替確認

Electron アプリが起動できない CLI 環境では、以下の自動テストで手動確認を代替する。

#### 代替確認 MT-A: アダプターテスト全実行

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/ --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|OpenAI|xAI|OpenRouter|sendChat|streamChat|checkHealth)"
```

#### 代替確認 MT-B: ファクトリ登録の確認

```bash
# OPENAI_COMPATIBLE_CONFIGS に 3 プロバイダーが定義されていることを確認
grep -c "providerId:" apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts
# 期待値: 3（openai, xai, openrouter）

# extraHeaders が OpenRouter にのみ存在することを確認
grep -A2 "extraHeaders" apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts
```

#### 代替確認 MT-C: 既存ハンドラーテストの影響なし確認

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts --reporter=verbose 2>&1 | tail -5
```

### Task 11-3: 手動テスト結果の記録

| シナリオ | 実施方法       | 結果      | 備考 |
| -------- | -------------- | --------- | ---- |
| MT-01    | 実機/代替 MT-A | PASS/FAIL |      |
| MT-02    | 実機/代替 MT-A | PASS/FAIL |      |
| MT-03    | 実機/代替 MT-A | PASS/FAIL |      |
| MT-04    | 実機/代替 MT-A | PASS/FAIL |      |
| MT-05    | 実機/代替 MT-C | PASS/FAIL |      |

## 参照資料

| 資料名                  | パス                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Phase 10 最終レビュー   | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-10-final-review.md` |
| OpenAICompatibleAdapter | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts`                                                                   |
| LLMAdapterFactory       | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                                                         |
| 既知の落とし穴 P53      | `.claude/rules/06-known-pitfalls.md`（CLI 環境でのスクリーンショット取得制約）                                                    |

## 成果物

| 成果物             | パス                                                                                                                                             | 形式     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 手動テスト結果記録 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-11/manual-test-results.md` | Markdown |

## 完了条件

- [x] MT-01 から MT-04 の確認（実機または自動代替）が全て PASS した
- [x] MT-05 で Anthropic / Google が影響を受けていないことを確認した
- [x] OpenRouter の extraHeaders（HTTP-Referer, X-Title）が送信されることを確認した
- [x] 手動テスト結果を記録した

## 次の Phase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）

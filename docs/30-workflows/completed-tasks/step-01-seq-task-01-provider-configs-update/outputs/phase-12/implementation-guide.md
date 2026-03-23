# 実装ガイド — TASK-LLM-MOD-01: PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## Part 1: 中学生レベル概念説明

**AIが話しかける相手（AIモデル）を最新版に切り替えた話**

AIチャットアプリは、メッセージを送るとAIモデルという「頭脳」が考えて返事をしてくれます。この「頭脳」にはOpenAIのGPTやAnthropicのClaudeなど、複数の種類があります。

プログラムの中には「どの頭脳が使えるか」のリストが書いてありました。しかし時間が経つにつれ、新しいバージョンの頭脳が登場し、古いリストでは「最新の頭脳」が選べない状態になっていました。

今回やったことは、その「頭脳のリスト」を最新版に書き換えることです。例えば:

- 「GPT-4o」という古い頭脳を「GPT-5.4」という新しい頭脳に入れ替えた
- 「Claude 3.5 Sonnet」を「Claude Sonnet 4.6」に入れ替えた

さらに、「このモデル名はどの会社の頭脳か」を判断するプログラム（`inferProviderId`）が、新しいモデル名（`o3`, `o4-mini`）も正しく認識できることを確認しました。

---

## Part 2: 開発者向け技術詳細

### 変更ファイル

`apps/desktop/src/main/handlers/llm.ts`（1ファイルのみ）

### 変更内容

1. **型定義変更**: `PROVIDER_CONFIGS` のモデル型に `description?: string` を追加

2. **モデル定義差し替え**:
   | プロバイダー | 変更前 | 変更後 | 差分 |
   |---|---|---|---|
   | OpenAI | 3モデル (gpt-4o, gpt-4o-mini, gpt-4-turbo) | 6モデル (gpt-5.4, gpt-5.4-mini, gpt-5.4-nano, gpt-5.4-pro, o3, o4-mini) | +3 |
   | Anthropic | 3モデル (claude-3-5-sonnet-_, claude-3-opus-_, claude-3-haiku-\*) | 3モデル (claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5) | 0 |
   | Google | 2モデル (gemini-1.5-pro, gemini-1.5-flash) | 3モデル (gemini-3.1-flash-lite-preview, gemini-3-flash-preview, gemini-3.1-pro-preview) | +1 |
   | xAI | 1モデル (grok-beta) | 3モデル (grok-3-mini, grok-4-1-fast-non-reasoning, grok-4-1-fast-reasoning) | +2 |
   | OpenRouter | 4モデル | 4モデル（変更なし） | 0 |

3. **inferProviderId**: 変更なし（既存コードで `o3`/`o4` パターン対応済み）

### 設計判断

- `description` をオプショナル（`?:`）にすることで OpenRouter の既存モデル定義との後方互換を維持
- `LLMProvider` 共有型への `description` 追加は本タスクのスコープ外（別タスク化: U-02）

### テスト追加

`apps/desktop/src/main/handlers/__tests__/llm.test.ts` に38テストケースを追加:

- T-01〜T-06 (17件): PROVIDER_CONFIGS 検証（新モデル存在・旧モデル非存在・isDefault・contextWindow・description・isDefault一意性）
- T-07〜T-08 (4件): inferProviderId の o3/o4 パターン確認
- T-09〜T-13 (17件): テスト拡充（OpenRouter維持・contextWindow精度・プロバイダー総数・モデル数・handleSendChat新モデル使用）

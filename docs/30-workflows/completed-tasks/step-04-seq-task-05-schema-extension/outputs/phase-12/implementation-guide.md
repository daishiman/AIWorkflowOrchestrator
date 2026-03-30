# Implementation Guide — TASK-LLM-MOD-05: 共有型スキーマ拡張

## Part 1: 中学生レベルの概念説明

AIモデルを選ぶ画面は、レストランのメニュー表のようなものです。

今まで、メニューには料理名と価格しか書いていませんでした（モデルID、モデル名のみ）。
でも、「このパスタって、どんな料理なの？」と思うお客さんもいますよね。

そこで、メニューの「説明文欄（description）」を追加しました。
これで「GPT-5.4の軽量版。高速・低コスト」のように、
各AIモデルの特徴を表示できるようになります。

今回は「メニューのテンプレートに説明文欄を作って、全メニューに説明文を書き込んだ」段階です。
まだ実際のメニュー表（UI画面）に説明文を表示する部分は完成していません。
それは次のタスク（TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY）でやります。

## Part 2: 開発者向け技術詳細

### 変更の概要

`PROVIDER_CONFIGS`（`packages/shared/src/types/llm/schemas/provider-registry.ts`）の
OpenRouter セクション（4モデル）に `description` フィールドを追加し、説明文を設定した。

### 変更点

1. `provider-registry.ts`: OpenRouter 4モデルに `description` 値を追加

### 変更不要だった部分

- `LLMModelSchema`（`provider.ts:30`）: `description: z.string().optional()` が既に定義済み
- `ProviderModelEntry`（`provider-registry.ts:22`）: `description?: string` が既に定義済み
- `handleGetProviders()`（`llm.ts:90-106`）: `models: [...config.models]` で自動伝搬するため変更不要
- OpenAI/Anthropic/Google/xAI の15モデル: 既に description 設定済み

### データフロー

```
PROVIDER_CONFIGS (provider-registry.ts) — description値あり
  ↓ @repo/shared から export
handleGetProviders() (llm.ts:90-106)
  models: [...config.models] — description をスプレッドコピーで含む
  ↓ LLMProvider[] として返却
IPC: LLM_GET_PROVIDERS
  ↓ contextBridge 経由
Renderer — model.description で参照可能
```

### テスト追加

| テストID     | ファイル           | 内容                                         |
| ------------ | ------------------ | -------------------------------------------- |
| TS-A-01~A-04 | `provider.test.ts` | LLMModelSchema の description バリデーション |
| TS-B-01~B-02 | `llm.test.ts`      | handleGetProviders の description 伝搬確認   |

### 仕様書との差異

タスク仕様書では `PROVIDER_CONFIGS` が `apps/desktop/src/main/handlers/llm.ts` にインライン定義されている想定だったが、
実際には `packages/shared/src/types/llm/schemas/provider-registry.ts` に SSoT として分離済み。
型定義も `ProviderModelEntry` インターフェースとして既に存在していた。

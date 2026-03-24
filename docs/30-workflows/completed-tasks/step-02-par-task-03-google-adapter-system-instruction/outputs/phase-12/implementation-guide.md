# 実装ガイド - TASK-LLM-MOD-03: GoogleAdapter system_instruction 対応

## Part 1: 中学生レベルの概念説明

### Gemini AI に「役割」を正しく伝える方法

お父さんやお母さんが新しいアルバイトの人に「あなたはカフェの接客係です。お客様には丁寧な言葉遣いで対応してください」と最初に説明する。これが `system_instruction` の役割です。

### 変更前の問題点

今まで Google の Gemini AI を使うとき、こんな風にしていました:

```
[ユーザー役 / "ねえ、あなたは丁寧な口調のアシスタントね、よろしく"]  <- 役割指示をこっそり混ぜていた
[ユーザー役 / "今日の天気は？"]
```

これは「受付の人にカンペを見せながら演技させる」ようなもので、本来の会話の流れとは違います。

### 変更後の正しい方法

Gemini API には専用の「役割指示フォーム」（`system_instruction`）があります:

```
[システム役割指示 / "あなたは丁寧な口調のアシスタントです"]  <- 専用フォームで指示
[ユーザー役 / "今日の天気は？"]  <- 純粋な会話だけ
```

受付の人にあらかじめ「マニュアル」を渡しておくイメージです。

### API バージョンの変更（v1 -> v1beta）

Gemini API には「安定版（v1）」と「ベータ版（v1beta）」があります。`system_instruction` は v1beta で確実に使えるため、接続先を変更しました。

---

## Part 2: 開発者向け技術詳細

### 変更ファイル

| ファイル                                                             | 変更内容         |
| -------------------------------------------------------------------- | ---------------- |
| `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`                | 本体実装         |
| `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | テスト更新・追加 |
| `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`     | MSW URL 修正     |

### 変更概要

1. `constructor` の `baseUrl` デフォルト値: `v1` -> `v1beta`
2. `formatContents`: systemPrompt の user ロール挿入ロジックを削除
3. `buildRequestBody`: private メソッドを新規追加（DRY 統合）
4. `sendChat` / `streamChat`: リクエストボディ構築を `buildRequestBody` に委譲

### buildRequestBody の設計

```typescript
private buildRequestBody(
  request: LLMChatRequestInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };
  if (request.systemPrompt?.trim()) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }
  return body;
}
```

- 戻り値型 `Record<string, unknown>`: `system_instruction` が条件付きのため Union 型の複雑化を回避
- `systemPrompt` が truthy（非空文字列）の場合のみ `system_instruction` を追加
- `sendChat` / `streamChat` の両方で共有

### テスト変更

- MSW モック URL: 全 14 箇所を `v1` -> `v1beta` に更新
- 削除: `"should prepend systemPrompt as user message"`
- 追加 (5件): ADP-012-SI-01~03, ADP-STREAM-SI-01, T6-01~03
- 合計: 19 テスト全 PASS

### Gemini API system_instruction 仕様

```json
{
  "system_instruction": {
    "parts": [{ "text": "システムプロンプトの内容" }]
  },
  "contents": [{ "role": "user", "parts": [{ "text": "ユーザーメッセージ" }] }],
  "generationConfig": { "temperature": 0.7, "maxOutputTokens": 4096 }
}
```
